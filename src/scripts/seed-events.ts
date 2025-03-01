
import { supabase } from "../integrations/supabase/client";

// Function to get a random date between today and 30 days from now
const getRandomFutureDate = () => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
  return futureDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Random times for events
const eventTimes = ['09:00', '10:30', '13:00', '14:30', '16:00', '18:00', '19:30'];

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
  'Piedmont Park, Atlanta',
  'Union Square, San Francisco',
  'Grant Park, Chicago',
  'Washington Square Park, New York'
];

// Event categories
const categories = [
  'Environment',
  'Education',
  'Community Service',
  'Animal Welfare',
  'Elderly Care',
  'Youth Mentoring',
  'Homelessness',
  'Health & Wellness',
  'Disaster Relief',
  'Arts & Culture',
  'Technology',
  'Sports & Recreation',
  'Clothing Donation'
];

// Sample event data with categories
const events = [
  {
    title: 'Community Garden Planting Day',
    description: 'Join us for a day of planting flowers and vegetables in our community garden. No experience needed, just bring your enthusiasm and help us create a beautiful green space for everyone to enjoy.',
    requirements: 'Please wear comfortable clothes that you don\'t mind getting dirty. Bring gardening gloves if you have them.',
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'Environment'
  },
  {
    title: 'Beach Cleanup Initiative',
    description: 'Help keep our beaches clean and safe for wildlife and visitors. We\'ll provide all cleaning supplies, just come ready to make a difference for our coastal environment.',
    requirements: 'Wear sunscreen and a hat. Comfortable walking shoes recommended.',
    image_url: 'https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'Environment'
  },
  {
    title: 'Food Bank Sorting & Packing',
    description: 'Assist our local food bank with sorting and packing food donations that will be distributed to families in need throughout our community.',
    requirements: 'Must be able to stand for 3 hours and occasionally lift items up to 20 pounds.',
    image_url: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'Community Service'
  },
  {
    title: 'Literacy Program - Reading Partners',
    description: 'Become a reading partner for elementary school students who need extra help with their reading skills. Training provided.',
    requirements: 'Patient and enthusiastic about helping children learn. Background check required.',
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1122&q=80',
    category: 'Education'
  },
  {
    title: 'Habitat for Humanity Build Day',
    description: 'Help build affordable housing for families in need. No construction experience required - our team leads will guide you through all tasks.',
    requirements: 'Must be 18+ years old. Wear closed-toe shoes and weather-appropriate clothing.',
    image_url: 'https://images.unsplash.com/photo-1503387837-b154d5074bd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1331&q=80',
    category: 'Community Service'
  },
  {
    title: 'Animal Shelter Assistant',
    description: 'Help care for cats and dogs at our no-kill animal shelter. Tasks include walking dogs, socializing with animals, and basic cleaning.',
    requirements: 'Animal lovers welcome! Must be comfortable around both cats and dogs.',
    image_url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80',
    category: 'Animal Welfare'
  },
  {
    title: 'Senior Center Technology Help',
    description: 'Teach basic computer and smartphone skills to seniors. Help them learn to video chat with family, use email, and navigate the internet safely.',
    requirements: 'Patient and good at explaining technology in simple terms.',
    image_url: 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'Elderly Care'
  },
  {
    title: 'Park Trail Maintenance',
    description: 'Help maintain our beautiful park trails by clearing brush, repairing trail surfaces, and installing signage. Training and tools provided.',
    requirements: 'Must be physically able to walk on uneven terrain and use basic hand tools.',
    image_url: 'https://images.unsplash.com/photo-1596189181426-7f63a1737f0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'Environment'
  },
  {
    title: 'Youth Sports Coach',
    description: 'Volunteer as a coach for our youth sports program. Help children learn teamwork, sportsmanship, and athletic skills.',
    requirements: 'Experience with sports coaching and working with children. Background check required.',
    image_url: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
    category: 'Sports & Recreation'
  },
  {
    title: 'Homeless Shelter Meal Service',
    description: 'Help prepare and serve meals at our local homeless shelter. This is a great way to directly impact the lives of those in need in our community.',
    requirements: 'Food handling experience helpful but not required. Must follow health and safety guidelines.',
    image_url: 'https://images.unsplash.com/photo-1505455184862-554165e5f6ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
    category: 'Homelessness'
  },
  {
    title: 'Community Art Workshop',
    description: 'Lead art workshops for community members of all ages. Share your artistic skills and help others express themselves creatively.',
    requirements: 'Art experience in any medium. Supplies provided.',
    image_url: 'https://images.unsplash.com/photo-1560421741-6551e78d498d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    category: 'Arts & Culture'
  },
  {
    title: 'Disaster Relief Kit Assembly',
    description: 'Help assemble emergency kits for disaster relief efforts. These kits provide essential supplies to families affected by natural disasters.',
    requirements: 'No special skills required. Ability to stand for 2-3 hours.',
    image_url: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'Disaster Relief'
  },
  {
    title: 'Tech Mentorship Program',
    description: 'Mentor students interested in technology careers. Share your knowledge of programming, design, or other tech skills.',
    requirements: 'Professional experience in technology fields. Good communication skills.',
    image_url: 'https://images.unsplash.com/photo-1581092921461-7031e4f48f85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'Technology'
  },
  {
    title: 'Community Health Fair',
    description: 'Volunteer at our annual health fair providing free health screenings and information to underserved communities.',
    requirements: 'Healthcare experience preferred but not required. Training provided for non-medical volunteers.',
    image_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'Health & Wellness'
  },
  {
    title: 'Elderly Care Visits',
    description: 'Visit elderly individuals in nursing homes who don\'t have regular visitors. Spend time talking, playing games, or simply providing companionship.',
    requirements: 'Compassionate individuals who enjoy conversation. Background check required.',
    image_url: 'https://images.unsplash.com/photo-1516307318288-4e9f2d9b8641?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    category: 'Elderly Care'
  },
  {
    title: 'Clothing Donation Sorting',
    description: 'Help sort and organize clothing donations for distribution to those in need. We need volunteers to check quality, sort by size/type, and prepare items for distribution.',
    requirements: 'No special skills required. Ability to stand for 2-3 hours.',
    image_url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    category: 'Clothing Donation'
  },
  {
    title: 'Disaster Relief Coordination',
    description: 'Assist in coordinating relief efforts for recent natural disaster victims. Help match resources with needs and organize volunteer schedules.',
    requirements: 'Good organizational skills. Experience with project management helpful but not required.',
    image_url: 'https://images.unsplash.com/photo-1603819033403-993a1dd19ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80',
    category: 'Disaster Relief'
  },
  {
    title: 'Community Cleanup Drive',
    description: 'Join our community-wide cleanup initiative to remove trash and debris from streets, parks, and public spaces. Make an immediate visual impact on our community!',
    requirements: 'Gloves and trash bags provided. Wear suitable clothing and footwear for outdoor work.',
    image_url: 'https://images.unsplash.com/photo-1618477460930-d8bphkea31a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    category: 'Environment'
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
          organization_contact: orgContact,
          category: event.category
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
