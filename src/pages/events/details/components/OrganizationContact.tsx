
import React from 'react';
import { Mail, Phone } from 'lucide-react';

interface OrganizationContactProps {
  contact: string;
}

const OrganizationContact: React.FC<OrganizationContactProps> = ({ contact }) => {
  const isEmail = contact.includes('@');
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Organization Contact</h2>
      <div className="bg-gray-50 p-4 rounded-lg">
        {isEmail ? (
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            <a href={`mailto:${contact}`} className="text-blue-600 hover:underline">
              {contact}
            </a>
          </div>
        ) : (
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            <a href={`tel:${contact}`} className="text-blue-600 hover:underline">
              {contact}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationContact;
