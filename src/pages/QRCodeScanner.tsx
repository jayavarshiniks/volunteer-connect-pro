
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const QRCodeScanner = () => {
  const [result, setResult] = useState<string>("");
  const navigate = useNavigate();

  const handleDecode = (result: string) => {
    setResult(result);
    
    try {
      // Check if result is a valid URL or event ID
      if (result.includes("/events/")) {
        const eventId = result.split("/events/")[1].split("?")[0];
        if (eventId) {
          toast.success("QR Code scanned successfully");
          navigate(`/events/${eventId}`);
        }
      } else {
        // If it's just an ID
        toast.success("QR Code scanned successfully");
        navigate(`/events/${result}`);
      }
    } catch (error) {
      toast.error("Invalid QR Code");
      console.error("Error parsing QR code:", error);
    }
  };

  const handleError = (error: any) => {
    console.error("QR scan error:", error);
    toast.error("Error scanning QR code");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Scan Event QR Code</h1>
      <Card className="p-6 max-w-md mx-auto">
        <div className="mb-4">
          <Scanner
            onResult={(text) => handleDecode(text)}
            onError={handleError}
            constraints={{
              facingMode: "environment"
            }}
            className="w-full aspect-square rounded-md overflow-hidden"
          />
        </div>
        {result && (
          <div className="mb-4 p-4 bg-gray-100 rounded-md">
            <p className="font-medium">Result:</p>
            <p className="break-words">{result}</p>
          </div>
        )}
        <Button onClick={() => navigate(-1)} className="w-full">
          Back
        </Button>
      </Card>
    </div>
  );
};

export default QRCodeScanner;
