import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, User, MapPin, Phone, Mail, CreditCard, Calendar } from 'lucide-react';
import axios from 'axios';

const BookingDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const selectedFlight = location.state?.flight;

    // Debug: Log flight data to see structure
    useEffect(() => {
        if (selectedFlight) {
            console.log('Selected Flight Data:', selectedFlight);
            console.log('Flight Details:', selectedFlight.details);
            console.log('Origin:', selectedFlight.origin);
            console.log('Destination:', selectedFlight.destination);
        }
    }, [selectedFlight]);

    const [formData, setFormData] = useState({
        passenger_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        date_of_birth: '',
        passport_number: '',
        nationality: 'Indian'
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/booking' } });
        }
        if (!selectedFlight) {
            navigate('/');
        }
    }, [isAuthenticated, selectedFlight, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Call Beckn /select API
            const selectResponse = await axios.post('http://localhost:8081/beckn/select', {
                context: {
                    domain: 'mobility',
                    action: 'select',
                    transaction_id: `txn-${Date.now()}`,
                    message_id: `msg-${Date.now()}`,
                    bap_id: 'travel-discovery-bap.example.com',
                    bap_uri: 'http://localhost:8081'
                },
                message: {
                    order: {
                        items: [{
                            id: selectedFlight.id || `flight-${Date.now()}`,
                            descriptor: {
                                name: selectedFlight.details?.airline || selectedFlight.descriptor?.name || 'Flight',
                                code: selectedFlight.details?.flightNumber || selectedFlight.descriptor?.code || 'N/A'
                            },
                            price: {
                                currency: 'INR',
                                value: selectedFlight.price?.toString() || '0'
                            }
                        }],
                        billing: {
                            name: formData.passenger_name,
                            email: formData.email,
                            phone: formData.phone,
                            address: {
                                door: formData.address,
                                city: formData.city,
                                state: formData.state,
                                country: formData.country,
                                area_code: formData.pincode
                            }
                        },
                        fulfillment: {
                            customer: {
                                person: {
                                    name: formData.passenger_name,
                                    dob: formData.date_of_birth,
                                    nationality: formData.nationality
                                },
                                contact: {
                                    phone: formData.phone,
                                    email: formData.email
                                }
                            },
                            start: {
                                location: {
                                    descriptor: {
                                        name: selectedFlight.details?.departureAirport || selectedFlight.origin
                                    }
                                }
                            },
                            end: {
                                location: {
                                    descriptor: {
                                        name: selectedFlight.details?.arrivalAirport || selectedFlight.destination
                                    }
                                }
                            }
                        }
                    }
                }
            });

            console.log('Select Response:', selectResponse.data);
            setSuccess(true);
            
            // Redirect to confirmation page after 2 seconds
            setTimeout(() => {
                navigate('/booking-confirmation', { 
                    state: { 
                        booking: selectResponse.data,
                        flight: selectedFlight,
                        passenger: formData
                    } 
                });
            }, 2000);

        } catch (err) {
            console.error('Booking error:', err);
            setError(err.response?.data?.error || 'Booking failed. Please try again.');
            setLoading(false);
        }
    };

    if (!selectedFlight) {
        return null;
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-600">Redirecting to confirmation page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Results
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Flight Details - Left Side */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Flight Details</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Airline</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {selectedFlight.details?.airline || selectedFlight.descriptor?.name || 'Airline'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {selectedFlight.details?.flightNumber || selectedFlight.descriptor?.code || 'N/A'}
                                    </p>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500 mb-2">Route</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {selectedFlight.details?.departureAirport || selectedFlight.origin || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {selectedFlight.details?.originCity || ''}
                                                </p>
                                            </div>
                                            <div className="flex-1 flex items-center justify-center px-4">
                                                <div className="border-t-2 border-gray-300 flex-1"></div>
                                                <Plane className="h-5 w-5 text-blue-600 mx-2" />
                                                <div className="border-t-2 border-gray-300 flex-1"></div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {selectedFlight.details?.arrivalAirport || selectedFlight.destination || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {selectedFlight.details?.destinationCity || ''}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-center text-sm text-gray-600">
                                            Duration: {selectedFlight.details?.duration || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500">Price</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        ₹{selectedFlight.price || '0'}
                                    </p>
                                    <p className="text-xs text-gray-500">per person</p>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500 mb-2">Flight Info</p>
                                    <div className="space-y-2">
                                        {selectedFlight.details?.cabinClass && (
                                            <p className="text-sm text-gray-700">
                                                • Class: {selectedFlight.details.cabinClass}
                                            </p>
                                        )}
                                        {selectedFlight.details?.baggage && (
                                            <p className="text-sm text-gray-700">
                                                • Baggage: {selectedFlight.details.baggage}
                                            </p>
                                        )}
                                        {selectedFlight.details?.aircraft && (
                                            <p className="text-sm text-gray-700">
                                                • Aircraft: {selectedFlight.details.aircraft}
                                            </p>
                                        )}
                                        {selectedFlight.details?.stops !== undefined && (
                                            <p className="text-sm text-gray-700">
                                                • Stops: {selectedFlight.details.stops === 0 ? 'Non-stop' : selectedFlight.details.stops}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form - Right Side */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Traveller Details</h2>

                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <User className="h-5 w-5 mr-2 text-blue-600" />
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="passenger_name"
                                                required
                                                value={formData.passenger_name}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter full name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date of Birth *
                                            </label>
                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                required
                                                value={formData.date_of_birth}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nationality *
                                            </label>
                                            <input
                                                type="text"
                                                name="nationality"
                                                required
                                                value={formData.nationality}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Indian"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Passport Number
                                            </label>
                                            <input
                                                type="text"
                                                name="passport_number"
                                                value={formData.passport_number}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Optional for domestic"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Phone className="h-5 w-5 mr-2 text-blue-600" />
                                        Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="your@email.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="+91 1234567890"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                                        Address Information
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Street Address *
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                required
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="House no, Street name"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    required
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="City"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    State *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    required
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="State"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Pincode *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    required
                                                    value={formData.pincode}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="123456"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Country *
                                            </label>
                                            <input
                                                type="text"
                                                name="country"
                                                required
                                                value={formData.country}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="India"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="border-t pt-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="h-5 w-5 mr-2" />
                                                Confirm Booking - ₹{selectedFlight.price?.value}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
