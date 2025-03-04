
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
        // Set loading state while we initialize
        setLoading(true);
        
        // Get the initial session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setLoading(false);
          return;
        }
        
        const session = sessionData?.session;
        console.log("Initial session check:", session ? "Session found" : "No session");
        
        // Set the user from the session
        setUser(session?.user ?? null);

        // Set up the auth state listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth state changed:", event);
          
          const newUser = newSession?.user ?? null;
          setUser(newUser);

          // Handle session refresh
          if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
          }

          // Handle sign in
          if (event === 'SIGNED_IN' && newUser) {
            console.log("User signed in:", newUser.id);
            await handleAuthNavigation(newUser.id, navigate);
          }

          // Handle sign out
          if (event === 'SIGNED_OUT') {
            console.log("User signed out");
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

      console.log("Sign in successful for user:", signInData.user.id);

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
      console.log("Signing out user...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }
      
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
