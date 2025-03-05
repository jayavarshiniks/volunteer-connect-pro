import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface RegistrationFormData {
  full_name: string;
  phone: string;
  emergency_contact: string;
  dietary_restrictions: string;
  notes: string;
}

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<RegistrationFormData>({
    full_name: "",
    phone: "",
    emergency_contact: "",
    dietary_restrictions: "",
    notes: ""
  });

  const { data: event, isLoading: eventLoading } = useQuery({
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
    retry: 1
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

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        full_name: userProfile.full_name || '',
        phone: userProfile.phone || '',
      }));
    }
  }, [userProfile]);

  useEffect(() => {
    if (!user) {
      toast.error("Please login to register for events");
      navigate("/login");
      return;
    }

    if (event && !eventLoading) {
      if (event.current_volunteers >= event.volunteers_needed) {
        toast.error("This event is already full");
        navigate(`/events/${id}`);
      }
    }
  }, [event, eventLoading, id, navigate, user]);

  const handleConfirmRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event) return;
    setLoading(true);

    try {
      console.log("Starting registration process...");
      
      const { data: freshEvent, error: freshEventError } = await supabase
        .from('events')
        .select('current_volunteers, volunteers_needed')
        .eq('id', id)
        .single();
        
      if (freshEventError) throw freshEventError;
      
      if (freshEvent.current_volunteers >= freshEvent.volunteers_needed) {
        toast.error("Sorry, this event is already full");
        navigate(`/events/${id}`);
        return;
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
      console.log("Profile updated successfully");

      const registrationDetails = {
        event_id: id,
        user_id: user.id,
        registration_time: new Date().toISOString(),
        emergency_contact: formData.emergency_contact,
        dietary_restrictions: formData.dietary_restrictions,
        notes: formData.notes
      };

      const { error: registrationError } = await supabase
        .from('registrations')
        .insert(registrationDetails);

      if (registrationError) throw registrationError;
      console.log("Registration created successfully");

      const { error: updateError } = await supabase
        .from('events')
        .update({ 
          current_volunteers: (freshEvent.current_volunteers || 0) + 1 
        })
        .eq('id', id);

      if (updateError) throw updateError;
      console.log("Event volunteer count updated successfully");

      await queryClient.invalidateQueries({ queryKey: ['event', id] });
      await queryClient.invalidateQueries({ queryKey: ['organization-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      await queryClient.invalidateQueries({ queryKey: ['event-volunteers', id] });

      const registrationData = {
        registrationId: `REG-${Date.now()}`,
        eventId: id,
        userId: user.id,
        name: formData.full_name,
        email: user.email,
        phone: formData.phone,
        emergency_contact: formData.emergency_contact,
        dietary_restrictions: formData.dietary_restrictions,
        notes: formData.notes,
        timestamp: new Date().toISOString(),
        eventTitle: event.title
      };

      toast.success("Successfully registered for the event!");
      navigate(`/registration-success`, { 
        state: { registrationData } 
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register for this event");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/events/${id}`);
  };

  if (eventLoading || !event) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  const isEventFull = event.current_volunteers >= event.volunteers_needed;
  if (isEventFull) {
    toast.error("This event is already full");
    navigate(`/events/${id}`);
    return null;
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
        <h1 className="text-3xl font-bold mb-6">Event Registration</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Event:</span> {event.title}</p>
              <p><span className="font-medium">Date:</span> {format(new Date(event.date), 'PPP')}</p>
              <p><span className="font-medium">Time:</span> {event.time}</p>
              <p><span className="font-medium">Location:</span> {event.location}</p>
              <p><span className="font-medium">Spots Remaining:</span> {event.volunteers_needed - event.current_volunteers} of {event.volunteers_needed}</p>
            </div>
          </div>

          <form onSubmit={handleConfirmRegistration} className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Your Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <Input
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <Input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Emergency Contact</label>
                  <Input
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                    placeholder="Emergency contact number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Dietary Restrictions</label>
                  <Input
                    value={formData.dietary_restrictions}
                    onChange={(e) => setFormData(prev => ({ ...prev, dietary_restrictions: e.target.value }))}
                    placeholder="Any dietary restrictions?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Additional Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional information you'd like to share?"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Confirming..." : "Confirm Registration"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default EventRegistration;
