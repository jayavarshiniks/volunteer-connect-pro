
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import EventRecommendations from "@/components/EventRecommendations";
import DevEventSeeder from "@/components/DevEventSeeder";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/types/database";

const Events = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', today) // Only get events that are today or in the future
        .order('date', { ascending: true });

      if (error) throw error;
      return data as Event[];
    }
  });

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.category && event.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleViewDetails = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  const isAdmin = userProfile?.role === 'organization';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold">Volunteer Events</h1>
        
        <div className="w-full max-w-md">
          <Input
            type="text"
            placeholder="Search events by title, location, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* AI-powered recommendations based on search query */}
        {searchQuery && <EventRecommendations interests={searchQuery} />}

        {/* Developer tools for seeding events - only visible to organizations */}
        {isAdmin && <DevEventSeeder />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              {event.image_url && (
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-2">
                  📅 {format(new Date(event.date), 'PPP')} at {event.time}
                </p>
                <p className="text-gray-600 mb-2">📍 {event.location}</p>
                
                {event.category && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                    {event.category}
                  </span>
                )}
                
                <p className="text-sm mb-4 line-clamp-2">{event.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {event.volunteers_needed - event.current_volunteers} spots left
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => handleViewDetails(event.id)}
                  >
                    View Details
                  </Button>
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
