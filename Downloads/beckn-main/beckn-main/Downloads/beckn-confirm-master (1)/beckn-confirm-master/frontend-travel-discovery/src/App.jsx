import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import SessionWarning from './components/SessionWarning';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import BookingPage from './pages/BookingPage';
import BookingDetails from './pages/BookingDetails';
import Bookings from './pages/Bookings';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import BookingConfirmation from './pages/BookingConfirmation';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <SessionWarning />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking-details" element={<BookingDetails />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
