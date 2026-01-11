const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const becknRoutes = require('./routes/becknRoutes');
const env = require('./config/env');

const app = express();
const PORT = env.PORT || 7005;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'International Flights BPP is running',
    service: 'BPP-FLIGHTS-INTERNATIONAL',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use('/', becknRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: {
      type: 'CORE-ERROR',
      code: '20000',
      message: 'Internal server error'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🛫 International Flights BPP running on http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
});

module.exports = app;
