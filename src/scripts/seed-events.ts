
import { supabase } from "@/integrations/supabase/client";

// Add more realistic categories
const EVENT_CATEGORIES = [
  "Environment",
  "Community Service",
  "Education",
  "Health",
  "Animal Welfare",
  "Disaster Relief",
  "Elderly Care",
  "Youth Development",
  "Food Distribution",
  "Homelessness"
];

const EVENT_TITLES = [
  "Beach Cleanup",
  "Community Garden Project",
  "Food Bank Volunteering",
  "Homeless Shelter Support",
  "Tutoring Children",
  "Senior Center Visit",
  "Animal Shelter Help",
  "Park Restoration",
  "Blood Drive Support",
  "Clothing Distribution",
  "Tree Planting Day",
  "Literacy Program",
  "Meal Delivery for Seniors",
  "School Supply Drive",
  "Disaster Preparation Workshop"
];

const LOCATIONS = [
  "Chennai, Tamil Nadu",
  "Bangalore, Karnataka",
  "Mumbai, Maharashtra",
  "Delhi, New Delhi",
  "Kolkata, West Bengal",
  "Hyderabad, Telangana",
  "Coimbatore, Tamil Nadu",
  "Madurai, Tamil Nadu",
  "Pondicherry, Tamil Nadu",
  "Kochi, Kerala"
];

export const seedEvents = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user?.user) {
      throw new Error("You must be logged in as an organization to create sample events");
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();
      
    if (!profile || profile.role !== 'organization') {
      throw new Error("You must be logged in as an organization to create sample events");
    }
    
    const events = [];
    
    // Create a set of events for the next 60 days
    for (let i = 0; i < 20; i++) {
      const randomDays = Math.floor(Math.random() * 60) + 1; // 1 to 60 days in future
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + randomDays);
      
      // Format date as YYYY-MM-DD
      const formattedDate = eventDate.toISOString().split('T')[0];
      
      // Random time between 7am and 7pm
      const hour = Math.floor(Math.random() * 12) + 7;
      const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      
      // Random volunteers needed between 5 and 50
      const volunteersNeeded = Math.floor(Math.random() * 46) + 5;
      
      // Random title, location, and category
      const titleIndex = Math.floor(Math.random() * EVENT_TITLES.length);
      const locationIndex = Math.floor(Math.random() * LOCATIONS.length);
      const categoryIndex = Math.floor(Math.random() * EVENT_CATEGORIES.length);
      
      events.push({
        title: EVENT_TITLES[titleIndex],
        description: `Join us for this important volunteer opportunity to help our community. Your time and efforts will make a real difference!`,
        date: formattedDate,
        time: time,
        location: LOCATIONS[locationIndex],
        volunteers_needed: volunteersNeeded,
        organization_id: profile.id,
        organization_contact: profile.phone || profile.organization_website || "Contact through our website",
        category: EVENT_CATEGORIES[categoryIndex], // Ensure all events have a category
      });
    }
    
    const { error } = await supabase
      .from('events')
      .insert(events);
      
    if (error) throw error;
    
    return { success: true, count: events.length };
  } catch (error) {
    console.error("Error seeding events:", error);
    throw error;
  }
};
