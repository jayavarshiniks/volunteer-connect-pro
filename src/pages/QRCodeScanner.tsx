
import { useState, useEffect } from "react";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const QRCodeScanner = () => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [registrationDetails, setRegistrationDetails] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is organization
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        toast.error("Please login to access this page");
        navigate("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !profile || profile.role !== "organization") {
        toast.error("You do not have permission to access this page");
        navigate("/events");
      }
    };

    checkUserRole();
  }, [user, navigate]);

  const handleScan = async (data: string) => {
    if (!data || verificationStatus === "verifying") return;
    
    try {
      setVerificationStatus("verifying");
      setScanResult(data);
      
      // Parse QR code data
      const parsedData = JSON.parse(data);
      console.log("Parsed QR data:", parsedData);
      
      if (!parsedData.eventId || !parsedData.userId || !parsedData.registrationId) {
        setVerificationStatus("error");
        toast.error("Invalid QR code format");
        return;
      }

      // Verify against database
      const { data: registration, error } = await supabase
        .from("registrations")
        .select(`
          id,
          registration_time,
          emergency_contact,
          dietary_restrictions,
          notes,
          events:event_id (
            title,
            date,
            time,
            location
          ),
          profiles:user_id (
            full_name,
            email:id,
            phone
          )
        `)
        .eq("event_id", parsedData.eventId)
        .eq("user_id", parsedData.userId)
        .single();

      if (error || !registration) {
        console.error("Verification error:", error);
        setVerificationStatus("error");
        toast.error("Registration not found in database");
        return;
      }

      // Set registration details
      setRegistrationDetails({
        ...registration,
        registrationId: parsedData.registrationId,
        scannedAt: new Date().toISOString()
      });
      
      setVerificationStatus("success");
      toast.success("Registration verified successfully!");
    } catch (error) {
      console.error("QR verification error:", error);
      setVerificationStatus("error");
      toast.error("Failed to verify QR code");
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setVerificationStatus("idle");
    setRegistrationDetails(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">QR Code Scanner</h1>
        
        {verificationStatus === "idle" && (
          <Card className="p-6">
            <div className="mb-4 text-center">
              <p className="text-gray-600 mb-6">
                Scan a volunteer's QR code to verify their registration.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg overflow-hidden">
              <QrScanner
                onDecode={handleScan}
                onError={(error) => {
                  console.error(error);
                  toast.error("Scanner error: " + error.message);
                }}
                containerStyle={{ width: '100%', height: '350px' }}
              />
            </div>
          </Card>
        )}

        {(verificationStatus === "verifying" || verificationStatus === "error" || verificationStatus === "success") && (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center mb-6">
              {verificationStatus === "verifying" && (
                <>
                  <div className="animate-pulse">
                    <UserCheck className="w-16 h-16 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold mt-4">Verifying Registration...</h2>
                </>
              )}
              
              {verificationStatus === "error" && (
                <>
                  <AlertCircle className="w-16 h-16 text-red-500" />
                  <h2 className="text-xl font-semibold mt-4 text-red-600">Verification Failed</h2>
                  <p className="text-gray-600 mt-2">This QR code could not be verified.</p>
                </>
              )}
              
              {verificationStatus === "success" && registrationDetails && (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <h2 className="text-xl font-semibold mt-4 text-green-600">Registration Verified</h2>
                  
                  <div className="w-full mt-6 bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Volunteer Details</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {registrationDetails.profiles?.full_name}</p>
                      <p><span className="font-medium">Registration ID:</span> {registrationDetails.registrationId}</p>
                      <p><span className="font-medium">Event:</span> {registrationDetails.events?.title}</p>
                      <p><span className="font-medium">Date:</span> {registrationDetails.events?.date}</p>
                      <p><span className="font-medium">Time:</span> {registrationDetails.events?.time}</p>
                      <p><span className="font-medium">Location:</span> {registrationDetails.events?.location}</p>
                      
                      {registrationDetails.emergency_contact && (
                        <p><span className="font-medium">Emergency Contact:</span> {registrationDetails.emergency_contact}</p>
                      )}
                      
                      {registrationDetails.dietary_restrictions && (
                        <p><span className="font-medium">Dietary Restrictions:</span> {registrationDetails.dietary_restrictions}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-center">
              <Button onClick={resetScanner}>
                Scan Another Code
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;
