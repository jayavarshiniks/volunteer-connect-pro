
import React from 'react';

interface EventHeaderProps {
  title: string;
  imageUrl?: string;
}

const EventHeader: React.FC<EventHeaderProps> = ({ title, imageUrl }) => {
  return (
    <>
      {imageUrl && (
        <div className="mb-6">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
    </>
  );
};

export default EventHeader;
