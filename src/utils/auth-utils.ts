
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = "volunteer" | "organization";

export const getUserProfile = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
  return profile;
};

export const handleAuthNavigation = async (userId: string, navigate: (path: string) => void) => {
  try {
    const profile = await getUserProfile(userId);
    const role = profile?.role as UserRole;

    switch (role) {
      case "organization":
        navigate("/organization/dashboard");
        break;
      case "volunteer":
        navigate("/events");
        break;
      default:
        console.error("Unknown user role:", role);
        navigate("/login");
    }
  } catch (error) {
    console.error("Navigation error:", error);
    navigate("/login");
  }
};

export const handleAuthError = (error: any) => {
  console.error("Auth error:", error);
  toast.error(error.message || "An authentication error occurred");
};
