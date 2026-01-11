import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [sessionExpiry, setSessionExpiry] = useState(null);
    const [showSessionWarning, setShowSessionWarning] = useState(false);
    
    const sessionCheckInterval = useRef(null);
    const warningTimeout = useRef(null);
    const logoutTimeout = useRef(null);

    const API_URL = 'http://localhost:8081/api/auth';

    // Clear all timers
    const clearTimers = useCallback(() => {
        if (sessionCheckInterval.current) {
            clearInterval(sessionCheckInterval.current);
            sessionCheckInterval.current = null;
        }
        if (warningTimeout.current) {
            clearTimeout(warningTimeout.current);
            warningTimeout.current = null;
        }
        if (logoutTimeout.current) {
            clearTimeout(logoutTimeout.current);
            logoutTimeout.current = null;
        }
    }, []);

    // Setup session monitoring
    const setupSessionMonitoring = useCallback((expiryTime) => {
        clearTimers();
        
        const expiryDate = new Date(expiryTime);
        const now = new Date();
        const timeUntilExpiry = expiryDate.getTime() - now.getTime();
        
        if (timeUntilExpiry <= 0) {
            logout();
            return;
        }

        setSessionExpiry(expiryDate);

        // Show warning 5 minutes before expiry
        const warningTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);
        if (warningTime > 0) {
            warningTimeout.current = setTimeout(() => {
                setShowSessionWarning(true);
            }, warningTime);
        } else {
            setShowSessionWarning(true);
        }

        // Auto logout at expiry
        logoutTimeout.current = setTimeout(() => {
            logout();
            alert('Your session has expired. Please log in again.');
        }, timeUntilExpiry);

        // Check session status every minute
        sessionCheckInterval.current = setInterval(async () => {
            try {
                const response = await axios.get(`${API_URL}/session`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (!response.data.isValid) {
                    logout();
                    alert('Your session has expired. Please log in again.');
                }
            } catch (error) {
                if (error.response?.data?.code === 'SESSION_EXPIRED') {
                    logout();
                    alert('Your session has expired. Please log in again.');
                }
            }
        }, 60000); // Check every minute
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
            clearTimers();
        }
        
        return () => clearTimers();
    }, [token, setupSessionMonitoring]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data.user);
            
            // Get session info to setup monitoring
            const sessionResponse = await axios.get(`${API_URL}/session`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (sessionResponse.data.isValid) {
                setupSessionMonitoring(sessionResponse.data.expiresAt);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            if (error.response?.data?.code === 'SESSION_EXPIRED') {
                alert('Your session has expired. Please log in again.');
            }
            logout();
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            // Don't auto-login after registration
            // User must login manually
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Registration failed' 
            };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            const { token, user, expiresAt } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('sessionExpiry', expiresAt);
            setToken(token);
            setUser(user);
            setShowSessionWarning(false);
            
            // Setup session monitoring
            setupSessionMonitoring(expiresAt);
            
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Login failed' 
            };
        }
    };

    const logout = useCallback(async () => {
        try {
            if (token) {
                await axios.post(`${API_URL}/logout`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('sessionExpiry');
            setToken(null);
            setUser(null);
            setSessionExpiry(null);
            setShowSessionWarning(false);
            clearTimers();
        }
    }, [token, clearTimers]);

    // Extend session (in a real app, this would refresh the token)
    const extendSession = useCallback(() => {
        setShowSessionWarning(false);
        // In a production app, you would call an API to refresh the token
        // For now, we'll just hide the warning
    }, []);

    // Get remaining session time
    const getSessionTimeLeft = useCallback(() => {
        if (!sessionExpiry) return 0;
        const now = new Date();
        const timeLeft = Math.max(0, sessionExpiry.getTime() - now.getTime());
        return Math.floor(timeLeft / 1000); // Return seconds
    }, [sessionExpiry]);

    const value = {
        user,
        token,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user,
        sessionExpiry,
        showSessionWarning,
        extendSession,
        getSessionTimeLeft
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
