import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Successfully registered for the event!");
    navigate("/events");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Event Registration</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" required />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input type="tel" id="phone" required />
          </div>
          <div>
            <Label htmlFor="requirements">Special Requirements or Notes</Label>
            <Textarea id="requirements" />
          </div>
          <Button type="submit" className="w-full">
            Confirm Registration
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default EventRegistration;