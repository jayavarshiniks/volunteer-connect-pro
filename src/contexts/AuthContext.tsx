
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleAuthError, handleAuthNavigation, UserRole } from "@/utils/auth-utils";

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
    const initializeAuth = async () => {
      try {
        // Get the initial session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // Set up the auth state listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event);
          setUser(session?.user ?? null);

          // Handle session refresh
          if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
          }

          // Handle sign in
          if (event === 'SIGNED_IN' && session?.user) {
            await handleAuthNavigation(session.user.id, navigate);
          }

          // Handle sign out
          if (event === 'SIGNED_OUT') {
            setUser(null);
            navigate('/login');
          }
        });

        // Clean up loading state
        setLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [navigate]);

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      setLoading(true);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
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
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
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
      console.log("User role from profile:", userRole);

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
        await signOut();
      }
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear the user state
      setUser(null);
      
      // Navigate to login
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
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
