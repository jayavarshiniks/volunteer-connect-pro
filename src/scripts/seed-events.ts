
/*
  This is a script to seed example events into Supabase
  It can be run manually or used as reference code
*/

import { supabase } from "../integrations/supabase/client";

// Adjust start and end dates for events
const today = new Date();
const twoWeeksFromNow = new Date(today);
twoWeeksFromNow.setDate(today.getDate() + 14);

// Format date to YYYY-MM-DD
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Sample organization ID - need to replace with real organization ID
const organizationId = "YOUR_ORGANIZATION_ID"; // Replace with a real organization ID

// Sample events
const sampleEvents = [
  {
    title: "Beach Cleanup - Ocean Park",
    description: "Join us for a community beach cleanup event. Help keep our beaches clean and protect marine life. All equipment will be provided, but feel free to bring your own gloves if you prefer.",
    date: formatDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)), // 3 days from now
    time: "10:00:00",
    location: "Ocean Park Beach, Main Entrance",
    volunteers_needed: 20,
    current_volunteers: 0,
    organization_id: organizationId,
    organization_contact: "beachcleanup@example.org",
    image_url: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?q=80&w=1000",
    requirements: "Wear comfortable clothes and shoes. Sunscreen recommended."
  },
  {
    title: "Food Drive for Local Shelter",
    description: "Help us collect and sort food donations for our local homeless shelter. We need volunteers to help receive, sort, and pack food items for distribution.",
    date: formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)), // 1 week from now
    time: "09:30:00",
    location: "Community Center, 123 Main St",
    volunteers_needed: 15,
    current_volunteers: 0,
    organization_id: organizationId,
    organization_contact: "fooddrive@example.org",
    image_url: "https://images.unsplash.com/photo-1593113598332-cd59a0c3a9a1?q=80&w=1000",
    requirements: "No special requirements. Training will be provided on site."
  },
  {
    title: "Animal Shelter Care Day",
    description: "Spend time with shelter animals and help with cleaning, feeding, and socializing with the animals. This is a great opportunity for animal lovers to make a difference.",
    date: formatDate(new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)), // 10 days from now
    time: "13:00:00",
    location: "Happy Paws Animal Shelter, 456 Park Ave",
    volunteers_needed: 12,
    current_volunteers: 0,
    organization_id: organizationId,
    organization_contact: "animals@example.org",
    image_url: "https://images.unsplash.com/photo-1593871075120-982e042088d8?q=80&w=1000",
    requirements: "Must be comfortable around animals. Minimum age: 16 years."
  },
  {
    title: "Park Restoration Project",
    description: "Help us restore and beautify our local park. Activities include planting flowers, painting benches, and general cleanup. This is a family-friendly event.",
    date: formatDate(new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)), // 2 weeks from now
    time: "11:00:00",
    location: "Greenfield Park, West Entrance",
    volunteers_needed: 25,
    current_volunteers: 0,
    organization_id: organizationId,
    organization_contact: "parks@example.org",
    image_url: "https://images.unsplash.com/photo-1503754163129-a02a0c646fba?q=80&w=1000",
    requirements: "Bring gardening gloves if possible. Tools will be provided."
  },
  {
    title: "Senior Center Tech Help",
    description: "Teach basic computer and smartphone skills to seniors at our local senior center. Patience and good communication skills required.",
    date: formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)), // 5 days from now
    time: "14:00:00",
    location: "Golden Years Senior Center, 789 Oak St",
    volunteers_needed: 10,
    current_volunteers: 0,
    organization_id: organizationId,
    organization_contact: "techhelp@example.org",
    image_url: "https://images.unsplash.com/photo-1516192518150-0d8fee5425e3?q=80&w=1000",
    requirements: "Knowledge of basic computer and smartphone operations. Good communication skills."
  }
];

// Seed function
export const seedEvents = async () => {
  console.log("Seeding events...");
  
  for (const event of sampleEvents) {
    const { data, error } = await supabase
      .from('events')
      .insert([event]);
      
    if (error) {
      console.error(`Error seeding event ${event.title}:`, error);
    } else {
      console.log(`Seeded event: ${event.title}`);
    }
  }
  
  console.log("Seeding complete!");
};

// Uncomment to run
// seedEvents();
