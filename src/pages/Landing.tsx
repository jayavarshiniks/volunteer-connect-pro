import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Landing = () => {
  const highlightedEvents = [
    {
      id: 1,
      title: "Beach Cleanup Drive",
      organization: "Ocean Care",
      date: "2024-04-15",
    },
    {
      id: 2,
      title: "Food Bank Distribution",
      organization: "Community Helpers",
      date: "2024-04-20",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-50 to-secondary-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Make a Difference in Your Community
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with meaningful volunteer opportunities and create positive change.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/events">
                <Button variant="outline" size="lg">Browse Events</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlighted Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Highlighted Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlightedEvents.map((event) => (
              <Card key={event.id} className="p-6">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-2">{event.organization}</p>
                <p className="text-sm text-gray-500 mb-4">📅 {event.date}</p>
                <Link to={`/events/${event.id}`}>
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose VolunteerHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy to Join</h3>
              <p className="text-gray-600">Sign up in minutes and start making a difference today.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Opportunities</h3>
              <p className="text-gray-600">Discover volunteer events that match your interests and schedule.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Impact</h3>
              <p className="text-gray-600">Monitor your volunteering journey and celebrate your contributions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Make an Impact?</h2>
            <p className="text-xl text-white/80 mb-8">Join thousands of volunteers creating positive change.</p>
            <Link to="/register">
              <Button size="lg" variant="secondary">Get Started Now</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
