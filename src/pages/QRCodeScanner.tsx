
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { QrCode, UserCheck, UserX, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const QRCodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [registrationDetails, setRegistrationDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if the user is an organization
  useEffect(() => {
    const checkIfOrganization = async () => {
      if (!user) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data.role !== 'organization') {
          toast.error("Only organizations can access the QR scanner");
          navigate("/events");
        }
      } catch (error: any) {
        toast.error(error.message);
        navigate("/events");
      }
    };

    checkIfOrganization();
  }, [user, navigate]);

  // Start QR scanning
  const startScanning = async () => {
    setScanning(true);
    setScannedData(null);
    setRegistrationDetails(null);
    setVerified(false);

    try {
      const constraints = { video: { facingMode: "environment" } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Begin scanning frames for QR codes
        requestAnimationFrame(scanQRCode);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
      setScanning(false);
    }
  };

  // Stop the camera and scanning
  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  // Function to scan each video frame for QR codes
  const scanQRCode = async () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      try {
        // Using the BarcodeDetector API if available
        if ('BarcodeDetector' in window) {
          // @ts-ignore - BarcodeDetector might not be recognized by TypeScript
          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await barcodeDetector.detect(canvas);
          
          if (barcodes.length > 0) {
            const scannedValue = barcodes[0].rawValue;
            handleScannedData(scannedValue);
            return;
          }
        }
      } catch (error) {
        console.error("Error scanning QR code:", error);
      }
    }
    
    // Continue scanning if no QR code was detected
    if (scanning) {
      requestAnimationFrame(scanQRCode);
    }
  };

  // Handle the data from a scanned QR code
  const handleScannedData = (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      setScannedData(parsedData);
      stopScanning();
      verifyRegistration(parsedData);
    } catch (error) {
      console.error("Error parsing QR code data:", error);
      toast.error("Invalid QR code format");
    }
  };

  // Verify the registration against the database
  const verifyRegistration = async (data: any) => {
    if (!data || !data.registrationId || !data.eventId || !data.userId) {
      toast.error("Invalid registration data");
      return;
    }

    setLoading(true);

    try {
      // Fetch the registration details from the database
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
            phone,
            profile_image_url
          ),
          events:event_id (
            title,
            date,
            time,
            location,
            organization_id
          )
        `)
        .eq('event_id', data.eventId)
        .eq('user_id', data.userId)
        .single();

      if (error) throw error;
      
      if (!registration) {
        toast.error("Registration not found");
        setLoading(false);
        return;
      }
      
      // Check if the event belongs to the current organization
      if (registration.events.organization_id !== user?.id) {
        toast.error("You do not have permission to verify this registration");
        setLoading(false);
        return;
      }

      setRegistrationDetails(registration);
      setVerified(true);
      toast.success("Registration verified successfully");
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Reset the scanner
  const resetScanner = () => {
    setScannedData(null);
    setRegistrationDetails(null);
    setVerified(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-6">
          <QrCode className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold">QR Code Scanner</h1>
          <p className="text-gray-600 mt-2">
            Scan volunteer registration QR codes to verify attendance
          </p>
        </div>

        <div className="mb-6">
          {scanning ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <video 
                  ref={videoRef} 
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                />
                <canvas 
                  ref={canvasRef} 
                  className="hidden"
                />
                <div className="absolute inset-0 border-2 border-dashed border-primary/50 m-4 pointer-events-none"></div>
              </div>
              <Button onClick={stopScanning} className="w-full">
                Cancel Scanning
              </Button>
            </div>
          ) : (
            <div>
              {scannedData && registrationDetails ? (
                <div className="space-y-6">
                  <div className={`p-4 rounded-lg ${verified ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center mb-4">
                      {verified ? (
                        <UserCheck className="w-6 h-6 text-green-500 mr-2" />
                      ) : (
                        <UserX className="w-6 h-6 text-red-500 mr-2" />
                      )}
                      <h2 className="text-xl font-semibold">
                        {verified ? 'Registration Verified' : 'Verification Failed'}
                      </h2>
                    </div>

                    {registrationDetails && (
                      <div className="space-y-3">
                        <p>
                          <span className="font-medium">Name:</span> {registrationDetails.profiles.full_name}
                        </p>
                        <p>
                          <span className="font-medium">Event:</span> {registrationDetails.events.title}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span> {format(new Date(registrationDetails.events.date), 'PPP')}
                        </p>
                        <p>
                          <span className="font-medium">Time:</span> {registrationDetails.events.time}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span> {registrationDetails.profiles.phone || 'Not provided'}
                        </p>
                        
                        {registrationDetails.emergency_contact && (
                          <p>
                            <span className="font-medium">Emergency Contact:</span> {registrationDetails.emergency_contact}
                          </p>
                        )}
                        
                        {registrationDetails.dietary_restrictions && (
                          <p>
                            <span className="font-medium">Dietary Restrictions:</span> {registrationDetails.dietary_restrictions}
                          </p>
                        )}
                        
                        {registrationDetails.notes && (
                          <p>
                            <span className="font-medium">Notes:</span> {registrationDetails.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button onClick={resetScanner} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Scan Another QR Code
                  </Button>
                </div>
              ) : (
                <Button onClick={startScanning} className="w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Start Scanning"}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500">
          <p className="mb-2"><strong>Instructions:</strong></p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click "Start Scanning" and allow camera access</li>
            <li>Point your camera at a volunteer's registration QR code</li>
            <li>The system will automatically verify their registration</li>
            <li>Only QR codes for events organized by you can be verified</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};

export default QRCodeScanner;
