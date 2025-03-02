
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { isPast } from "date-fns";
import EventHeader from "./components/EventHeader";
import EventDetails from "./components/EventDetails";
import OrganizationContact from "./components/OrganizationContact";
import VolunteerStatus from "./components/VolunteerStatus";
import RegisteredVolunteers from "./components/RegisteredVolunteers";

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
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

  // Query to fetch volunteers who registered for this event with their additional details
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

  const handleRegister = async () => {
    if (!user) {
      toast.error("Please login to register for events");
      navigate("/login");
      return;
    }

    try {
      // Check if user is already registered
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

      // Navigate to registration page instead of direct registration
      navigate(`/events/${id}/register`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleBackToEvents = () => {
    navigate('/events');
  };

  if (isLoading || !event) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  // Check if event is in the past
  const eventDate = new Date(event.date);
  const isEventPast = isPast(eventDate);

  const spotsRemaining = event.volunteers_needed - (event.current_volunteers || 0);
  const isOrganization = userProfile?.role === 'organization';
  const canRegister = !isOrganization && spotsRemaining > 0 && !isEventPast;
  const isOwner = user?.id === event.organization_id;

  // If the event is in the past and user is not the owner, redirect to events page with a message
  if (isEventPast && !isOwner) {
    toast.error("This event has already passed");
    navigate('/events');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={handleBackToEvents}
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
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EventDetailsPage;
