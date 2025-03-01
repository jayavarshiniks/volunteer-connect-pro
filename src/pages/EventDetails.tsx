
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast } from "date-fns";
import { Mail, Phone, Users } from "lucide-react";

const EventDetails = () => {
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

  // Query to fetch volunteers who registered for this event
  const { data: volunteers } = useQuery({
    queryKey: ['event-volunteers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          registration_time,
          user_id,
          profiles:user_id (
            full_name,
            phone,
            profile_image_url
          )
        `)
        .eq('event_id', id);

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!userProfile?.role === 'organization'
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
        {event.image_url && (
          <div className="mb-6">
            <img 
              src={event.image_url} 
              alt={event.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold mb-6">{event.title}</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Event Details</h2>
            <p className="text-gray-600 mb-2">
              📅 Date: {format(new Date(event.date), 'PPP')} at {event.time}
            </p>
            <p className="text-gray-600 mb-2">
              📍 Location: {event.location}
            </p>
            <p className="text-gray-600">{event.description}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Organization Contact</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              {event.organization_contact.includes('@') ? (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <a href={`mailto:${event.organization_contact}`} className="text-blue-600 hover:underline">
                    {event.organization_contact}
                  </a>
                </div>
              ) : (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <a href={`tel:${event.organization_contact}`} className="text-blue-600 hover:underline">
                    {event.organization_contact}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Volunteer Status</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-600">
                <span className="font-medium">{spotsRemaining}</span> spots remaining
              </p>
              <p className="text-sm text-gray-500">
                {event.current_volunteers || 0} volunteers registered out of {event.volunteers_needed} needed
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${((event.current_volunteers || 0) / event.volunteers_needed) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Show registered volunteers if user is the event owner */}
          {isOwner && volunteers && volunteers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Registered Volunteers</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {volunteers.map((registration) => (
                  <div key={registration.id} className="flex items-center gap-3 p-2 border-b last:border-0">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {registration.profiles?.profile_image_url ? (
                        <img 
                          src={registration.profiles.profile_image_url} 
                          alt={registration.profiles.full_name || 'Volunteer'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{registration.profiles?.full_name || 'Anonymous Volunteer'}</p>
                      {registration.profiles?.phone && (
                        <p className="text-sm text-gray-500">{registration.profiles.phone}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 ml-auto">
                      Registered {format(new Date(registration.registration_time), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

export default EventDetails;
