/**
 * Mock ONIX Adapter Service
 * This is a development mock that simulates ONIX adapter responses
 * Use this for testing when ONIX is not available
 * 
 * For production, connect to real ONIX adapter at http://localhost:8081
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.MOCK_ONIX_PORT || 9090;

// Middleware - Order matters!
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  if (req.method !== 'GET') {
    console.log(`   Body:`, JSON.stringify(req.body).substring(0, 100) + '...');
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Mock ONIX Adapter',
    version: '1.0.0 (MOCK)',
    timestamp: new Date().toISOString(),
    note: 'This is a mock adapter for development. For production, use real ONIX at http://localhost:8081'
  });
});

// Mock search endpoint
app.post('/search', (req, res) => {
  try {
    console.log(`✅ Search endpoint called`);
    const { context, message } = req.body;

    if (!context || !message) {
      console.log(`⚠️  Missing context or message in search request`);
      return res.status(400).json({
        error: {
          type: 'CORE-ERROR',
          code: '20001',
          message: 'Invalid request format'
        }
      });
    }

    // Generate mock response with sample data
    const mockResponse = {
      context: {
        ...context,
        action: 'on_search'
      },
      message: {
        catalog: {
          descriptor: {
            name: 'Travel Providers',
            short_desc: 'Available travel providers'
          },
          providers: generateMockProviders()
        }
      }
    };

    console.log(`✅ Returning mock search response with ${mockResponse.message.catalog.providers.length} providers`);
    res.json(mockResponse);
  } catch (error) {
    console.error('❌ Error processing search:', error);
    res.status(500).json({
      error: {
        type: 'CORE-ERROR',
        code: '20000',
        message: error.message || 'Internal server error'
      }
    });
  }
});

// Mock select endpoint
app.post('/select', (req, res) => {
  const { context, message } = req.body;
  res.json({
    context: { ...context, action: 'on_select' },
    message: { order: message.order }
  });
});

// Mock init endpoint
app.post('/init', (req, res) => {
  const { context, message } = req.body;
  res.json({
    context: { ...context, action: 'on_init' },
    message: { order: message.order }
  });
});

// Mock confirm endpoint
app.post('/confirm', (req, res) => {
  const { context, message } = req.body;
  res.json({
    context: { ...context, action: 'on_confirm' },
    message: { order_id: message.order.id }
  });
});

// Mock status endpoint
app.post('/status', (req, res) => {
  const { context, message } = req.body;
  res.json({
    context: { ...context, action: 'on_status' },
    message: {
      order: {
        id: message.order_id,
        status: 'CONFIRMED'
      }
    }
  });
});

// Generate mock flight providers
function generateMockProviders() {
  return [
    {
      id: 'provider_1',
      descriptor: {
        name: 'Air India',
        code: 'AI',
        short_desc: 'National Carrier'
      },
      items: [
        {
          id: 'flight_1',
          descriptor: {
            name: 'AI-101',
            code: 'AI101',
            short_desc: 'Delhi to Mumbai',
            long_desc: 'Flight from Delhi to Mumbai with meals included'
          },
          price: {
            currency: 'INR',
            value: '8500'
          },
          time: {
            timestamp: new Date(Date.now() + 3600000).toISOString()
          },
          tags: [
            {
              code: 'AIRCRAFT_TYPE',
              list: [
                { code: 'MODEL', value: 'Boeing 777' }
              ]
            },
            {
              code: 'AMENITIES',
              list: [
                { code: 'MEALS', value: 'Complimentary meals' },
                { code: 'BAGGAGE', value: '20kg' },
                { code: 'WIFI', value: 'Available' }
              ]
            }
          ]
        },
        {
          id: 'flight_2',
          descriptor: {
            name: 'AI-102',
            code: 'AI102',
            short_desc: 'Delhi to Mumbai (Evening)',
            long_desc: 'Evening flight from Delhi to Mumbai'
          },
          price: {
            currency: 'INR',
            value: '7500'
          },
          time: {
            timestamp: new Date(Date.now() + 14400000).toISOString()
          },
          tags: [
            {
              code: 'AIRCRAFT_TYPE',
              list: [
                { code: 'MODEL', value: 'Airbus A320' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'provider_2',
      descriptor: {
        name: 'IndiGo',
        code: '6E',
        short_desc: 'Low Cost Carrier'
      },
      items: [
        {
          id: 'flight_3',
          descriptor: {
            name: '6E-201',
            code: '6E201',
            short_desc: 'Delhi to Mumbai',
            long_desc: 'Budget flight from Delhi to Mumbai'
          },
          price: {
            currency: 'INR',
            value: '5500'
          },
          time: {
            timestamp: new Date(Date.now() + 5400000).toISOString()
          },
          tags: [
            {
              code: 'AIRCRAFT_TYPE',
              list: [
                { code: 'MODEL', value: 'Airbus A320neo' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'provider_3',
      descriptor: {
        name: 'Emirates',
        code: 'EK',
        short_desc: 'International Carrier'
      },
      items: [
        {
          id: 'flight_4_intl',
          descriptor: {
            name: 'EK-501',
            code: 'EK501',
            short_desc: 'Mumbai to Dubai',
            long_desc: 'International flight from Mumbai to Dubai'
          },
          price: {
            currency: 'INR',
            value: '15000'
          },
          time: {
            timestamp: new Date(Date.now() + 7200000).toISOString()
          },
          tags: [
            {
              code: 'AIRCRAFT_TYPE',
              list: [
                { code: 'MODEL', value: 'Boeing 777' }
              ]
            },
            {
              code: 'AMENITIES',
              list: [
                { code: 'MEALS', value: 'Premium meals' },
                { code: 'BAGGAGE', value: '30kg' },
                { code: 'WIFI', value: 'Available' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'provider_4',
      descriptor: {
        name: 'Air England',
        code: 'BA',
        short_desc: 'International Carrier'
      },
      items: [
        {
          id: 'flight_5_intl',
          descriptor: {
            name: 'BA-201',
            code: 'BA201',
            short_desc: 'Mumbai to London',
            long_desc: 'International flight from Mumbai to London'
          },
          price: {
            currency: 'INR',
            value: '45000'
          },
          time: {
            timestamp: new Date(Date.now() + 10800000).toISOString()
          },
          tags: [
            {
              code: 'AIRCRAFT_TYPE',
              list: [
                { code: 'MODEL', value: 'Boeing 787' }
              ]
            },
            {
              code: 'AMENITIES',
              list: [
                { code: 'MEALS', value: 'Premium meals' },
                { code: 'BAGGAGE', value: '40kg' },
                { code: 'WIFI', value: 'Available' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'provider_5',
      descriptor: {
        name: 'Taj Hotels',
        code: 'TAJ',
        short_desc: 'Luxury Hotel Chain'
      },
      items: [
        {
          id: 'hotel_1',
          descriptor: {
            name: 'Taj Gateway Mumbai',
            code: 'TAJGW001',
            short_desc: 'Luxury 5-star hotel',
            long_desc: 'Experience luxury at Taj Gateway Mumbai with world-class amenities'
          },
          price: {
            currency: 'INR',
            value: '18000'
          },
          tags: [
            {
              code: 'ROOM_TYPE',
              list: [
                { code: 'TYPE', value: 'Deluxe Room' },
                { code: 'BED', value: 'King Size' },
                { code: 'SIZE', value: '45 sqm' }
              ]
            },
            {
              code: 'AMENITIES',
              list: [
                { code: 'WIFI', value: 'Free' },
                { code: 'AC', value: 'Central' },
                { code: 'GYM', value: 'Available' }
              ]
            },
            {
              code: 'POLICIES',
              list: [
                { code: 'CANCELLATION', value: 'Free till 48 hours before check-in' },
                { code: 'BREAKFAST', value: 'Included' }
              ]
            }
          ]
        }
      ]
    }
  ];
}

// Catch-all route for undefined endpoints
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.path} - Route not found`);
  res.status(404).json({
    error: {
      type: 'CORE-ERROR',
      code: '40001',
      message: `Route ${req.method} ${req.path} not found`,
      availableEndpoints: {
        GET: ['/health'],
        POST: ['/search', '/select', '/init', '/confirm', '/status']
      }
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`❌ Error:`, err.message);
  res.status(500).json({
    error: {
      type: 'CORE-ERROR',
      code: '50000',
      message: err.message || 'Internal server error'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Mock ONIX Adapter running on http://localhost:${PORT}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   POST http://localhost:${PORT}/search`);
  console.log(`   POST http://localhost:${PORT}/select`);
  console.log(`   POST http://localhost:${PORT}/init`);
  console.log(`   POST http://localhost:${PORT}/confirm`);
  console.log(`   POST http://localhost:${PORT}/status`);
  console.log(`\n⚠️  This is a MOCK adapter for development/testing`);
  console.log(`   For production, use real ONIX at http://localhost:8081\n`);
  console.log(`✓ Ready to handle search requests\n`);
});

module.exports = app;
