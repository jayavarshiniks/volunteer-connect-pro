
import React from 'react';
import { format } from 'date-fns';
import { Users } from 'lucide-react';

interface Volunteer {
  id: string;
  registration_time: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    phone: string | null;
    profile_image_url: string | null;
  } | null;
}

interface RegisteredVolunteersProps {
  volunteers: Volunteer[];
}

const RegisteredVolunteers: React.FC<RegisteredVolunteersProps> = ({ volunteers }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Registered Volunteers</h2>
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        {volunteers.map((registration) => (
          <div key={registration.id} className="flex items-center gap-3 p-2 border-b last:border-0">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {registration.profiles?.profile_image_url ? (
                <img 
                  src={registration.profiles.profile_image_url} 
                  alt={registration.profiles.full_name || 'Volunteer'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users size={16} />
              )}
            </div>
            <div>
              <p className="font-medium">{registration.profiles?.full_name || 'Anonymous Volunteer'}</p>
              {registration.profiles?.phone && (
                <p className="text-sm text-gray-500">{registration.profiles.phone}</p>
              )}
            </div>
            <div className="text-xs text-gray-500 ml-auto">
              Registered {format(new Date(registration.registration_time), 'MMM d, yyyy')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegisteredVolunteers;
