import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useParams, useNavigate } from "react-router-dom";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock event data (replace with real data later)
  const event = {
    id: 1,
    title: "Beach Cleanup Drive",
    organization: "Ocean Care",
    date: "2024-04-15",
    location: "Miami Beach",
    description: "Join us in cleaning up the beach and protecting marine life.",
    volunteersNeeded: 20,
    requirements: "Bring water, sunscreen, and wear comfortable clothes",
  };

  const handleRegister = () => {
    navigate(`/events/${id}/register`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
            <h2 className="text-xl font-semibold mb-2">Volunteers Needed</h2>
            <p className="text-gray-600">{event.volunteersNeeded} volunteers</p>
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
