
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Upload, Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EditEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    volunteers_needed: 0,
    requirements: '',
    organization_contact: '',
  });

  const { data: event } = useQuery({
    queryKey: ['edit-event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        volunteers_needed: event.volunteers_needed,
        requirements: event.requirements || '',
        organization_contact: event.organization_contact,
      });

      if (event.location_lat && event.location_lng) {
        setCoordinates({
          lat: event.location_lat,
          lng: event.location_lng
        });
      }
    }
  }, [event]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setUseCurrentLocation(true);
          toast.success("Location obtained successfully!");
        },
        (error) => {
          toast.error("Error getting location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleDeleteEvent = async () => {
    if (!user || !event) {
      toast.error("You must be logged in to delete an event");
      return;
    }

    setDeleteLoading(true);

    try {
      // First check if the event has any registrations
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', id);

      if (regError) throw regError;

      // Delete all registrations first
      if (registrations && registrations.length > 0) {
        const { error: deleteRegError } = await supabase
          .from('registrations')
          .delete()
          .eq('event_id', id);

        if (deleteRegError) throw deleteRegError;
      }

      // Then delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('organization_id', user.id);

      if (error) throw error;

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      await queryClient.invalidateQueries({ queryKey: ['organization-events'] });

      toast.success("Event deleted successfully!");
      navigate("/organization/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !event) {
      toast.error("You must be logged in to update an event");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = event.image_url;
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
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        location_lat: coordinates?.lat || null,
        location_lng: coordinates?.lng || null,
        volunteers_needed: parseInt(formData.volunteers_needed.toString(), 10),
        requirements: formData.requirements || null,
        image_url: imageUrl,
        organization_contact: formData.organization_contact
      };

      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .eq('organization_id', user.id);

      if (error) throw error;

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['event', id] });
      await queryClient.invalidateQueries({ queryKey: ['edit-event', id] });
      await queryClient.invalidateQueries({ queryKey: ['organization-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });

      toast.success("Event updated successfully!");
      navigate("/organization/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Event</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input 
              id="title" 
              name="title" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>
          <div>
            <Label htmlFor="description">Event Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input 
                type="date" 
                id="date" 
                name="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required 
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input 
                type="time" 
                id="time" 
                name="time" 
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required 
              />
            </div>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="flex gap-2">
              <Input 
                id="location" 
                name="location" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required 
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={getCurrentLocation}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Use Current
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="volunteers">Number of Volunteers Needed</Label>
            <Input 
              type="number" 
              id="volunteers" 
              name="volunteers" 
              min={event.current_volunteers} 
              value={formData.volunteers_needed}
              onChange={(e) => setFormData({...formData, volunteers_needed: parseInt(e.target.value)})}
              required 
            />
            {event.current_volunteers > 0 && (
              <p className="text-sm text-amber-600 mt-1">
                {event.current_volunteers} volunteers have already registered.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="contact">Organization Contact (Email or Phone)</Label>
            <Input 
              id="contact" 
              name="contact" 
              value={formData.organization_contact}
              onChange={(e) => setFormData({...formData, organization_contact: e.target.value})}
              required 
            />
          </div>
          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea 
              id="requirements" 
              name="requirements" 
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              placeholder="List any specific requirements for volunteers" 
            />
          </div>
          <div>
            <Label htmlFor="image">Event Image</Label>
            {event.image_url && (
              <div className="mb-2">
                <img 
                  src={event.image_url} 
                  alt="Current event image" 
                  className="h-32 w-auto object-cover rounded-md"
                />
              </div>
            )}
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
                {imageFile ? 'Change Image' : 'Upload New Image'}
              </Button>
            </div>
            {imageFile && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {imageFile.name}
              </p>
            )}
          </div>
          <div className="flex justify-between space-x-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" className="flex items-center">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Event
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the event
                    and all registrations associated with it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteEvent}
                    disabled={deleteLoading}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteLoading ? "Deleting..." : "Delete Event"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="flex space-x-2 ml-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/organization/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating Event..." : "Update Event"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditEvent;
