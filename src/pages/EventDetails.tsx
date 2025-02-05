import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const EventDetails = () => {
  const { id } = useParams();

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
    duration: "4 hours",
    contact: "contact@oceancare.org",
  };

  const handleRegister = () => {
    toast.success("Successfully registered for the event!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">{event.title}</h1>
        <div className="grid gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold">Organization</p>
            <p className="text-gray-600">{event.organization}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Date</p>
              <p className="text-gray-600">{event.date}</p>
            </div>
            <div>
              <p className="font-semibold">Duration</p>
              <p className="text-gray-600">{event.duration}</p>
            </div>
            <div>
              <p className="font-semibold">Location</p>
              <p className="text-gray-600">{event.location}</p>
            </div>
            <div>
              <p className="font-semibold">Volunteers Needed</p>
              <p className="text-gray-600">{event.volunteersNeeded}</p>
            </div>
          </div>
          <div>
            <p className="font-semibold">Description</p>
            <p className="text-gray-600">{event.description}</p>
          </div>
          <div>
            <p className="font-semibold">Requirements</p>
            <p className="text-gray-600">{event.requirements}</p>
          </div>
          <div>
            <p className="font-semibold">Contact</p>
            <p className="text-gray-600">{event.contact}</p>
          </div>
          <Button onClick={handleRegister} className="w-full mt-4">
            Register for Event
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EventDetails;