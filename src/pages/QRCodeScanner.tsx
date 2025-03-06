import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const QRCodeScanner = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle successful QR code scan
  const handleScan = async (data: string) => {
    if (!data) return;
    
    setScanResult(data);
    setIsVerifying(true);
    setScanError(null);
    
    try {
      // Parse the QR code data
      const parsedData = JSON.parse(data);
      console.log("Parsed QR data:", parsedData);
      
      if (!parsedData.registrationId) {
        throw new Error("Invalid QR code: Missing registration ID");
      }
      
      // Verify the registration in the database
      const { data: registration, error } = await supabase
        .from('registrations')
        .select(`
          id,
          event_id,
          user_id,
          registration_time,
          emergency_contact,
          dietary_restrictions,
          notes,
          profiles:user_id (
            full_name,
            phone
          ),
          events:event_id (
            title,
            date,
            time,
            location
          )
        `)
        .eq('id', parsedData.registrationId)
        .single();
      
      if (error) throw error;
      if (!registration) throw new Error("Registration not found");
      
      console.log("Registration data:", registration);
      setRegistrationData(registration);
      
      toast.success("Registration verified successfully!");
    } catch (error: any) {
      console.error("Verification error:", error);
      setScanError(error.message || "Failed to verify registration");
      toast.error(`Failed to verify: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle QR scan error
  const handleError = (error: Error) => {
    console.error("QR scan error:", error);
    setScanError(error.message || "Failed to scan QR code");
    toast.error(`Scan error: ${error.message}`);
  };

  // If not logged in as organization, redirect
  if (user?.email) {
    // Check if user is organization (simplified check for demo)
    // In a real app, you'd check user role from your auth system
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">QR Code Scanner</h1>
      <Card className="max-w-xl mx-auto p-6">
        {!registrationData ? (
          <>
            <p className="mb-4 text-center">Scan a volunteer's registration QR code to verify their attendance.</p>
            <div className="mb-4 rounded-lg overflow-hidden">
              <QrScanner
                scanDelay={500}
                hideCount={true}
                onDecode={handleScan}
                onError={handleError}
                containerStyle={{ width: '100%', height: '300px' }}
              />
            </div>
            {scanError && (
              <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md">
                {scanError}
              </div>
            )}
            {isVerifying && (
              <div className="p-3 mb-4 bg-blue-100 text-blue-800 rounded-md">
                Verifying registration...
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-100 text-green-800 rounded-md">
              ✓ Registration Verified
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Volunteer Details</h2>
              <p><span className="font-medium">Name:</span> {registrationData.profiles?.full_name || 'Not provided'}</p>
              <p><span className="font-medium">Phone:</span> {registrationData.profiles?.phone || 'Not provided'}</p>
              {registrationData.emergency_contact && (
                <p><span className="font-medium">Emergency Contact:</span> {registrationData.emergency_contact}</p>
              )}
              {registrationData.dietary_restrictions && (
                <p><span className="font-medium">Dietary Restrictions:</span> {registrationData.dietary_restrictions}</p>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Event Details</h2>
              <p><span className="font-medium">Event:</span> {registrationData.events?.title || 'Unknown event'}</p>
              <p><span className="font-medium">Date/Time:</span> {registrationData.events?.date} at {registrationData.events?.time}</p>
              <p><span className="font-medium">Location:</span> {registrationData.events?.location}</p>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => setRegistrationData(null)}
              >
                Scan Another
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default QRCodeScanner;
