import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const Landing = () => {
  const highlightedEvents = [{
    id: 1,
    title: "Beach Cleanup Drive",
    organization: "Ocean Care",
    date: "2024-04-15"
  }, {
    id: 2,
    title: "Food Bank Distribution",
    organization: "Community Helpers",
    date: "2024-04-20"
  }];
  const reviews = [{
    id: 1,
    name: "Sarah Johnson",
    role: "Volunteer",
    content: "I've found amazing opportunities to give back to my community through this platform.",
    rating: 5
  }, {
    id: 2,
    name: "Green Earth NGO",
    role: "Organization",
    content: "This platform has helped us connect with dedicated volunteers who share our mission.",
    rating: 5
  }, {
    id: 3,
    name: "Michael Chen",
    role: "Volunteer",
    content: "The experience of volunteering has been transformative. Highly recommend!",
    rating: 5
  }];

  // Smooth scroll function
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle hash changes for direct links
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      setTimeout(() => {
        scrollToSection(id);
      }, 100);
    }
  }, []);

  return <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-50 to-secondary-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Make a Difference in Your Community
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-[fade-in_0.6s_ease-out]">
              Connect with meaningful volunteer opportunities and create positive change.
            </p>
            <div className="flex justify-center gap-4 animate-[fade-in_0.8s_ease-out]">
              <Link to="/register">
                <Button size="lg" className="hover-scale">Become an Organizer</Button>
              </Link>
              <Link to="/events">
                <Button variant="outline" size="lg" className="hover-scale">Browse Events</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 animate-fade-in">About Us</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-600 mb-6 animate-[fade-in_0.4s_ease-out]">
              We are dedicated to connecting passionate volunteers with organizations making real impact in communities. Our platform makes it easy for people to find meaningful volunteer opportunities and for organizations to find dedicated helpers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect</h3>
                <p className="text-gray-600">Connect with organizations and volunteers in your area</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Engage</h3>
                <p className="text-gray-600">Participate in meaningful volunteer opportunities</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Impact</h3>
                <p className="text-gray-600">Make a real difference in your community</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlighted Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Highlighted Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlightedEvents.map(event => <Card key={event.id} className="p-6">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-2">{event.organization}</p>
                <p className="text-sm text-gray-500 mb-4">📅 {event.date}</p>
                <Link to={`/events/${event.id}`}>
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What People Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map(review => <Card key={review.id} className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{review.name}</h3>
                    <p className="text-sm text-gray-500">{review.role}</p>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(review.rating)].map((_, i) => <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>)}
                  </div>
                </div>
                <p className="text-gray-600">{review.content}</p>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">Contact Us</h2>
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-[fade-in_0.4s_ease-out]">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
                <p className="text-gray-600 mb-4">Have questions or suggestions? We'd love to hear from you.</p>
                <div className="space-y-2">
                  <p className="text-gray-600"><strong>Email:</strong> info@volunteerconnect.com</p>
                  <p className="text-gray-600"><strong>Phone:</strong> (555) 123-4567</p>
                  <p className="text-gray-600"><strong>Address:</strong> 123 Volunteer Street, Community City, ST 12345</p>
                </div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold mb-4">Office Hours</h3>
                <p className="text-gray-600 mb-4">We're here to help during these hours:</p>
                <div className="space-y-2">
                  <p className="text-gray-600"><strong>Monday-Friday:</strong> 9:00 AM - 6:00 PM</p>
                  <p className="text-gray-600"><strong>Saturday:</strong> 10:00 AM - 4:00 PM</p>
                  <p className="text-gray-600"><strong>Sunday:</strong> Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Make an Impact?</h2>
            <p className="text-xl text-white/80 mb-8">Join thousands of volunteers creating positive change.</p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-neutral-50 bg-primary-500 hover:bg-primary-400 hover-scale">
                Become an Organizer Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>;
};
export default Landing;
