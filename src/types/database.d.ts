
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
}
