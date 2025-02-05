import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const OrganizationDashboard = () => {
  // Mock data (replace with real data later)
  const stats = {
    totalEvents: 12,
    activeEvents: 5,
    totalVolunteers: 150,
    completedEvents: 7,
  };

  const recentEvents = [
    {
      id: 1,
      title: "Beach Cleanup Drive",
      date: "2024-04-15",
      registeredVolunteers: 15,
      status: "Active",
    },
    {
      id: 2,
      title: "Food Bank Distribution",
      date: "2024-04-20",
      registeredVolunteers: 10,
      status: "Active",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Organization Dashboard</h1>
        <Link to="/events/create">
          <Button>Create New Event</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Events</h3>
          <p className="text-3xl font-bold">{stats.totalEvents}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Active Events</h3>
          <p className="text-3xl font-bold">{stats.activeEvents}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Volunteers</h3>
          <p className="text-3xl font-bold">{stats.totalVolunteers}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Completed Events</h3>
          <p className="text-3xl font-bold">{stats.completedEvents}</p>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Recent Events</h2>
      <div className="grid gap-4">
        {recentEvents.map((event) => (
          <Card key={event.id} className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">{event.title}</h3>
                <p className="text-gray-600">Date: {event.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {event.registeredVolunteers} volunteers registered
                </p>
                <span className="inline-block px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  {event.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrganizationDashboard;