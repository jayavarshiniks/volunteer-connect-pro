
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock events data (replace with real data later)
  const allEvents = [
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
    {
      id: 3,
      title: "Senior Care Visit",
      organization: "Elder Care Society",
      date: "2024-04-22",
      location: "Sunshine Retirement Home",
      description: "Spend time with elderly residents and help with activities.",
      volunteersNeeded: 10,
    },
    {
      id: 4,
      title: "Park Restoration Project",
      organization: "Green City Initiative",
      date: "2024-04-25",
      location: "Central Park",
      description: "Help restore and maintain our city's green spaces.",
      volunteersNeeded: 25,
    },
    {
      id: 5,
      title: "Youth Mentoring Program",
      organization: "Future Leaders",
      date: "2024-04-28",
      location: "Community Youth Center",
      description: "Mentor young students and help with homework.",
      volunteersNeeded: 12,
    },
  ];

  const filteredEvents = allEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterClick = (eventId: number) => {
    if (!user) {
      toast.error("Please login to register for events");
      navigate("/login");
      return;
    }
    navigate(`/events/${eventId}/register`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold">Volunteer Events</h1>
        
        <div className="w-full max-w-md">
          <Input
            type="text"
            placeholder="Search events by title, organization, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
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
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    View Details
                  </Button>
                  {user && (
                    <Button onClick={() => handleRegisterClick(event.id)}>
                      Register
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
