
export interface Profile {
  id: string;
  role: 'volunteer' | 'organization';
  created_at: string;
  updated_at: string;
  full_name?: string;
  phone?: string;
  bio?: string;
  organization_name?: string;
  organization_description?: string;
  organization_website?: string;
  location?: string;
  profile_image_url?: string;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  registration_time: string;
  emergency_contact?: string;
  dietary_restrictions?: string;
  notes?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url?: string;
  requirements?: string;
  volunteers_needed: number;
  current_volunteers: number;
  organization_id: string;
  organization_contact: string;
  category?: string;
  created_at: string;
  updated_at: string;
  location_lat?: number;
  location_lng?: number;
}
