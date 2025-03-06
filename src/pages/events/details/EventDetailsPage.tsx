import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { isPast } from "date-fns";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import EventHeader from "./components/EventHeader";
import EventDetails from "./components/EventDetails";
import OrganizationContact from "./components/OrganizationContact";
import VolunteerStatus from "./components/VolunteerStatus";
import RegisteredVolunteers from "./components/RegisteredVolunteers";

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: event, isLoading, isError, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Event not found");
      return data;
    },
    retry: 1,
    staleTime: 60000
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: volunteers } = useQuery({
    queryKey: ['event-volunteers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          registration_time,
          user_id,
          emergency_contact,
          dietary_restrictions,
          notes,
          profiles:user_id (
            full_name,
            phone,
            profile_image_url
          )
        `)
        .eq('event_id', id);

      if (error) throw error;
      console.log("Fetched volunteers:", data);
      return data;
    },
    enabled: !!id && userProfile?.role === 'organization'
  });

  useEffect(() => {
    if (isError) {
      toast.error("Event not found or has been deleted");
      navigate('/events');
    }
  }, [isError, navigate]);

  const handleRegister = async () => {
    if (!user) {
      toast.error("Please login to register for events");
      navigate("/login");
      return;
    }

    try {
      const { data: existing, error: checkError } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) {
        toast.error("You are already registered for this event");
        return;
      }

      if (event && event.current_volunteers >= event.volunteers_needed) {
        toast.error("Sorry, this event is full");
        return;
      }

      navigate(`/events/${id}/register`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteEvent = async () => {
    if (!user || !id) return;
    
    setIsDeleting(true);

    try {
      const { error: registrationsError } = await supabase
        .from('registrations')
        .delete()
        .eq('event_id', id);

      if (registrationsError) {
        console.error("Error deleting registrations:", registrationsError);
        throw registrationsError;
      }

      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('organization_id', user.id);

      if (eventError) {
        console.error("Error deleting event:", eventError);
        throw eventError;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['event', id] }),
        queryClient.invalidateQueries({ queryKey: ['organization-events'] }),
        queryClient.invalidateQueries({ queryKey: ['edit-event', id] }),
        queryClient.invalidateQueries({ queryKey: ['organization-registrations'] })
      ]);
      
      toast.success("Event deleted successfully");
      
      navigate('/events');
    } catch (error: any) {
      console.error("Delete event error:", error);
      toast.error(`Failed to delete event: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackToEvents = () => {
    navigate('/events');
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }
  
  if (!event) {
    return null; // Will be handled by the useEffect above
  }

  const eventDate = new Date(event.date);
  const isEventPast = isPast(eventDate);

  const spotsRemaining = event.volunteers_needed - (event.current_volunteers || 0);
  const isOrganization = userProfile?.role === 'organization';
  const canRegister = !isOrganization && spotsRemaining > 0 && !isEventPast;
  const isOwner = user?.id === event.organization_id;

  if (isEventPast && !isOwner) {
    toast.error("This event has already passed");
    navigate('/events');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/events')}
        className="mb-4"
      >
        ← Back to Events
      </Button>
      <Card className="max-w-3xl mx-auto p-8">
        {isEventPast && (
          <div className="mb-4 p-3 bg-amber-100 text-amber-800 rounded-md">
            This event has already passed
          </div>
        )}
        
        <EventHeader 
          title={event.title} 
          imageUrl={event.image_url} 
        />
        
        <div className="space-y-6">
          <EventDetails 
            date={event.date}
            time={event.time}
            location={event.location}
            description={event.description}
            category={event.category}
          />
          
          <OrganizationContact contact={event.organization_contact} />
          
          <VolunteerStatus 
            currentVolunteers={event.current_volunteers || 0}
            volunteersNeeded={event.volunteers_needed}
          />
          
          {isOwner && volunteers && (
            <RegisteredVolunteers volunteers={volunteers} />
          )}
          
          {canRegister && (
            <Button onClick={handleRegister} className="w-full">
              Register for Event
            </Button>
          )}

          {isOwner && (
            <div className="flex space-x-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/events/${id}/edit`)}
                className="flex-1"
              >
                Edit Event
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    Delete Event
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this event
                      and all associated volunteer registrations.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteEvent}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EventDetailsPage;
