
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import EventRecommendations from "@/components/EventRecommendations";
import DevEventSeeder from "@/components/DevEventSeeder";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/types/database";
import { toast } from "sonner";

const Events = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  // Updated query to ensure we're fetching the most recent events and filtering out full events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      console.log("Fetching events...");
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      
      // Get all events that haven't happened yet
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', today) // Only get events that are today or in the future
        .order('date', { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }
      
      // Filter out events that are already full (volunteers_needed <= current_volunteers)
      const availableEvents = data.filter(event => 
        event.volunteers_needed > event.current_volunteers
      );
      
      console.log("Fetched events:", data);
      console.log("Available events:", availableEvents);
      return availableEvents as Event[];
    }
  });

  // Set up real-time updates for events
  useEffect(() => {
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          console.log("Events table changed, refreshing data...");
          queryClient.invalidateQueries({ queryKey: ['events'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Improved filtering to handle null category values
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.category && event.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleViewDetails = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  useEffect(() => {
    // If there are events, show a toast to let the user know that events have been loaded
    if (events.length > 0 && !isLoading) {
      toast.success(`${events.length} volunteer events available!`);
    }
  }, [events, isLoading]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Volunteer Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden h-96 animate-pulse">
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const isAdmin = userProfile?.role === 'organization';
  // Extract unique categories, filtering out null values
  const uniqueCategories = Array.from(
    new Set(events.map(event => event.category).filter(Boolean))
  );

  console.log("Filtered events:", filteredEvents);
  console.log("Unique categories:", uniqueCategories);

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

        {/* Category filters - only show if we have categories */}
        {uniqueCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={searchQuery === "" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSearchQuery("")}
            >
              All
            </Button>
            {uniqueCategories.map(category => (
              <Button 
                key={category} 
                variant={searchQuery.toLowerCase() === category?.toLowerCase() ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchQuery(category || "")}
              >
                {category}
              </Button>
            ))}
          </div>
        )}

        {/* AI-powered recommendations based on search query */}
        {searchQuery && <EventRecommendations interests={searchQuery} />}

        {/* Developer tools for seeding events - only visible to organizations */}
        {isAdmin && <DevEventSeeder />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden flex flex-col h-full">
              {event.image_url && (
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-2">
                  📅 {format(new Date(event.date), 'PPP')} at {event.time}
                </p>
                <p className="text-gray-600 mb-2">📍 {event.location}</p>
                
                {event.category && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2 self-start">
                    {event.category}
                  </span>
                )}
                
                <p className="text-sm mb-4 line-clamp-2 flex-grow">{event.description}</p>
                <div className="flex justify-between items-center mt-auto">
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

        {filteredEvents.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No events found matching your search criteria.</p>
            <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
