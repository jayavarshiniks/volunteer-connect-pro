
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRound, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error in handleSignOut:", error);
      // Even if there's an error, we'll still try to redirect
      navigate("/login");
      toast.error("There was a problem signing out. Please try again.");
    }
  };

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/#' + id);
      return;
    }
    
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isOrganization = userProfile?.role === 'organization';

  const getProfilePath = () => {
    return userProfile?.role === 'organization' 
      ? '/profile/organization'
      : '/profile/volunteer';
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex-1">
            <span className="text-2xl font-bold text-primary">Volunteer Connect</span>
          </Link>
          <div className="hidden md:flex flex-1 items-center justify-center space-x-6">
            <Link to="/events" className="text-gray-600 hover:text-gray-900">Events</Link>
            {isOrganization && (
              <Link to="/organization/dashboard" className="text-gray-600 hover:text-gray-900">
                Organization Dashboard
              </Link>
            )}
            <button 
              onClick={() => scrollToSection('about')}
              className="text-gray-600 hover:text-gray-900"
            >
              About Us
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-gray-600 hover:text-gray-900"
            >
              Contact
            </button>
          </div>
          <div className="flex-1 flex items-center justify-end space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <UserRound className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(getProfilePath())}>
                    Profile
                  </DropdownMenuItem>
                  {isOrganization && (
                    <DropdownMenuItem onClick={() => navigate('/organization/dashboard')}>
                      Organization Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
