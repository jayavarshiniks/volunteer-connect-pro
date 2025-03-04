
import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";

const RegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registrationData = location.state?.registrationData;

  // If no registration data is available, redirect to events page
  useEffect(() => {
    if (!registrationData) {
      navigate("/events");
    }
  }, [registrationData, navigate]);

  if (!registrationData) {
    return null; // Will be handled by useEffect redirect
  }

  const formattedDate = registrationData.timestamp 
    ? format(new Date(registrationData.timestamp), 'PPP')
    : 'N/A';

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-700">Registration Successful!</h1>
          <p className="text-gray-600 mt-2">
            Thank you for volunteering. Your registration has been confirmed.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Registration Details</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Registration ID:</span> {registrationData.registrationId}</p>
            <p><span className="font-medium">Name:</span> {registrationData.name}</p>
            <p><span className="font-medium">Email:</span> {registrationData.email}</p>
            <p><span className="font-medium">Phone:</span> {registrationData.phone || 'Not provided'}</p>
            <p><span className="font-medium">Registered on:</span> {formattedDate}</p>
            
            {registrationData.emergency_contact && (
              <p><span className="font-medium">Emergency Contact:</span> {registrationData.emergency_contact}</p>
            )}
            
            {registrationData.dietary_restrictions && (
              <p><span className="font-medium">Dietary Restrictions:</span> {registrationData.dietary_restrictions}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Link to={`/events/${registrationData.eventId}`}>
            <Button variant="outline">Back to Event</Button>
          </Link>
          <Link to="/events">
            <Button>Browse More Events</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;
