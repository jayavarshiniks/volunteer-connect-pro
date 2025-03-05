
import React from 'react';
import { format } from 'date-fns';
import { Users, Phone, AlertCircle, UtensilsCrossed, MessageSquare } from 'lucide-react';

interface Volunteer {
  id: string;
  registration_time: string;
  user_id: string;
  emergency_contact?: string;
  dietary_restrictions?: string;
  notes?: string;
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
        {volunteers.length === 0 ? (
          <p className="text-gray-500 py-3 text-center">No volunteers have registered yet.</p>
        ) : (
          volunteers.map((registration) => (
            <div key={registration.id} className="bg-white p-3 rounded-md shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {registration.profiles?.profile_image_url ? (
                    <img 
                      src={registration.profiles.profile_image_url} 
                      alt={registration.profiles.full_name || 'Volunteer'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users size={18} />
                  )}
                </div>
                <div>
                  <p className="font-medium">{registration.profiles?.full_name || 'Anonymous Volunteer'}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone size={14} className="mr-1" />
                    {registration.profiles?.phone || 'No phone provided'}
                  </div>
                </div>
                <div className="text-xs text-gray-500 ml-auto">
                  Registered {format(new Date(registration.registration_time), 'MMM d, yyyy')}
                </div>
              </div>
              
              {/* Additional details */}
              {(registration.emergency_contact || registration.dietary_restrictions || registration.notes) && (
                <div className="mt-2 pt-2 border-t border-gray-100 grid gap-2 text-sm">
                  {registration.emergency_contact && (
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-amber-500 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Emergency Contact:</span> {registration.emergency_contact}
                      </div>
                    </div>
                  )}
                  
                  {registration.dietary_restrictions && (
                    <div className="flex items-start gap-2">
                      <UtensilsCrossed size={14} className="text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Dietary Needs:</span> {registration.dietary_restrictions}
                      </div>
                    </div>
                  )}
                  
                  {registration.notes && (
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} className="text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Notes:</span> {registration.notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RegisteredVolunteers;
