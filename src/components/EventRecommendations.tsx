
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
import { Event } from "@/types/database";

interface RecommendedEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image_url?: string;
  reason: string;
  category?: string;
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

  const getKeywordBasedRecommendations = async (keywords: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true });
        
      if (error) throw error;
      if (!events || events.length === 0) return [];
      
      const keywordArray = keywords.toLowerCase().split(/[,\s]+/).filter(k => k.length > 2);
      
      if (keywordArray.length === 0) {
        const randomEvents = events
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(event => ({
            id: event.id,
            title: event.title,
            date: event.date,
            location: event.location,
            description: event.description,
            image_url: event.image_url,
            category: event.category,
            reason: `Trending event in ${event.category || 'your area'}`
          }));
        
        return randomEvents;
      }
      
      const scoredEvents = events.map(event => {
        const title = event.title?.toLowerCase() || '';
        const description = event.description?.toLowerCase() || '';
        const location = event.location?.toLowerCase() || '';
        const category = event.category?.toLowerCase() || '';
        
        let score = 0;
        let matchedKeywords: string[] = [];
        
        keywordArray.forEach(keyword => {
          if (title.includes(keyword)) {
            score += 3;
            if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword);
          }
          if (description.includes(keyword)) {
            score += 2;
            if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword);
          }
          if (location.includes(keyword)) {
            score += 1;
            if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword);
          }
          if (category && category.includes(keyword)) {
            score += 4;
            if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword);
          }
        });
        
        const categoryKeywords = {
          'environment': ['nature', 'clean', 'green', 'plant', 'garden', 'eco', 'recycle', 'beach', 'tree', 'trail', 'park', 'conservation'],
          'education': ['teach', 'learn', 'school', 'tutor', 'mentor', 'student', 'literacy', 'reading', 'education', 'knowledge', 'skill'],
          'community': ['neighborhood', 'local', 'city', 'town', 'service', 'community', 'civic', 'society', 'group', 'public'],
          'animal welfare': ['pet', 'dog', 'cat', 'wildlife', 'rescue', 'shelter', 'adoption', 'protection', 'habitat', 'species', 'animal'],
          'health': ['medical', 'wellness', 'fitness', 'care', 'hospital', 'clinic', 'health', 'blood', 'donation', 'mental', 'awareness'],
          'art': ['music', 'paint', 'creative', 'dance', 'culture', 'theater', 'performance', 'exhibition', 'gallery', 'drawing', 'craft'],
          'elderly care': ['senior', 'aged', 'retirement', 'old', 'nursing', 'care', 'visit', 'elderly', 'companionship', 'support'],
          'disaster relief': ['emergency', 'relief', 'aid', 'crisis', 'help', 'disaster', 'support', 'recovery', 'assistance', 'coordination'],
          'clothing donation': ['donate', 'garment', 'sorting', 'apparel', 'textile', 'clothes', 'clothing', 'distribution', 'collection', 'charity'],
          'homelessness': ['shelter', 'homeless', 'housing', 'street', 'food', 'meal', 'service', 'support', 'distribute', 'charity'],
          'youth': ['children', 'young', 'teen', 'kid', 'youth', 'student', 'mentor', 'coach', 'teach', 'guide'],
          'sports': ['athletics', 'game', 'physical', 'team', 'coaching', 'recreation', 'activity', 'sports', 'competition']
        };
        
        Object.entries(categoryKeywords).forEach(([categoryName, relatedWords]) => {
          const isRelatedToCategory = relatedWords.some(word => 
            keywordArray.includes(word) || 
            title.includes(word) || 
            description.includes(word)
          );
          
          if (isRelatedToCategory && (category?.includes(categoryName) || !category)) {
            score += 2;
            if (!matchedKeywords.includes(categoryName)) {
              matchedKeywords.push(categoryName);
            }
          }
        });
        
        return {
          ...event,
          score,
          matchedKeywords
        };
      });
      
      let matchedEvents = scoredEvents
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
          category: event.category,
          reason: `Matched: ${event.matchedKeywords.join(', ')}`
        }));
      
      if (matchedEvents.length === 0) {
        // If no direct matches, find some based on categories
        const categoryMatches = events
          .filter(event => event.category)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(event => ({
            id: event.id,
            title: event.title,
            date: event.date,
            location: event.location,
            description: event.description,
            image_url: event.image_url,
            category: event.category,
            reason: `Recommended ${event.category} event you might enjoy`
          }));
          
        if (categoryMatches.length > 0) {
          return categoryMatches;
        }
        
        // Last resort - just show random events
        matchedEvents = events
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(event => ({
            id: event.id,
            title: event.title,
            date: event.date,
            location: event.location,
            description: event.description,
            image_url: event.image_url,
            category: event.category,
            reason: 'Recommended event you might enjoy'
          }));
      }
        
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
        const recommendedEvents = await getKeywordBasedRecommendations(interests);
        
        if (recommendedEvents.length > 0) {
          setRecommendedEvents(recommendedEvents);
          console.log('Using keyword matching recommendations');
        } else {
          throw new Error('No recommendations found with keyword matching');
        }

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
        
        try {
          const today = new Date().toISOString().split('T')[0];
          const { data: randomEvents } = await supabase
            .from('events')
            .select('*')
            .gte('date', today)
            .limit(3);
            
          if (randomEvents && randomEvents.length > 0) {
            const formattedEvents = randomEvents.map(event => ({
              id: event.id,
              title: event.title,
              date: event.date,
              location: event.location,
              description: event.description,
              image_url: event.image_url,
              category: event.category,
              reason: 'Popular event'
            }));
            
            setRecommendedEvents(formattedEvents);
            setError(null);
          } else {
            toast.error('Failed to get event recommendations');
          }
        } catch (fallbackError) {
          console.error('Even fallback failed:', fallbackError);
          toast.error('Failed to get event recommendations');
        }
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

  if (error && recommendedEvents.length === 0) {
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
                {event.category && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                    {event.category}
                  </span>
                )}
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
