
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import QRCode from 'qrcode.react';
import { useEffect } from 'react';

const RegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registrationData = location.state?.registrationData;

  useEffect(() => {
    if (!registrationData) {
      navigate('/events');
    }
  }, [registrationData, navigate]);

  if (!registrationData) {
    return null;
  }

  const qrData = JSON.stringify({
    registrationId: registrationData.registrationId,
    eventId: registrationData.eventId,
    name: registrationData.name,
    email: registrationData.email,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">Registration Successful!</h1>
          <p className="text-gray-600">Thank you for registering for the event.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Registration Details</h2>
            <div className="space-y-3">
              <p><span className="font-medium">Name:</span> {registrationData.name}</p>
              <p><span className="font-medium">Email:</span> {registrationData.email}</p>
              <p><span className="font-medium">Phone:</span> {registrationData.phone}</p>
              {registrationData.requirements && (
                <p><span className="font-medium">Special Requirements:</span> {registrationData.requirements}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-xl font-semibold">Your Registration QR Code</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QRCode value={qrData} size={200} level="H" />
            </div>
            <p className="text-sm text-gray-600">
              Please present this QR code when you arrive at the event.
            </p>
          </div>

          <div className="flex justify-center space-x-4 mt-8">
            <Link to="/events">
              <Button variant="outline">Back to Events</Button>
            </Link>
            <Button onClick={() => window.print()}>Print Details</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;
