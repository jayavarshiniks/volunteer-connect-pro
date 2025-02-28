
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface RecommendedEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image_url?: string;
  reason: string;
}

interface EventRecommendationsProps {
  interests: string;
}

const EventRecommendations = ({ interests }: EventRecommendationsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedEvents, setRecommendedEvents] = useState<RecommendedEvent[]>([]);

  // Fetch user's search history
  const { data: searchHistory } = useQuery({
    queryKey: ['search-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('search_history')
        .select('search_query')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data?.map(item => item.search_query) || [];
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    if (!interests) return;
    
    const getRecommendations = async () => {
      setIsLoading(true);
      try {
        const response = await supabase.functions.invoke('get-event-recommendations', {
          body: {
            interests,
            userId: user?.id,
            searchHistory: searchHistory || []
          }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        const data = await response.data;
        setRecommendedEvents(data.recommendedEvents || []);
      } catch (error) {
        console.error('Failed to get recommendations:', error);
        toast.error('Failed to get event recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    getRecommendations();
  }, [interests, user?.id, searchHistory]);

  if (isLoading) {
    return (
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
          Finding recommendations for you...
        </h2>
        <div className="grid grid-cols-1 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendedEvents.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
        Recommended For You
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {recommendedEvents.map((event) => (
          <Card key={event.id} className="p-4">
            <div className="flex gap-4">
              {event.image_url && (
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-600">
                  📅 {format(new Date(event.date), 'PPP')}
                </p>
                <p className="text-sm text-gray-600 mb-2">📍 {event.location}</p>
                <p className="text-sm italic text-gray-700 mb-2">{event.reason}</p>
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventRecommendations;
