import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SessionWarning = () => {
    const { showSessionWarning, extendSession, logout, getSessionTimeLeft } = useAuth();
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (showSessionWarning) {
            const interval = setInterval(() => {
                const remaining = getSessionTimeLeft();
                setTimeLeft(remaining);
                
                if (remaining <= 0) {
                    clearInterval(interval);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [showSessionWarning, getSessionTimeLeft]);

    if (!showSessionWarning) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white p-4 shadow-lg">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold">Session Expiring Soon</h3>
                        <p className="text-sm">
                            Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')}. 
                            You will be automatically logged out.
                        </p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={extendSession}
                        className="bg-white text-yellow-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                        Stay Logged In
                    </button>
                    <button
                        onClick={logout}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors"
                    >
                        Logout Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionWarning;