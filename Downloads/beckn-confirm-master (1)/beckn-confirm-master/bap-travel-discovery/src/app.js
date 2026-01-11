const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const becknRoutes = require('./routes/becknRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const bppMappingRoutes = require('./routes/bppMappingRoutes');
const errorHandler = require('./middleware/errorHandler');
const env = require('./config/env');

const app = express();
const PORT = env.PORT || 8080; 

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Beckn Travel Discovery BAP is running',
        service: 'BAP',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Booking Routes
app.use('/api/bookings', bookingRoutes);

// BPP Booking Mapping Routes
app.use('/api/bpp-mappings', bppMappingRoutes);

// Beckn Protocol Routes (Primary)
app.use('/beckn', becknRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Beckn Travel Discovery BAP is running on http://localhost:${PORT}`);
    console.log(`📋 Health check available at: http://localhost:${PORT}/health`);
    console.log(`🔄 Beckn endpoints available at: http://localhost:${PORT}/beckn/*`);
    console.log(`🔐 Auth endpoints available at: http://localhost:${PORT}/api/auth/*`);
    console.log(`📚 Booking endpoints available at: http://localhost:${PORT}/api/bookings/*`);
    console.log(`🔗 BPP Mapping endpoints available at: http://localhost:${PORT}/api/bpp-mappings/*`);
});

module.exports = app;