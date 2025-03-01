
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

interface RecommendedEvent {
  id: string
  title: string
  date: string
  location: string
  description: string
  image_url?: string
  reason: string
  category?: string
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the JSON request body
    const { interests, userId, searchHistory = [] } = await req.json()

    if (!interests) {
      return new Response(
        JSON.stringify({ error: 'Interests are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // Get all upcoming events
    const { data: events, error: eventsError } = await supabaseClient
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch events' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ recommendedEvents: [] }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create an array of keywords from the interests string
    const keywordArray = interests.toLowerCase().split(/[,\s]+/).filter((k: string) => k.length > 2)
    
    // Also consider search history keywords
    const historyKeywords = searchHistory
      .join(' ')
      .toLowerCase()
      .split(/[,\s]+/)
      .filter((k: string) => k.length > 2)
    
    // Combine all keywords for scoring (with duplicates removed)
    const allKeywords = [...new Set([...keywordArray, ...historyKeywords])]

    // Score events based on keyword matches
    const scoredEvents = events.map((event) => {
      const title = event.title?.toLowerCase() || ''
      const description = event.description?.toLowerCase() || ''
      const location = event.location?.toLowerCase() || ''
      const category = event.category?.toLowerCase() || ''
      
      let score = 0
      let matchedKeywords: string[] = []
      
      // Score based on keywords from current search
      keywordArray.forEach((keyword: string) => {
        if (title.includes(keyword)) {
          score += 3
          if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword)
        }
        if (description.includes(keyword)) {
          score += 2
          if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword)
        }
        if (location.includes(keyword)) {
          score += 1
          if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword)
        }
        if (category && category.includes(keyword)) {
          score += 4 // Higher score for category matches
          if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword)
        }
      })
      
      // Give a smaller boost for history keywords
      historyKeywords.forEach((keyword: string) => {
        if (title.includes(keyword)) score += 1
        if (description.includes(keyword)) score += 0.5
        if (category && category.includes(keyword)) score += 2
      })
      
      // Check if any of the keywords match common categories even if not explicit
      const categoryKeywords: Record<string, string[]> = {
        'environment': ['nature', 'clean', 'green', 'plant', 'garden', 'eco', 'recycle', 'climate'],
        'education': ['teach', 'learn', 'school', 'tutor', 'mentor', 'student', 'literacy', 'knowledge'],
        'community': ['neighborhood', 'local', 'city', 'town', 'service', 'volunteer'],
        'animal': ['pet', 'dog', 'cat', 'wildlife', 'rescue', 'shelter', 'veterinary'],
        'health': ['medical', 'wellness', 'fitness', 'care', 'hospital', 'clinic', 'therapy'],
        'art': ['music', 'paint', 'creative', 'dance', 'culture', 'theater', 'performance'],
        'elderly': ['senior', 'aged', 'retirement', 'old', 'nursing', 'aging', 'geriatric'],
        'disaster': ['emergency', 'relief', 'aid', 'crisis', 'help', 'humanitarian'],
        'clothing': ['donate', 'garment', 'sorting', 'apparel', 'textile', 'fashion'],
        'cleanup': ['waste', 'trash', 'litter', 'garbage', 'environment', 'recycling']
      }
      
      // Check if category is implicitly matched
      Object.entries(categoryKeywords).forEach(([categoryName, relatedWords]) => {
        const isRelatedToCategory = relatedWords.some(word => 
          allKeywords.includes(word) || 
          title.includes(word) || 
          description.includes(word)
        )
        
        if (isRelatedToCategory && (category?.includes(categoryName) || !category)) {
          score += 2
          if (!matchedKeywords.includes(categoryName)) {
            matchedKeywords.push(categoryName)
          }
        }
      })
      
      return {
        ...event,
        score,
        matchedKeywords
      }
    })
    
    // If user has registered for events, boost similar events
    if (userId) {
      const { data: userRegistrations } = await supabaseClient
        .from('registrations')
        .select('event_id')
        .eq('user_id', userId)
      
      if (userRegistrations && userRegistrations.length > 0) {
        const registeredEventIds = userRegistrations.map(reg => reg.event_id)
        
        // Get details of registered events
        const { data: registeredEvents } = await supabaseClient
          .from('events')
          .select('*')
          .in('id', registeredEventIds)
        
        if (registeredEvents && registeredEvents.length > 0) {
          // Boost scores for events with same category
          const registeredCategories = registeredEvents
            .map(event => event.category)
            .filter(Boolean) as string[]
          
          scoredEvents.forEach(event => {
            if (event.category && registeredCategories.includes(event.category)) {
              event.score += 3
              event.matchedKeywords.push('based on your past registrations')
            }
          })
        }
      }
    }
    
    // Sort events by score (highest first) and take top results
    let recommendedEvents: RecommendedEvent[] = []
    
    // First try to get events with a non-zero score
    const matchedEvents = scoredEvents
      .filter(event => event.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
    
    if (matchedEvents.length > 0) {
      recommendedEvents = matchedEvents.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location,
        description: event.description,
        image_url: event.image_url,
        category: event.category,
        reason: event.matchedKeywords.length > 0 
          ? `Matched: ${event.matchedKeywords.join(', ')}`
          : 'Recommended based on your interests'
      }))
    } else {
      // Fallback to random events if no matches
      recommendedEvents = events
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
          reason: 'Popular event you might enjoy'
        }))
    }

    return new Response(
      JSON.stringify({ recommendedEvents }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in recommendation function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
