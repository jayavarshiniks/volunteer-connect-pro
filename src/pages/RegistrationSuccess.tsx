
import { useLocation, Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const RegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: eventId } = useParams();
  const registrationData = location.state?.registrationData;

  const qrData = location.search ? JSON.parse(decodeURIComponent(location.search.slice(1))) : null;
  const displayData = registrationData || qrData;

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId
  });

  useEffect(() => {
    if (!displayData) {
      navigate('/events');
    }
  }, [displayData, navigate]);

  if (!displayData) {
    return null;
  }

  const qrValue = JSON.stringify({
    registrationId: displayData.registrationId,
    eventId: displayData.eventId,
    userId: displayData.userId,
    name: displayData.name,
    email: displayData.email,
    phone: displayData.phone,
    timestamp: displayData.timestamp
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
              <p><span className="font-medium">Registration ID:</span> {displayData.registrationId}</p>
              <p><span className="font-medium">Name:</span> {displayData.name}</p>
              <p><span className="font-medium">Email:</span> {displayData.email}</p>
              <p><span className="font-medium">Phone:</span> {displayData.phone}</p>
              {displayData.emergency_contact && (
                <p><span className="font-medium">Emergency Contact:</span> {displayData.emergency_contact}</p>
              )}
              {displayData.dietary_restrictions && (
                <p><span className="font-medium">Dietary Restrictions:</span> {displayData.dietary_restrictions}</p>
              )}
              <p><span className="font-medium">Event:</span> {event?.title}</p>
              <p><span className="font-medium">Registration Time:</span> {new Date(displayData.timestamp).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-xl font-semibold">Your Registration QR Code</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QRCodeSVG 
                value={qrValue} 
                size={200} 
                level="H"
                includeMargin={true}
              />
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
