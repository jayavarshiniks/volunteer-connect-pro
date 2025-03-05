
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download } from "lucide-react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const RegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registrationData = location.state?.registrationData;
  const [qrValue, setQrValue] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);

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

  // Function to download the entire page as PDF
  const handleDownloadPage = async () => {
    if (!pageRef.current) return;
    
    try {
      // Use a slight delay to ensure QR code is fully rendered
      setTimeout(async () => {
        const canvas = await html2canvas(pageRef.current, {
          scale: 2, // Higher quality
          logging: false,
          useCORS: true,
          allowTaint: true,
          imageTimeout: 2000 // Longer timeout to ensure QR code renders
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        const eventName = registrationData.eventTitle || 'Event';
        const fileName = `registration-${eventName}-${registrationData.registrationId}.pdf`;
        pdf.save(fileName);
      }, 300); // Small delay to ensure rendering
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (!registrationData) {
    return null; // Will be handled by useEffect redirect
  }

  const formattedDate = registrationData.timestamp 
    ? format(new Date(registrationData.timestamp), 'PPP')
    : 'N/A';

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-8" ref={pageRef}>
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
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Link to={`/events/${registrationData.eventId}`}>
            <Button variant="outline">Back to Event</Button>
          </Link>
          <Button onClick={handleDownloadPage}>
            <Download className="mr-2 h-4 w-4" /> Download Registration Page
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;
