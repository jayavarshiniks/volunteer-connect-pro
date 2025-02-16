
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock event data (replace with real data later)
  const event = {
    id: parseInt(id || "1"),
    title: "Beach Cleanup Drive",
    organization: "Ocean Care",
    date: "2024-04-15",
    location: "Miami Beach",
    description: "Join us in cleaning up the beach and protecting marine life.",
    volunteersNeeded: 20,
    currentVolunteers: 8, // Added this field
    requirements: "Bring water, sunscreen, and wear comfortable clothes",
  };

  const spotsRemaining = event.volunteersNeeded - event.currentVolunteers;

  const handleRegister = () => {
    if (!user) {
      toast.error("Please login to register for events");
      navigate("/login");
      return;
    }
    navigate(`/events/${id}/register`);
  };

  const handleBackToEvents = () => {
    navigate('/events');
  };

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
        <h1 className="text-3xl font-bold mb-6">{event.title}</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Organization</h2>
            <p className="text-gray-600">{event.organization}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Event Details</h2>
            <p className="text-gray-600 mb-2">📅 Date: {event.date}</p>
            <p className="text-gray-600 mb-2">📍 Location: {event.location}</p>
            <p className="text-gray-600">{event.description}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Requirements</h2>
            <p className="text-gray-600">{event.requirements}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Volunteer Status</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-600">
                <span className="font-medium">{spotsRemaining}</span> spots remaining
              </p>
              <p className="text-sm text-gray-500">
                {event.currentVolunteers} volunteers registered out of {event.volunteersNeeded} needed
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${(event.currentVolunteers / event.volunteersNeeded) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <Button onClick={handleRegister} className="w-full">
            Register for Event
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EventDetails;
