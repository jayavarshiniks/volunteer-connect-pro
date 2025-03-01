
import { supabase } from "../integrations/supabase/client";

// Function to get a random date between today and 30 days from now
const getRandomFutureDate = () => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
  return futureDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Random times for events
const eventTimes = ['09:00', '10:30', '13:00', '14:30', '16:00', '18:00'];

// Location options
const locations = [
  'Central Park, New York',
  'Downtown Community Center, Los Angeles',
  'Riverfront Park, Chicago',
  'Golden Gate Park, San Francisco',
  'South Beach, Miami',
  'Memorial Park, Houston',
  'Pike Place Market, Seattle',
  'Boston Common, Boston',
  'Lincoln Park, Denver',
  'Piedmont Park, Atlanta'
];

// Sample event titles and descriptions
const events = [
  {
    title: 'Community Garden Planting Day',
    description: 'Join us for a day of planting flowers and vegetables in our community garden. No experience needed, just bring your enthusiasm and help us create a beautiful green space for everyone to enjoy.',
    requirements: 'Please wear comfortable clothes that you don\'t mind getting dirty. Bring gardening gloves if you have them.',
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  },
  {
    title: 'Beach Cleanup Initiative',
    description: 'Help keep our beaches clean and safe for wildlife and visitors. We\'ll provide all cleaning supplies, just come ready to make a difference for our coastal environment.',
    requirements: 'Wear sunscreen and a hat. Comfortable walking shoes recommended.',
    image_url: 'https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  },
  {
    title: 'Food Bank Sorting & Packing',
    description: 'Assist our local food bank with sorting and packing food donations that will be distributed to families in need throughout our community.',
    requirements: 'Must be able to stand for 3 hours and occasionally lift items up to 20 pounds.',
    image_url: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  },
  {
    title: 'Literacy Program - Reading Partners',
    description: 'Become a reading partner for elementary school students who need extra help with their reading skills. Training provided.',
    requirements: 'Patient and enthusiastic about helping children learn. Background check required.',
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1122&q=80'
  },
  {
    title: 'Habitat for Humanity Build Day',
    description: 'Help build affordable housing for families in need. No construction experience required - our team leads will guide you through all tasks.',
    requirements: 'Must be 18+ years old. Wear closed-toe shoes and weather-appropriate clothing.',
    image_url: 'https://images.unsplash.com/photo-1503387837-b154d5074bd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1331&q=80'
  },
  {
    title: 'Animal Shelter Assistant',
    description: 'Help care for cats and dogs at our no-kill animal shelter. Tasks include walking dogs, socializing with animals, and basic cleaning.',
    requirements: 'Animal lovers welcome! Must be comfortable around both cats and dogs.',
    image_url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80'
  },
  {
    title: 'Senior Center Technology Help',
    description: 'Teach basic computer and smartphone skills to seniors. Help them learn to video chat with family, use email, and navigate the internet safely.',
    requirements: 'Patient and good at explaining technology in simple terms.',
    image_url: 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  },
  {
    title: 'Park Trail Maintenance',
    description: 'Help maintain our beautiful park trails by clearing brush, repairing trail surfaces, and installing signage. Training and tools provided.',
    requirements: 'Must be physically able to walk on uneven terrain and use basic hand tools.',
    image_url: 'https://images.unsplash.com/photo-1596189181426-7f63a1737f0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  }
];

// Set this to the organization ID you want to assign the events to
// You should replace this with an actual organization ID from your database
const ORGANIZATION_ID = '3fa03ae4-e7c7-4dba-9598-ac7b51f25167'; // Replace with a real org ID

// Run the seed function
const seedEvents = async () => {
  console.log('Starting to seed events...');
  
  try {
    // Get organization info to use for contact
    const { data: orgData, error: orgError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'organization')
      .limit(1)
      .single();
    
    if (orgError) {
      console.error('Error fetching organization:', orgError);
      return;
    }
    
    const organizationId = orgData?.id || ORGANIZATION_ID;
    const orgContact = orgData?.phone || 'contact@example.org';
    
    // Create events
    for (const event of events) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const date = getRandomFutureDate();
      const time = eventTimes[Math.floor(Math.random() * eventTimes.length)];
      const volunteersNeeded = Math.floor(Math.random() * 15) + 5; // 5-20 volunteers
      
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: event.title,
          description: event.description,
          date,
          time,
          location,
          image_url: event.image_url,
          requirements: event.requirements,
          volunteers_needed: volunteersNeeded,
          current_volunteers: 0,
          organization_id: organizationId,
          organization_contact: orgContact
        });
      
      if (error) {
        console.error('Error creating event:', error);
      } else {
        console.log(`Created event: ${event.title}`);
      }
    }
    
    console.log('Finished seeding events!');
  } catch (error) {
    console.error('Error in seed process:', error);
  }
};

// To run this script:
// 1. Import it and call seedEvents() from your application
// 2. Or run it directly with: npx ts-node src/scripts/seed-events.ts

// Uncomment the next line to run the script directly
// seedEvents();

export { seedEvents };
