import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
                        <h1 className="text-3xl font-bold text-white">My Profile</h1>
                        <p className="text-blue-100 mt-2">Manage your account information</p>
                    </div>

                    <div className="px-6 py-8">
                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-4">
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Full Name
                                </label>
                                <p className="text-lg text-gray-900">{user.full_name}</p>
                            </div>

                            <div className="border-b border-gray-200 pb-4">
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Email Address
                                </label>
                                <p className="text-lg text-gray-900">{user.email}</p>
                            </div>

                            {user.phone && (
                                <div className="border-b border-gray-200 pb-4">
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Phone Number
                                    </label>
                                    <p className="text-lg text-gray-900">{user.phone}</p>
                                </div>
                            )}

                            <div className="border-b border-gray-200 pb-4">
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Member Since
                                </label>
                                <p className="text-lg text-gray-900">
                                    {new Date(user.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Back to Home
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
