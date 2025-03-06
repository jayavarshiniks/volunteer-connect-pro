
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create an event");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    setLoading(true);

    try {
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('event-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }

      const eventData = {
        title: String(formData.get('title')),
        description: String(formData.get('description')),
        date: String(formData.get('date')),
        time: String(formData.get('time')),
        location: String(formData.get('location')),
        location_lat: null,
        location_lng: null,
        volunteers_needed: parseInt(String(formData.get('volunteers')), 10),
        requirements: formData.get('requirements') ? String(formData.get('requirements')) : null,
        image_url: imageUrl,
        organization_id: user.id,
        organization_contact: String(formData.get('contact')),
        category: formData.get('category') ? String(formData.get('category')) : null
      };

      const { error } = await supabase
        .from('events')
        .insert(eventData);

      if (error) throw error;

      toast.success("Event created successfully!");
      navigate("/organization/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Create New Event</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="description">Event Description</Label>
            <Textarea id="description" name="description" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input type="date" id="date" name="date" required />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input type="time" id="time" name="time" required />
            </div>
          </div>
          
          <div>
            <Label htmlFor="category">Event Category</Label>
            <select 
              id="category" 
              name="category" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="">-- Select Category --</option>
              <option value="Environment">Environment</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Community Service">Community Service</option>
              <option value="Animal Welfare">Animal Welfare</option>
              <option value="Homelessness">Homelessness</option>
              <option value="Elderly Care">Elderly Care</option>
              <option value="Food Distribution">Food Distribution</option>
              <option value="Disaster Relief">Disaster Relief</option>
              <option value="Youth Development">Youth Development</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              name="location"
              placeholder="Enter event location" 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="volunteers">Number of Volunteers Needed</Label>
            <Input type="number" id="volunteers" name="volunteers" min="1" required />
          </div>
          <div>
            <Label htmlFor="contact">Organization Contact (Email or Phone)</Label>
            <Input id="contact" name="contact" required />
          </div>
          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea 
              id="requirements" 
              name="requirements" 
              placeholder="List any specific requirements for volunteers" 
            />
          </div>
          <div>
            <Label htmlFor="image">Event Image</Label>
            <div className="mt-1 flex items-center">
              <Input
                id="image"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image')?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {imageFile ? 'Change Image' : 'Upload Image'}
              </Button>
            </div>
            {imageFile && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {imageFile.name}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Event..." : "Create Event"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateEvent;
