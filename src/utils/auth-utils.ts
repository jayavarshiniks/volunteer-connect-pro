
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

  if (!profile) {
    console.error("No profile found for user:", userId);
    throw new Error("No profile found");
  }

  return profile;
};

export const handleAuthNavigation = async (userId: string, navigate: (path: string) => void) => {
  try {
    const profile = await getUserProfile(userId);
    const role = profile?.role as UserRole;
    console.log("User role:", role); // Debug log

    switch (role) {
      case "organization":
        navigate("/organization/dashboard");
        break;
      case "volunteer":
        navigate("/events");
        break;
      default:
        console.error("Unknown user role:", role);
        toast.error("Invalid user role");
        navigate("/login");
    }
  } catch (error) {
    console.error("Navigation error:", error);
    toast.error("Error determining user role");
    navigate("/login");
  }
};

export const handleAuthError = (error: any) => {
  console.error("Auth error:", error);
  toast.error(error.message || "An authentication error occurred");
};
