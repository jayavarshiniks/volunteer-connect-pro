
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = "volunteer" | "organization";

export const getUserProfile = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return profile;
};

export const handleAuthNavigation = (role: UserRole | null, navigate: (path: string) => void) => {
  switch (role) {
    case "organization":
      navigate("/organization/dashboard");
      break;
    case "volunteer":
      navigate("/events");
      break;
    default:
      navigate("/login");
  }
};

export const handleAuthError = (error: any) => {
  console.error("Auth error:", error);
  toast.error(error.message);
};
