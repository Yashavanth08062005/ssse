const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'beckn-travel-secret-key-change-in-production';

/**
 * Middleware to verify JWT token
 */
const authMiddleware = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ 
                error: 'No authorization token provided' 
            });
        }

        // Extract token (format: "Bearer TOKEN")
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'Invalid authorization format. Use: Bearer TOKEN' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if token is about to expire (less than 5 minutes left)
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = decoded.exp - now;
        
        if (timeLeft <= 0) {
            return res.status(401).json({ 
                error: 'Session has expired. Please login again.',
                expired: true,
                code: 'SESSION_EXPIRED'
            });
        }

        // Add user info to request object
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.tokenExpiry = decoded.exp;
        req.timeLeft = timeLeft;

        // Add warning header if session expires soon (less than 5 minutes)
        if (timeLeft < 300) { // 5 minutes
            res.setHeader('X-Session-Warning', 'Session expires soon');
            res.setHeader('X-Time-Left', timeLeft);
        }

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Session has expired. Please login again.',
                expired: true,
                code: 'SESSION_EXPIRED'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token' 
            });
        }

        console.error('❌ Auth middleware error:', error);
        return res.status(401).json({ 
            error: 'Authentication failed' 
        });
    }
};

module.exports = authMiddleware;
