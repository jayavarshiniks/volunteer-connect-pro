
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
  const [error, setError] = useState<string | null>(null);

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

  // Fallback function to find keyword matches when AI is unavailable
  const getKeywordBasedRecommendations = async (keywords: string) => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch upcoming events
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true });
        
      if (error) throw error;
      if (!events || events.length === 0) return [];
      
      // Create an array of keywords from the interests string
      const keywordArray = keywords.toLowerCase().split(/\s+/).filter(k => k.length > 2);
      
      // Score events based on keyword matches in title, description, and location
      const scoredEvents = events.map(event => {
        const title = event.title.toLowerCase();
        const description = event.description.toLowerCase();
        const location = event.location.toLowerCase();
        
        let score = 0;
        let matchedKeywords: string[] = [];
        
        keywordArray.forEach(keyword => {
          if (title.includes(keyword)) {
            score += 3;
            matchedKeywords.push(keyword);
          }
          if (description.includes(keyword)) {
            score += 2;
            if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword);
          }
          if (location.includes(keyword)) {
            score += 1;
            if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword);
          }
        });
        
        return {
          ...event,
          score,
          matchedKeywords
        };
      });
      
      // Filter events with at least one keyword match and sort by score
      const matchedEvents = scoredEvents
        .filter(event => event.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(event => ({
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          description: event.description,
          image_url: event.image_url,
          reason: `Matched keywords: ${event.matchedKeywords.join(', ')}`
        }));
        
      return matchedEvents;
    } catch (error) {
      console.error('Error in keyword matching:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!interests) return;
    
    const getRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First try to use the AI-powered recommendations
        const response = await supabase.functions.invoke('get-event-recommendations', {
          body: {
            interests,
            userId: user?.id,
            searchHistory: searchHistory || []
          }
        });

        if (response.error) {
          console.error('Function error:', response.error);
          // If AI recommendation failed, try keyword matching as fallback
          const fallbackEvents = await getKeywordBasedRecommendations(interests);
          
          if (fallbackEvents.length > 0) {
            setRecommendedEvents(fallbackEvents);
            // Log that we're using fallback
            console.log('Using keyword matching fallback recommendations');
          } else {
            throw new Error('No recommendations found with keyword matching');
          }
        } else if (!response.data) {
          throw new Error('No data returned from function');
        } else {
          setRecommendedEvents(response.data.recommendedEvents || []);
        }

        // Save search to history if user is logged in
        if (user?.id) {
          await supabase
            .from('search_history')
            .insert({
              user_id: user.id,
              search_query: interests,
            });
        }
      } catch (error) {
        console.error('Failed to get recommendations:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
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

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
          Recommended For You
        </h2>
        <Card className="p-4 bg-red-50">
          <p className="text-red-500">
            We couldn't generate recommendations right now. Try searching with more specific terms.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Tip: Try using keywords like "environment", "community", "education", or specific locations.
          </p>
        </Card>
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
