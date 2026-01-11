const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const becknRoutes = require('./routes/becknRoutes');
const env = require('./config/env');

const app = express();
const PORT = env.PORT || 3004;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Buses BPP is running',
        service: 'BPP-BUSES',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Beckn Protocol Routes
app.use('/', becknRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: {
            type: "CORE-ERROR",
            code: "20000",
            message: "Internal server error"
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚌 Buses BPP is running on http://localhost:${PORT}`);
    console.log(`📋 Health check available at: http://localhost:${PORT}/health`);
});

module.exports = app;
