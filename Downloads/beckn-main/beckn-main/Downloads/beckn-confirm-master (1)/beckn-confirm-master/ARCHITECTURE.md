# 🏗️ System Architecture

## Overview

The Beckn Travel Discovery Platform follows a microservices architecture implementing the Beckn Protocol for decentralized travel commerce.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                      http://localhost:3000                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                       │
│  - Search UI                                                     │
│  - Booking Flow                                                  │
│  - Authentication                                                │
│  - Results Display                                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Beckn API Calls
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              BAP - Beckn Application Platform                    │
│                    (Port 8081)                                   │
│                                                                  │
│  Services:                                                       │
│  - Beckn Protocol Handler                                        │
│  - Request Aggregation                                           │
│  - User Authentication (JWT)                                     │
│  - Multi-BPP Communication                                       │
└─────┬──────────────┬──────────────┬──────────────┬─────────────┘
      │              │              │              │
      │              │              │              │
      ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
│ Flights  │  │   Intl   │  │  Hotels  │  │  PostgreSQL  │
│   BPP    │  │ Flights  │  │   BPP    │  │   Database   │
│  :7001   │  │   BPP    │  │  :7003   │  │    :5432     │
│          │  │  :7005   │  │          │  │              │
└──────────┘  └──────────┘  └──────────┘  └──────────────┘
     │              │              │              │
     └──────────────┴──────────────┴──────────────┘
                    │
                    ▼
            ┌──────────────┐
            │  PostgreSQL  │
            │   Database   │
            │    :5432     │
            └──────────────┘
```

## Components

### 1. Frontend (Port 3000)
**Technology**: React, Vite, Tailwind CSS, React Router

**Responsibilities**:
- User interface for search and booking
- Authentication UI (login/register)
- Search form with autocomplete
- Results display and filtering
- Booking flow management
- GPS coordinate conversion for airports

**Key Files**:
- `src/pages/Home.jsx` - Landing page
- `src/pages/SearchResults.jsx` - Search results display
- `src/pages/BookingDetails.jsx` - Booking form
- `src/components/SearchForm.jsx` - Search interface
- `src/services/api.js` - BAP communication

### 2. BAP - Beckn Application Platform (Port 8081)
**Technology**: Node.js, Express.js

**Responsibilities**:
- Beckn protocol implementation
- Multi-BPP request aggregation
- User authentication (JWT)
- Request routing based on category
- Response aggregation from multiple BPPs

**Key Files**:
- `src/services/becknService.js` - Beckn protocol logic
- `src/controllers/becknController.js` - API endpoints
- `src/controllers/authController.js` - Authentication
- `src/routes/becknRoutes.js` - Beckn endpoints
- `src/routes/authRoutes.js` - Auth endpoints

**Beckn Flow**:
```
search → on_search (aggregated from BPPs)
select → on_select
init → on_init
confirm → on_confirm
status → on_status
```

### 3. Domestic Flights BPP (Port 7001)
**Technology**: Node.js, Express.js, PostgreSQL

**Responsibilities**:
- Domestic flight inventory management
- GPS to airport code conversion
- Flight search with origin/destination filtering
- Beckn protocol response formatting

**Key Features**:
- Filters flights by departure and arrival airports
- Converts GPS coordinates to IATA codes
- Returns flights in Beckn catalog format

### 4. International Flights BPP (Port 7005)
**Technology**: Node.js, Express.js, PostgreSQL

**Responsibilities**:
- International flight inventory
- Support for international airport codes
- Currency handling (INR/USD/etc.)
- International route filtering

**Supported Airports**:
- Singapore (SIN)
- Dubai (DXB)
- London (LHR)
- New York (JFK)
- Bangkok (BKK)
- Hong Kong (HKG)
- Tokyo (NRT)
- Sydney (SYD)

### 5. Hotels BPP (Port 7003)
**Technology**: Node.js, Express.js, PostgreSQL

**Responsibilities**:
- Hotel inventory management
- City-based search
- Room availability
- Amenities and policies

### 6. PostgreSQL Database (Port 5432)
**Technology**: PostgreSQL 14+

**Schema**:
```sql
flights
  - id, flight_code, airline_name
  - departure_airport, arrival_airport
  - departure_city, arrival_city
  - price, currency, flight_type
  - status, aircraft_model

hotels
  - id, hotel_name, city_code
  - address, rating, amenities
  - price_per_night, status

users
  - id, email, password_hash
  - full_name, phone, created_at

bookings
  - id, user_id, booking_type
  - item_id, status, total_price
  - passenger_details, created_at
```

## Data Flow

### Search Flow
```
1. User enters search (e.g., BLR → BOM)
   ↓
2. Frontend converts to GPS coordinates
   ↓
3. BAP receives search request
   ↓
4. BAP determines category (MOBILITY/HOSPITALITY)
   ↓
5. BAP queries relevant BPPs in parallel:
   - Domestic Flights BPP
   - International Flights BPP
   ↓
6. Each BPP:
   - Converts GPS → Airport codes
   - Queries database with filters
   - Returns matching items
   ↓
7. BAP aggregates all responses
   ↓
8. Frontend displays combined results
```

### Booking Flow
```
1. User clicks "Book Now"
   ↓
2. Check authentication (redirect to login if needed)
   ↓
3. Display booking form with flight details
   ↓
4. User fills passenger information
   ↓
5. Frontend sends Beckn select request to BAP
   ↓
6. BAP forwards to appropriate BPP
   ↓
7. BPP processes booking
   ↓
8. Confirmation returned to user
```

## Beckn Protocol Implementation

### Context Object
```javascript
{
  domain: "mobility" | "hospitality",
  action: "search" | "select" | "init" | "confirm" | "status",
  transaction_id: "unique-txn-id",
  message_id: "unique-msg-id",
  bap_id: "travel-discovery-bap.example.com",
  bap_uri: "http://localhost:8081",
  timestamp: "ISO-8601"
}
```

### Message Object (Search)
```javascript
{
  intent: {
    category: { id: "MOBILITY" },
    fulfillment: {
      start: { location: { gps: "12.9716,77.5946" } },
      end: { location: { gps: "19.0896,72.8656" } },
      time: { range: { start: "...", end: "..." } }
    }
  }
}
```

### Catalog Response
```javascript
{
  message: {
    catalog: {
      providers: [{
        id: "provider-001",
        descriptor: { name: "Airline Name" },
        items: [{
          id: "flight-123",
          descriptor: { name: "Flight", code: "AI-1234" },
          price: { currency: "INR", value: "5500" },
          tags: [
            { code: "ROUTE", list: [...] },
            { code: "AMENITIES", list: [...] }
          ]
        }]
      }]
    }
  }
}
```

## Security

### Authentication
- JWT tokens for user sessions
- bcrypt password hashing
- Protected routes for booking
- Token expiration (24 hours)

### Database
- Parameterized queries (SQL injection prevention)
- Password hashing before storage
- Connection pooling

### API
- CORS enabled for frontend
- Request validation
- Error handling middleware

## Scalability Considerations

### Current Architecture
- Single database instance
- Synchronous BPP calls
- In-memory session storage

### Future Improvements
- Redis for caching and sessions
- Message queue for async BPP communication
- Database replication
- Load balancing for BPPs
- Microservices containerization (Docker)
- Kubernetes orchestration

## Performance

### Optimizations
- Database indexes on frequently queried fields
- Connection pooling
- Parallel BPP queries
- Frontend code splitting
- Lazy loading of components

### Monitoring
- Service health checks
- Request/response logging
- Error tracking
- Performance metrics

## Development vs Production

### Development
- All services on localhost
- Separate terminal windows
- Hot reload enabled
- Detailed logging

### Production (Recommended)
- Docker containers
- Environment-based configuration
- Reverse proxy (Nginx)
- SSL/TLS certificates
- Database backups
- Monitoring and alerting

## Technology Choices

### Why Node.js?
- JavaScript across frontend and backend
- Large ecosystem (npm)
- Good for I/O-bound operations
- Easy async handling

### Why PostgreSQL?
- ACID compliance
- Complex queries support
- JSON support for flexible data
- Mature and reliable

### Why React?
- Component-based architecture
- Large community
- Rich ecosystem
- Virtual DOM performance

### Why Beckn Protocol?
- Decentralized commerce
- Standardized API
- Multi-provider support
- Open protocol

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│           Load Balancer (Nginx)         │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────┐      ┌─────────┐
│  BAP 1  │      │  BAP 2  │
└────┬────┘      └────┬────┘
     │                │
     └────────┬───────┘
              ▼
    ┌──────────────────┐
    │   BPP Cluster    │
    │  (Multiple BPPs) │
    └────────┬─────────┘
             ▼
    ┌──────────────────┐
    │  PostgreSQL HA   │
    │  (Primary/Replica)│
    └──────────────────┘
```

## Conclusion

This architecture provides a solid foundation for a Beckn-based travel platform with:
- Clear separation of concerns
- Scalability potential
- Beckn protocol compliance
- Modern tech stack
- Security best practices
