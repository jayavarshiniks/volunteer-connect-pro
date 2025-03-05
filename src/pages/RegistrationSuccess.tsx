
import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download, Calendar } from "lucide-react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";

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

  // QR code data - create a JSON string with essential verification data
  const qrCodeData = JSON.stringify({
    registrationId: registrationData.registrationId,
    eventId: registrationData.eventId,
    userId: registrationData.userId,
    name: registrationData.name,
    timestamp: registrationData.timestamp
  });

  // Function to print QR code
  const handlePrintQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Event Registration QR Code</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; }
            h1 { color: #333; font-size: 24px; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 5px; }
            .qr-container { margin: 30px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Event Registration: ${registrationData.name}</h1>
            <p>Event: ${registrationData.eventTitle || 'Event'}</p>
            <p>Registration ID: ${registrationData.registrationId}</p>
            <p>Registered on: ${formattedDate}</p>
            <div class="qr-container" id="qrcode"></div>
            <p>Please bring this QR code to the event for verification.</p>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
          <script>
            QRCode.toCanvas(document.getElementById('qrcode'), '${qrCodeData.replace(/'/g, "\\'")}', function (error) {
              if (error) console.error(error);
            });
            setTimeout(() => { window.print(); }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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

        {/* QR Code Section */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Event QR Code</h2>
            <Button variant="outline" size="sm" onClick={handlePrintQRCode}>
              <Download className="w-4 h-4 mr-2" />
              Print QR Code
            </Button>
          </div>
          <div className="flex justify-center p-4 bg-white rounded-md">
            <QRCodeSVG
              value={qrCodeData}
              size={200}
              level="H"
              includeMargin={true}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
            />
          </div>
          <p className="text-sm text-gray-500 text-center mt-4">
            Please present this QR code when you arrive at the event for verification.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Link to={`/events/${registrationData.eventId}`}>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Back to Event
            </Button>
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
