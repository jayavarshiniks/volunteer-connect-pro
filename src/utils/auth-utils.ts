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
  if (role === "volunteer") {
    navigate("/events");
  } else if (role === "organization") {
    navigate("/organization/dashboard");
  } else {
    navigate("/login");
  }
};

export const handleAuthError = (error: any) => {
  console.error("Auth error:", error);
  toast.error(error.message);
};