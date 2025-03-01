
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { seedEvents } from "@/scripts/seed-events";
import { toast } from "sonner";

const DevEventSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedEvents = async () => {
    setIsSeeding(true);
    try {
      await seedEvents();
      toast.success("Successfully created sample events!");
    } catch (error) {
      console.error("Error seeding events:", error);
      toast.error("Failed to create sample events");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="my-4 p-3 bg-gray-100 rounded-md">
      <h3 className="text-sm font-medium mb-2">Developer Tools</h3>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleSeedEvents}
        disabled={isSeeding}
      >
        {isSeeding ? "Creating Events..." : "Create Sample Events"}
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        This will create several sample upcoming events with random dates and locations.
      </p>
    </div>
  );
};

export default DevEventSeeder;
