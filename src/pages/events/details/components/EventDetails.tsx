
import React from 'react';
import { format } from 'date-fns';

interface EventDetailsProps {
  date: string;
  time: string;
  location: string;
  description: string;
}

const EventDetails: React.FC<EventDetailsProps> = ({ 
  date, 
  time, 
  location, 
  description 
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Event Details</h2>
      <p className="text-gray-600 mb-2">
        📅 Date: {format(new Date(date), 'PPP')} at {time}
      </p>
      <p className="text-gray-600 mb-2">
        📍 Location: {location}
      </p>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default EventDetails;
