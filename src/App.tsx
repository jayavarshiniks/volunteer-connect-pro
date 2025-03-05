import { Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Events from "@/pages/Events";
import EventDetails from "@/pages/EventDetails";
import EventRegistration from "@/pages/EventRegistration";
import EditEvent from "@/pages/EditEvent";
import CreateEvent from "@/pages/CreateEvent";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import OrganizationDashboard from "@/pages/OrganizationDashboard";
import RegistrationSuccess from "@/pages/RegistrationSuccess";
import NotFound from "@/pages/NotFound";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";
import QRCodeScanner from "@/pages/QRCodeScanner";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/events/:id/register" element={<EventRegistration />} />
          <Route path="/events/:id/edit" element={<EditEvent />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/organization-dashboard" element={<OrganizationDashboard />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/qr-scanner" element={<QRCodeScanner />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
