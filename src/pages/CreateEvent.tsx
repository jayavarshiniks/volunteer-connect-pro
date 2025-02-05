import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CreateEvent = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Event created successfully!");
    navigate("/organization/dashboard");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Create New Event</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" required />
          </div>
          <div>
            <Label htmlFor="description">Event Description</Label>
            <Textarea id="description" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input type="date" id="date" required />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input type="time" id="time" required />
            </div>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" required />
          </div>
          <div>
            <Label htmlFor="volunteers">Number of Volunteers Needed</Label>
            <Input type="number" id="volunteers" min="1" required />
          </div>
          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea id="requirements" placeholder="List any specific requirements for volunteers" />
          </div>
          <Button type="submit" className="w-full">
            Create Event
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateEvent;