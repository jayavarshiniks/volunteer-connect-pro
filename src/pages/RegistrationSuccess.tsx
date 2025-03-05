
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download } from "lucide-react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";

const RegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registrationData = location.state?.registrationData;
  const [qrValue, setQrValue] = useState("");

  // If no registration data is available, redirect to events page
  useEffect(() => {
    if (!registrationData) {
      navigate("/events");
    } else {
      // Generate QR code data as a JSON string
      const qrData = JSON.stringify({
        registrationId: registrationData.registrationId,
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone || 'Not provided',
        eventId: registrationData.eventId,
        eventTitle: registrationData.eventTitle || 'Event',
        timestamp: registrationData.timestamp,
        emergency_contact: registrationData.emergency_contact,
        dietary_restrictions: registrationData.dietary_restrictions
      });
      setQrValue(qrData);
    }
  }, [registrationData, navigate]);

  const handleDownloadQR = () => {
    const canvas = document.getElementById('registration-qr');
    if (!canvas) return;
    
    const svg = canvas.querySelector('svg');
    if (!svg) return;
    
    // Create a canvas element to convert SVG to PNG
    const canvasElement = document.createElement('canvas');
    canvasElement.width = 256;
    canvasElement.height = 256;
    
    // Get the SVG data URL
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const DOMURL = window.URL || window.webkitURL || window;
    const svgUrl = DOMURL.createObjectURL(svgBlob);
    
    // Create an image to draw on canvas
    const img = new Image();
    img.onload = () => {
      const ctx = canvasElement.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(svgUrl);
        
        // Convert canvas to PNG
        const pngUrl = canvasElement.toDataURL('image/png');
        
        // Create download link
        const downloadLink = document.createElement('a');
        const eventName = registrationData.eventTitle || 'Event';
        const fileName = `registration-${eventName}-${registrationData.registrationId}.png`;
        
        downloadLink.href = pngUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    img.src = svgUrl;
  };

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

        {/* QR Code Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg mb-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Your Registration QR Code</h2>
          <p className="text-gray-600 mb-4">
            Use this QR code to quickly check in at the event.
          </p>
          <div 
            id="registration-qr" 
            className="mx-auto bg-white p-4 rounded-lg shadow-sm inline-block"
          >
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "",
                excavate: true,
                width: 40,
                height: 40,
              }}
            />
          </div>
          <Button 
            onClick={handleDownloadQR}
            className="mt-4"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" /> Download QR Code
          </Button>
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
