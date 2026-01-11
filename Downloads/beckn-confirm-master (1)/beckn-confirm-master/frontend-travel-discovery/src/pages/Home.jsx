import React, { useRef, useState } from 'react';
import SearchForm from '../components/SearchForm';
import { Sparkles, Shield, Clock, Award } from 'lucide-react';

const Home = () => {
  const searchRef = useRef(null);
  const [prefill, setPrefill] = useState({ origin: '', destination: '' });

 const routes = [
  { from: 'Delhi', fromCode: 'DEL', to: 'Mumbai', toCode: 'BOM', price: '₹3,500' },
  { from: 'Bangalore', fromCode: 'BLR', to: 'Goa', toCode: 'GOI', price: '₹2,800' },
  { from: 'Chennai', fromCode: 'MAA', to: 'Kolkata', toCode: 'CCU', price: '₹4,200' },
  { from: 'Hyderabad', fromCode: 'HYD', to: 'Pune', toCode: 'PNQ', price: '₹2,500' },
  { from: 'Jaipur', fromCode: 'JAI', to: 'Udaipur', toCode: 'UDR', price: '₹1,800' },
  { from: 'Ahmedabad', fromCode: 'AMD', to: 'Surat', toCode: 'STV', price: '₹800' },
];


  const handleViewOptions = ( from,fromCode,to, toCode) => {
    setPrefill({ origin: fromCode, destination: toCode });
    searchRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    { icon: <Sparkles className="h-8 w-8 text-blue-600" />, title: 'Multi-Modal Search', description: 'Search flights, trains, and buses all in one place' },
    { icon: <Shield className="h-8 w-8 text-blue-600" />, title: 'Secure Booking', description: 'Your bookings are safe and secure with us' },
    { icon: <Clock className="h-8 w-8 text-blue-600" />, title: 'Real-Time Updates', description: 'Get instant updates on availability and prices' },
    { icon: <Award className="h-8 w-8 text-blue-600" />, title: 'Best Prices', description: 'Compare prices from multiple providers instantly' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Your Journey Starts Here</h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-100">Discover, compare, and book the best travel options across India</p>
      </div>

      {/* Search Form */}
      <div ref={searchRef} className="max-w-7xl mx-auto px-4 pb-16">
        <SearchForm prefill={prefill} />
      </div>

      {/* Features Section */}
      <div className="bg-gray-100 py-16 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose TravelHub?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Routes Section */}
      <div className="py-16 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Popular Routes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routes.map((route, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-lg font-bold">{route.from}</p>
                  <p className="text-sm text-gray-500">to</p>
                  <p className="text-lg font-bold">{route.to}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Starting from</p>
                  <p className="text-2xl font-bold text-blue-600">{route.price}</p>
                </div>
              </div>
              <button
                onClick={() => handleViewOptions(route.from,route.fromCode, route.to,route.toCode)}
                className="w-full btn-primary text-sm"
              >
                View Options
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">Join thousands of travelers who trust TravelHub for their travel needs</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            Start Searching Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
