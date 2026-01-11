const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'beckn-travel-secret-key-change-in-production';
const JWT_EXPIRES_IN = '45m'; // 45 minutes session timeout

class AuthController {
    /**
     * Register a new user
     */
    async register(req, res) {
        try {
            const { email, password, full_name, phone } = req.body;

            // Validate input
            if (!email || !password || !full_name) {
                return res.status(400).json({ 
                    error: 'Email, password, and full name are required' 
                });
            }

            // Check if user already exists
            const existingUser = await db.query(
                'SELECT * FROM users WHERE email = $1',
                [email.toLowerCase()]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({ 
                    error: 'User with this email already exists' 
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            const result = await db.query(
                'INSERT INTO users (email, password, full_name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, phone, created_at',
                [email.toLowerCase(), hashedPassword, full_name, phone]
            );

            const user = result.rows[0];

            // Generate JWT token with 45-minute expiration
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    email: user.email,
                    iat: Math.floor(Date.now() / 1000) // issued at time
                }, 
                JWT_SECRET, 
                { expiresIn: JWT_EXPIRES_IN }
            );

            // Calculate expiration time for frontend
            const expiresAt = new Date(Date.now() + 45 * 60 * 1000); // 45 minutes from now

            console.log(`✅ New user registered: ${user.email}, session expires at: ${expiresAt}`);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token,
                expiresAt: expiresAt.toISOString(),
                expiresIn: 45 * 60, // 45 minutes in seconds
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone,
                    created_at: user.created_at
                }
            });
        } catch (error) {
            console.error('❌ Registration error:', error);
            res.status(500).json({ 
                error: 'Registration failed. Please try again.' 
            });
        }
    }

    /**
     * Login user
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({ 
                    error: 'Email and password are required' 
                });
            }

            // Find user by email
            const result = await db.query(
                'SELECT * FROM users WHERE email = $1',
                [email.toLowerCase()]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ 
                    error: 'Invalid email or password' 
                });
            }

            const user = result.rows[0];

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({ 
                    error: 'Invalid email or password' 
                });
            }

            // Generate JWT token with 45-minute expiration
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    email: user.email,
                    iat: Math.floor(Date.now() / 1000) // issued at time
                }, 
                JWT_SECRET, 
                { expiresIn: JWT_EXPIRES_IN }
            );

            // Calculate expiration time for frontend
            const expiresAt = new Date(Date.now() + 45 * 60 * 1000); // 45 minutes from now

            console.log(`✅ User logged in: ${user.email}, session expires at: ${expiresAt}`);

            res.json({
                success: true,
                message: 'Login successful',
                token,
                expiresAt: expiresAt.toISOString(),
                expiresIn: 45 * 60, // 45 minutes in seconds
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone,
                    created_at: user.created_at
                }
            });
        } catch (error) {
            console.error('❌ Login error:', error);
            res.status(500).json({ 
                error: 'Login failed. Please try again.' 
            });
        }
    }

    /**
     * Get user profile (protected route)
     */
    async getProfile(req, res) {
        try {
            const result = await db.query(
                'SELECT id, email, full_name, phone, created_at FROM users WHERE id = $1',
                [req.userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    error: 'User not found' 
                });
            }

            res.json({
                success: true,
                user: result.rows[0]
            });
        } catch (error) {
            console.error('❌ Get profile error:', error);
            res.status(500).json({ 
                error: 'Failed to get profile' 
            });
        }
    }

    /**
     * Update user profile (protected route)
     */
    async updateProfile(req, res) {
        try {
            const { full_name, phone } = req.body;

            const result = await db.query(
                'UPDATE users SET full_name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, email, full_name, phone, updated_at',
                [full_name, phone, req.userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    error: 'User not found' 
                });
            }

            console.log(`✅ Profile updated: ${result.rows[0].email}`);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: result.rows[0]
            });
        } catch (error) {
            console.error('❌ Update profile error:', error);
            res.status(500).json({ 
                error: 'Failed to update profile' 
            });
        }
    }

    /**
     * Verify token (for frontend to check if token is valid)
     */
    async verifyToken(req, res) {
        try {
            // Token is already verified by middleware, just return user info
            const result = await db.query(
                'SELECT id, email, full_name, phone FROM users WHERE id = $1',
                [req.userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: 'User not found' 
                });
            }

            res.json({
                success: true,
                message: 'Token is valid',
                user: result.rows[0],
                userId: req.userId,
                email: req.userEmail
            });
        } catch (error) {
            console.error('❌ Token verification error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Token verification failed' 
            });
        }
    }

    /**
     * Logout user (invalidate session)
     */
    async logout(req, res) {
        try {
            // In a more advanced implementation, you would maintain a blacklist of tokens
            // For now, we'll just return success and let frontend handle token removal
            console.log(`✅ User logged out: ${req.userEmail}`);
            
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('❌ Logout error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Logout failed' 
            });
        }
    }

    /**
     * Check session status
     */
    async checkSession(req, res) {
        try {
            // Get token expiration info
            const decoded = jwt.decode(req.headers.authorization?.split(' ')[1]);
            const now = Math.floor(Date.now() / 1000);
            const timeLeft = decoded.exp - now;

            res.json({
                success: true,
                isValid: timeLeft > 0,
                expiresAt: new Date(decoded.exp * 1000).toISOString(),
                timeLeftSeconds: Math.max(0, timeLeft),
                timeLeftMinutes: Math.max(0, Math.floor(timeLeft / 60))
            });
        } catch (error) {
            console.error('❌ Session check error:', error);
            res.status(401).json({ 
                success: false,
                error: 'Invalid session',
                isValid: false
            });
        }
    }
}

module.exports = new AuthController();
