
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import type { Profile } from "@/types/database";

const OrganizationProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { data: profile, refetch } = useQuery({
    queryKey: ['organization-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user
  });

  const [formData, setFormData] = useState<Partial<Profile>>({
    organization_name: '',
    phone: '',
    organization_description: '',
    organization_website: '',
    location: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        organization_name: profile.organization_name || '',
        phone: profile.phone || '',
        organization_description: profile.organization_description || '',
        organization_website: profile.organization_website || '',
        location: profile.location || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user?.id);

      if (error) throw error;
      
      await refetch();
      toast.success("Organization profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Organization Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Organization Name</label>
            <Input
              value={formData.organization_name}
              onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
              placeholder="Enter organization name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contact Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter contact phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter organization location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <Input
              value={formData.organization_website}
              onChange={(e) => setFormData(prev => ({ ...prev, organization_website: e.target.value }))}
              placeholder="Enter organization website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={formData.organization_description}
              onChange={(e) => setFormData(prev => ({ ...prev, organization_description: e.target.value }))}
              placeholder="Describe your organization"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default OrganizationProfile;
