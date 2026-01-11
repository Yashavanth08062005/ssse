import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, User, MapPin, Phone, Mail, CreditCard, Calendar } from 'lucide-react';
import axios from 'axios';

const BookingDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Initialize selectedFlight from location.state or sessionStorage
    const [selectedFlight, setSelectedFlight] = useState(() => {
        const savedFlight = sessionStorage.getItem('currentBookingFlight');
        return location.state?.flight || (savedFlight ? JSON.parse(savedFlight) : null);
    });

    // Save flight to sessionStorage when available
    useEffect(() => {
        if (selectedFlight) {
            sessionStorage.setItem('currentBookingFlight', JSON.stringify(selectedFlight));
        }
    }, [selectedFlight]);

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
    const [errors, setErrors] = useState({});

    // Update formData when user data becomes available
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                passenger_name: prev.passenger_name || user.full_name || '',
                email: prev.email || user.email || '',
                phone: prev.phone || user.phone || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        if (authLoading) return; // Wait for auth check to complete

        if (!isAuthenticated) {
            // Save current path to redirect back after login
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        if (!selectedFlight) {
            navigate('/');
        }
    }, [isAuthenticated, authLoading, selectedFlight, navigate, location.pathname]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600 font-medium">Loading booking details...</p>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for phone number: numbers only, max 10 digits
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData({
                ...formData,
                [name]: numericValue
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.passenger_name.trim()) newErrors.passenger_name = 'Full Name is required';
        if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of Birth is required';
        if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone Number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (!formData.address.trim()) newErrors.address = 'Street Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';

        if (!formData.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(formData.pincode)) {
            newErrors.pincode = 'Pincode must be 6 digits';
        }

        if (!formData.country.trim()) newErrors.country = 'Country is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

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
                                                value={formData.passenger_name}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.passenger_name ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="Enter full name"
                                            />
                                            {errors.passenger_name && <p className="mt-1 text-xs text-red-500">{errors.passenger_name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date of Birth *
                                            </label>
                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                value={formData.date_of_birth}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {errors.date_of_birth && <p className="mt-1 text-xs text-red-500">{errors.date_of_birth}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nationality *
                                            </label>
                                            <input
                                                type="text"
                                                name="nationality"
                                                value={formData.nationality}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nationality ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="Indian"
                                            />
                                            {errors.nationality && <p className="mt-1 text-xs text-red-500">{errors.nationality}</p>}
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
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="your@email.com"
                                            />
                                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                maxLength={10}
                                                inputMode="numeric"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="9876543210"
                                            />
                                            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
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
                                                value={formData.address}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="House no, Street name"
                                            />
                                            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="City"
                                                />
                                                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    State *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="State"
                                                />
                                                {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Pincode *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    value={formData.pincode}
                                                    onChange={handleChange}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="123456"
                                                />
                                                {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Country *
                                            </label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="India"
                                            />
                                            {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
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
