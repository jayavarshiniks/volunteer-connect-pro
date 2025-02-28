
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import EventRegistration from "./pages/EventRegistration";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import VolunteerProfile from "./pages/profile/VolunteerProfile";
import OrganizationProfile from "./pages/profile/OrganizationProfile";
import NotFound from "./pages/NotFound";
import RegistrationSuccess from "./pages/RegistrationSuccess";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <TooltipProvider>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/events/:id/register" element={<EventRegistration />} />
                <Route path="/events/:id/registration-success" element={<RegistrationSuccess />} />
                <Route path="/events/create" element={<CreateEvent />} />
                <Route path="/events/:id/edit" element={<EditEvent />} />
                <Route path="/organization/dashboard" element={<OrganizationDashboard />} />
                <Route path="/profile/volunteer" element={<VolunteerProfile />} />
                <Route path="/profile/organization" element={<OrganizationProfile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </main>
          <Footer />
        </div>
        <Toaster />
        <Sonner />
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
