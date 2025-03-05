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
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">Volunteer Connect</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/events" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Browse Events
              </Link>
              {isOrganization && (
                <Link to="/organization/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
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
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            ) : (
              <>
                {userProfile?.role === 'organization' && (
                  <>
                    <Link to="/organization-dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                      Dashboard
                    </Link>
                    <Link to="/qr-scanner" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                      QR Scanner
                    </Link>
                  </>
                )}
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
