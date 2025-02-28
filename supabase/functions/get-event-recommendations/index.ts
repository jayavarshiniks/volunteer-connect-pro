
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get OpenAI API key from environment variables
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not found' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { interests, userId, searchHistory } = await req.json();

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch events from Supabase
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0]) // Only future events
      .order('date', { ascending: true });

    if (eventsError) throw eventsError;

    // Prepare event data for OpenAI
    const eventsFormatted = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date,
      requirements: event.requirements || '',
    }));

    // Create prompt for OpenAI
    const prompt = `
    I need to recommend volunteer events to a user based on their interests and search history.

    User interests: ${interests || 'Not specified'}
    
    User's recent search queries: ${searchHistory ? searchHistory.join(', ') : 'None'}
    
    Available events:
    ${JSON.stringify(eventsFormatted, null, 2)}
    
    Based on the user's interests and search history, recommend up to 3 events from the available list.
    Format your response as valid JSON with this structure:
    {
      "recommendations": [
        {
          "id": "event-id",
          "reason": "A brief explanation of why this event was recommended"
        }
      ]
    }
    ONLY include the JSON in your response, with no other text.
    `;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a recommendation system that suggests volunteer events based on user interests and search history.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const recommendationsText = data.choices[0].message.content;
    
    // Parse recommendations
    let recommendations;
    try {
      recommendations = JSON.parse(recommendationsText);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", recommendationsText);
      recommendations = { recommendations: [] };
    }

    // Match recommendations with full event data
    const recommendedEvents = recommendations.recommendations.map(rec => {
      const event = events.find(e => e.id === rec.id);
      return event ? { ...event, reason: rec.reason } : null;
    }).filter(Boolean);

    // Save search to history if userId is provided
    if (userId && interests) {
      await supabase
        .from('search_history')
        .insert({
          user_id: userId,
          search_query: interests,
          created_at: new Date().toISOString()
        });
    }

    return new Response(
      JSON.stringify({ recommendedEvents }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-event-recommendations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
