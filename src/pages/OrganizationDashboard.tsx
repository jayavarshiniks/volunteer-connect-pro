
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Edit } from "lucide-react";

const OrganizationDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ['organization-events', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organization_id', user?.id)
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const stats = {
    totalEvents: events?.length || 0,
    activeEvents: events?.filter(event => new Date(event.date) >= new Date()).length || 0,
    totalVolunteers: events?.reduce((acc, event) => acc + (event.current_volunteers || 0), 0) || 0,
    completedEvents: events?.filter(event => new Date(event.date) < new Date()).length || 0,
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

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

      <h2 className="text-2xl font-bold mb-4">Your Events</h2>
      <div className="grid gap-4">
        {events?.map((event) => (
          <Card key={event.id} className="p-6">
            <div className="flex gap-4">
              {event.image_url && (
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <p className="text-gray-600">
                      Date: {format(new Date(event.date), 'PPP')} at {event.time}
                    </p>
                    <p className="text-gray-600">Location: {event.location}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-sm text-gray-600">
                      {event.current_volunteers} / {event.volunteers_needed} volunteers
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/events/${event.id}/edit`)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Link to={`/events/${event.id}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      new Date(event.date) >= new Date() 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {new Date(event.date) >= new Date() ? 'Active' : 'Completed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrganizationDashboard;
