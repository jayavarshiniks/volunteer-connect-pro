
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Upload, Search } from "lucide-react";

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [locationName, setLocationName] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  useEffect(() => {
    if (!window.google) {
      const googleMapsScript = document.createElement('script');
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyOdOhoFdBnw3QOgUXp4qjRPT0tG1htpb-g&libraries=places&callback=initMap`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;
      window.initMap = initializeMap;
      document.head.appendChild(googleMapsScript);
      
      return () => {
        window.google = undefined;
        document.head.removeChild(googleMapsScript);
      };
    } else if (mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    if (mapRef.current && window.google) {
      const defaultLocation = { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco
      
      const mapOptions = {
        zoom: 13,
        center: defaultLocation,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      };
      
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
      geocoderRef.current = new window.google.maps.Geocoder();
      
      markerRef.current = new window.google.maps.Marker({
        position: defaultLocation,
        map: mapInstanceRef.current,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });
      
      window.google.maps.event.addListener(mapInstanceRef.current, 'click', (event: any) => {
        const clickedLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        setMarkerPosition(clickedLocation);
      });
      
      window.google.maps.event.addListener(markerRef.current, 'dragend', () => {
        const position = markerRef.current.getPosition();
        const markerLocation = {
          lat: position.lat(),
          lng: position.lng()
        };
        setCoordinates(markerLocation);
        getAddressFromCoordinates(markerLocation);
      });
      
      const input = document.getElementById('location-search') as HTMLInputElement;
      const searchBox = new window.google.maps.places.SearchBox(input);
      
      mapInstanceRef.current.addListener('bounds_changed', () => {
        searchBox.setBounds(mapInstanceRef.current.getBounds());
      });
      
      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;
        
        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;
        
        mapInstanceRef.current.setCenter(place.geometry.location);
        mapInstanceRef.current.setZoom(15);
        
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setMarkerPosition(newLocation);
      });
      
      setMapLoaded(true);
    }
  };
  
  const setMarkerPosition = (location: {lat: number, lng: number}) => {
    if (markerRef.current && window.google) {
      markerRef.current.setPosition(location);
      setCoordinates(location);
      getAddressFromCoordinates(location);
    }
  };
  
  const getAddressFromCoordinates = (location: {lat: number, lng: number}) => {
    if (geocoderRef.current) {
      geocoderRef.current.geocode({ location }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          setLocationName(results[0].formatted_address);
        } else {
          setLocationName(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
        }
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoordinates(location);
          setUseCurrentLocation(true);
          
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setCenter(location);
            setMarkerPosition(location);
          }
          
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

      const finalLocation = locationName || (coordinates ? `${coordinates.lat}, ${coordinates.lng}` : String(formData.get('location')));

      const eventData = {
        title: String(formData.get('title')),
        description: String(formData.get('description')),
        date: String(formData.get('date')),
        time: String(formData.get('time')),
        location: finalLocation,
        location_lat: coordinates?.lat || null,
        location_lng: coordinates?.lng || null,
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
            <div className="flex gap-2 mb-2">
              <div className="relative flex-grow">
                <Input 
                  id="location-search" 
                  name="location"
                  placeholder="Search for a location"
                  required 
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={getCurrentLocation}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Current
              </Button>
            </div>
            
            <div 
              ref={mapRef} 
              className="w-full h-64 bg-gray-100 rounded-md mb-2 border border-gray-200"
            ></div>
            
            {coordinates && (
              <p className="text-sm text-gray-500">
                Selected coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            )}
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
