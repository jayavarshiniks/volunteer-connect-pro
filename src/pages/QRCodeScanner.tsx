
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Scanner } from '@yudiel/react-qr-scanner';
import { toast } from 'sonner';

const QRCodeScanner = () => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scannedJson, setScannedJson] = useState<any>(null);
  const navigate = useNavigate();

  const handleScan = (data: string) => {
    setScannedData(data);
    try {
      const jsonData = JSON.parse(data);
      setScannedJson(jsonData);
      toast.success("QR Code scanned successfully!");
    } catch (error) {
      toast.error("Invalid QR Code format");
      console.error("Error parsing QR data:", error);
    }
  };

  const handleError = (error: any) => {
    console.error("QR Scanner error:", error);
    toast.error("Error scanning QR code: " + error.message);
  };

  const handleViewEvent = () => {
    if (scannedJson && scannedJson.eventId) {
      navigate(`/events/${scannedJson.eventId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">QR Code Scanner</h1>
        <div className="mb-6">
          <Scanner 
            onScan={handleScan}
            onError={handleError}
            constraints={{ facingMode: "environment" }}
            className="w-full h-64 bg-gray-100 rounded-md overflow-hidden"
          />
        </div>

        {scannedData && (
          <div className="mt-4 p-4 border rounded-md">
            <h2 className="text-lg font-semibold mb-2">Scanned Information</h2>
            {scannedJson && (
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {scannedJson.name || 'Not provided'}</p>
                <p><span className="font-medium">Event:</span> {scannedJson.eventTitle || 'Not provided'}</p>
                <p><span className="font-medium">Registration ID:</span> {scannedJson.registrationId || 'Not provided'}</p>
                
                {scannedJson.eventId && (
                  <Button onClick={handleViewEvent} className="mt-2">
                    View Event Details
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default QRCodeScanner;
