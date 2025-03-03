
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interests, userId } = await req.json();
    console.log("Received request for AI recommendations with interests:", interests);

    if (!interests) {
      throw new Error("Interests parameter is required");
    }

    // Get all upcoming events
    const today = new Date().toISOString().split('T')[0];
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true });

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw eventsError;
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: "No upcoming events found" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${events.length} upcoming events`);

    // Get user's search history if userId is provided
    let searchHistory = [];
    if (userId) {
      const { data: history, error: historyError } = await supabase
        .from('search_history')
        .select('search_query')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!historyError && history) {
        searchHistory = history.map(item => item.search_query);
        console.log("User search history:", searchHistory);
      }
    }

    // Prepare context for OpenAI
    const eventsContext = events.map(event => ({
      id: event.id,
      title: event.title,
      category: event.category || "Uncategorized",
      description: event.description,
      location: event.location,
      date: event.date
    }));

    // Construct the prompt for OpenAI
    const systemPrompt = `
You are an AI event recommendation system for a volunteer platform. Your task is to recommend up to 3 most relevant volunteer events based on the user's interests and search history.

The user has expressed interest in: "${interests}"
${searchHistory.length > 0 ? `Their recent searches include: ${searchHistory.join(', ')}` : ''}

For each recommended event, explain in one brief sentence why you're recommending it (the reason).
`;

    const userPrompt = `Here are the available upcoming events:
${JSON.stringify(eventsContext, null, 2)}

Select up to 3 events that best match the user's interests. Return ONLY a JSON array with this exact format:
[
  {
    "id": "event-id",
    "reason": "Brief one-sentence explanation of why this event matches user interests"
  }
]
Do not include any other text before or after the JSON. The response should be valid JSON that can be parsed directly.
`;

    console.log("Sending request to OpenAI...");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    const aiResponse = await response.json();
    console.log("Received response from OpenAI");

    if (!aiResponse.choices || aiResponse.choices.length === 0) {
      console.error("Invalid response from OpenAI:", aiResponse);
      throw new Error("Invalid response from OpenAI");
    }

    const responseContent = aiResponse.choices[0].message.content;
    
    try {
      // Parse the JSON response
      const recommendedEventIds = JSON.parse(responseContent);
      console.log("Parsed AI recommendations:", recommendedEventIds);

      // Get the full event details for the recommended IDs
      const recommendedEvents = recommendedEventIds.map(recommendation => {
        const event = events.find(e => e.id === recommendation.id);
        if (!event) return null;
        
        return {
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          description: event.description,
          image_url: event.image_url,
          category: event.category,
          reason: recommendation.reason
        };
      }).filter(event => event !== null);

      // If userId is provided, save the search query to the user's history
      if (userId && interests) {
        await supabase
          .from('search_history')
          .insert({
            user_id: userId,
            search_query: interests,
          });
        console.log("Saved search to user history");
      }

      return new Response(
        JSON.stringify(recommendedEvents),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError, "Response was:", responseContent);
      throw new Error("Failed to parse AI recommendation response");
    }
  } catch (error) {
    console.error("Error in AI event recommendations function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
