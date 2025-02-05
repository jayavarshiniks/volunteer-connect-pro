import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Events = () => {
  // Mock events data (replace with real data later)
  const events = [
    {
      id: 1,
      title: "Beach Cleanup Drive",
      organization: "Ocean Care",
      date: "2024-04-15",
      location: "Miami Beach",
      description: "Join us in cleaning up the beach and protecting marine life.",
      volunteersNeeded: 20,
    },
    {
      id: 2,
      title: "Food Bank Distribution",
      organization: "Community Helpers",
      date: "2024-04-20",
      location: "Downtown Community Center",
      description: "Help distribute food to families in need.",
      volunteersNeeded: 15,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Volunteer Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="p-6">
            <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-2">{event.organization}</p>
            <p className="text-sm text-gray-500 mb-2">📅 {event.date}</p>
            <p className="text-sm text-gray-500 mb-4">📍 {event.location}</p>
            <p className="text-sm mb-4">{event.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {event.volunteersNeeded} volunteers needed
              </span>
              <Link to={`/events/${event.id}`}>
                <Button variant="outline">View Details</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Events;