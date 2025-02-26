
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: event } = useQuery({
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

  const handleConfirmRegistration = async () => {
    if (!user || !event) return;
    setLoading(true);

    try {
      // Insert registration record
      const { error: registrationError } = await supabase
        .from('registrations')
        .insert({
          event_id: id,
          user_id: user.id
        });

      if (registrationError) throw registrationError;

      // Update volunteer count
      const { error: updateError } = await supabase
        .from('events')
        .update({ 
          current_volunteers: (event.current_volunteers || 0) + 1 
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['event', id] });
      await queryClient.invalidateQueries({ queryKey: ['organization-events'] });

      // Create registration data for success page
      const registrationData = {
        registrationId: `REG-${Date.now()}`,
        eventId: id,
        userId: user.id,
        name: userProfile?.full_name || user.user_metadata?.full_name || user.email,
        email: user.email,
        timestamp: new Date().toISOString()
      };

      toast.success("Successfully registered for the event!");
      navigate(`/events/${id}/registration-success`, { 
        state: { registrationData } 
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/events/${id}`);
  };

  if (!event) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={handleBack}
        className="mb-4"
      >
        ← Back to Event
      </Button>
      <Card className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Confirm Registration</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Event:</span> {event.title}</p>
              <p><span className="font-medium">Date:</span> {format(new Date(event.date), 'PPP')}</p>
              <p><span className="font-medium">Time:</span> {event.time}</p>
              <p><span className="font-medium">Location:</span> {event.location}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Your Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {userProfile?.full_name || user?.user_metadata?.full_name || user?.email}</p>
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              {userProfile?.phone && (
                <p><span className="font-medium">Phone:</span> {userProfile.phone}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRegistration} disabled={loading}>
              {loading ? "Confirming..." : "Confirm Registration"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventRegistration;
