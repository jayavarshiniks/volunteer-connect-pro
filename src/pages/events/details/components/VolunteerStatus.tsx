
import React from 'react';

interface VolunteerStatusProps {
  currentVolunteers: number;
  volunteersNeeded: number;
}

const VolunteerStatus: React.FC<VolunteerStatusProps> = ({ 
  currentVolunteers, 
  volunteersNeeded 
}) => {
  const spotsRemaining = volunteersNeeded - currentVolunteers;
  const progressPercentage = (currentVolunteers / volunteersNeeded) * 100;
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Volunteer Status</h2>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-gray-600">
          <span className="font-medium">{spotsRemaining}</span> spots remaining
        </p>
        <p className="text-sm text-gray-500">
          {currentVolunteers} volunteers registered out of {volunteersNeeded} needed
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerStatus;
