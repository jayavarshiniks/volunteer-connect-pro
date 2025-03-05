
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";

interface RegistrationData {
  registrationId: string;
  name: string;
  email: string;
  phone?: string;
  eventId: string;
  eventTitle?: string;
  timestamp: string;
  emergency_contact?: string;
  dietary_restrictions?: string;
}

const QRCodeScanner = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  const handleScan = async (data: string) => {
    try {
      if (data) {
        setScanning(false);
        
        // Parse the QR code data
        const parsedData = JSON.parse(data) as RegistrationData;
        setRegistrationData(parsedData);
        
        toast.success("Registration verified!");
      }
    } catch (error) {
      console.error("Error parsing QR code:", error);
      toast.error("Invalid QR code format");
    }
  };

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("QR Scanner error:", errorMessage);
    toast.error(`QR Scanner error: ${errorMessage}`);
  };

  const handleReset = () => {
    setScanning(true);
    setRegistrationData(null);
  };

  const handleBackToEvents = () => {
    navigate("/events");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-xl mx-auto p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">QR Code Scanner</h1>
          <p className="text-gray-600 mt-2">
            Scan a registration QR code to verify volunteer details
          </p>
        </div>

        {scanning ? (
          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <Scanner
                onResult={handleScan}
                onError={handleError}
                containerStyle={{
                  width: '100%',
                  height: '300px',
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Position the QR code within the scanner frame
            </p>
          </div>
        ) : registrationData ? (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-3">Registration Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Registration ID:</span> {registrationData.registrationId}</p>
              <p><span className="font-medium">Name:</span> {registrationData.name}</p>
              <p><span className="font-medium">Email:</span> {registrationData.email}</p>
              <p><span className="font-medium">Phone:</span> {registrationData.phone || 'Not provided'}</p>
              <p><span className="font-medium">Event:</span> {registrationData.eventTitle || 'Not specified'}</p>
              <p><span className="font-medium">Registration Date:</span> {new Date(registrationData.timestamp).toLocaleDateString()}</p>
              
              {registrationData.emergency_contact && (
                <p><span className="font-medium">Emergency Contact:</span> {registrationData.emergency_contact}</p>
              )}
              
              {registrationData.dietary_restrictions && (
                <p><span className="font-medium">Dietary Restrictions:</span> {registrationData.dietary_restrictions}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-yellow-600">Could not read QR code. Please try again.</p>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBackToEvents}>
            Back to Events
          </Button>
          {!scanning && (
            <Button onClick={handleReset}>
              Scan Another Code
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default QRCodeScanner;
