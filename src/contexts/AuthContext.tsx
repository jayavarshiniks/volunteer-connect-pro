
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleAuthError, UserRole } from "@/utils/auth-utils";

type AuthContextType = {
  user: any;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role, // This role will be stored in user metadata
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("No user data returned");

      // Wait for the profile to be created
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (signUpData.user.id) {
        // Navigate based on role
        if (role === 'volunteer') {
          navigate('/events');
        } else if (role === 'organization') {
          navigate('/organization/dashboard');
        }
        toast.success("Account created successfully! Please check your email for verification.");
      }
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!signInData.user) throw new Error("No user data returned");

      // Fetch the user's role from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', signInData.user.id)
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error("No profile found");

      const userRole = profileData.role as UserRole;
      console.log("User role from profile:", userRole); // Debugging

      // Navigate based on role
      if (userRole === 'volunteer') {
        navigate('/events', { replace: true });
        toast.success("Welcome back, volunteer!");
      } else if (userRole === 'organization') {
        navigate('/organization/dashboard', { replace: true });
        toast.success("Welcome back, organization!");
      } else {
        console.error("Invalid user role:", userRole);
        toast.error("Invalid user role");
        await signOut(); // Sign out if role is invalid
      }
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
