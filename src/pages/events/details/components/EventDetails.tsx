
import React from 'react';
import { format } from "date-fns";

interface EventDetailsProps {
  date: string;
  time: string;
  location: string;
  description: string;
  category?: string;
}

const EventDetails: React.FC<EventDetailsProps> = ({ 
  date, 
  time, 
  location, 
  description,
  category
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600">
        <span>📅</span>
        <span>{format(new Date(date), 'PPP')} at {time}</span>
      </div>
      
      <div className="flex items-start gap-2 text-gray-600">
        <span className="mt-1">📍</span>
        <span>{location}</span>
      </div>
      
      {category && (
        <div className="mt-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
            {category}
          </span>
        </div>
      )}
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">About This Event</h3>
        <p className="text-gray-700 whitespace-pre-line">{description}</p>
      </div>
    </div>
  );
};

export default EventDetails;
