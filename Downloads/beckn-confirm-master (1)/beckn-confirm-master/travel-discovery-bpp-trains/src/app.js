const express = require('express');
const cors = require('cors');
const becknRoutes = require('./routes/becknRoutes');
const env = require('./config/env');

const app = express();
const PORT = env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', becknRoutes); // All Beckn requests go here

// Health check
app.get('/health', (req, res) => {
    res.json({
        service: 'Trains BPP',
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚂 Trains BPP Service running on port ${PORT}`);
});

module.exports = app;
