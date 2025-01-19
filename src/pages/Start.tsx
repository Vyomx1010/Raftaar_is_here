import React from 'react';
import { Link } from 'react-router-dom';
import { Car, User, Shield, Clock, MapPin, Star, ChevronRight } from 'lucide-react';

const Start = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=2000&q=80"
            alt="Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 pt-12 pb-24">
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8" />
              <span className="text-2xl font-bold">Raftaar</span>
            </div>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium hover:text-gray-300 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Your Journey, Our Priority
            </h1>
            <p className="text-xl text-gray-300 mb-12">
              Experience safe, reliable rides at your fingertips. Join millions of riders who trust Raftaar for their daily commute.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <User className="w-5 h-5" />
                Ride with Raftaar
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/driver/signup"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-black text-white border-2 border-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
              >
                <Car className="w-5 h-5" />
                Drive with Raftaar
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-black py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose Raftaar?</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Safety First</h3>
              <p className="text-gray-400">
                Your safety is our top priority. Every ride is tracked and drivers are thoroughly vetted.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Always Available</h3>
              <p className="text-gray-400">
                Need a ride at 3 AM? We've got you covered. Our service runs 24/7, rain or shine.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Everywhere You Are</h3>
              <p className="text-gray-400">
                Available in 10,000+ cities worldwide. Your reliable ride is just a tap away.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">What Our Users Say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Daily Commuter",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
                text: "Raftaar has made my daily commute so much easier. The drivers are professional and the cars are always clean."
              },
              {
                name: "Michael Chen",
                role: "Business Traveler",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
                text: "As a frequent business traveler, I appreciate the consistency and reliability of Raftaar's service."
              },
              {
                name: "Emily Rodriguez",
                role: "Weekend Explorer",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
                text: "The app is so user-friendly, and I love how I can track my ride in real-time. Great service!"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-300">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-6 w-6" />
              <span className="text-xl font-bold">Raftaar</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Safety</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Help</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Raftaar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Start;