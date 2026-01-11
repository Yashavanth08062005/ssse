# 🚀 Beckn Travel Discovery - Quick Start Guide

## Prerequisites
- Node.js (v16+)
- PostgreSQL (v14+)
- npm or yarn

## 📦 Step 1: Database Setup

### Start PostgreSQL
```bash
# Make sure PostgreSQL is running
# Default: localhost:5432
```

### Create Database and Tables
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE travel_discovery;

# Exit psql
\q

# Run database setup scripts
psql -U postgres -d travel_discovery -f database-setup.sql
psql -U postgres -d travel_discovery -f database-auth-setup.sql

# Optional: Add Delhi-Mumbai flights
psql -U postgres -d travel_discovery -f add-del-bom-flights.sql

# Optional: Add Singapore-Delhi international flights
psql -U postgres -d travel_discovery -f add-international-flights.sql
```

## 📦 Step 2: Install Dependencies

### Install all services
```bash
# BAP Service
cd bap-travel-discovery
npm install
cd ..

# Domestic Flights BPP
cd travel-discovery-bpp-flights
npm install
cd ..

# International Flights BPP
cd travel-discovery-bpp-international-flights
npm install
cd ..

# Hotels BPP
cd travel-discovery-bpp-hotels
npm install
cd ..

# Frontend
cd frontend-travel-discovery
npm install
cd ..
```

## 🚀 Step 3: Start Services

### Terminal 1 - BAP Service (Port 8081)
```bash
cd bap-travel-discovery
npm start
```

### Terminal 2 - Domestic Flights BPP (Port 7001)
```bash
cd travel-discovery-bpp-flights
npm start
```

### Terminal 3 - International Flights BPP (Port 7005)
```bash
cd travel-discovery-bpp-international-flights
npm start
```

### Terminal 4 - Hotels BPP (Port 7003)
```bash
cd travel-discovery-bpp-hotels
npm start
```

### Terminal 5 - Frontend (Port 3000)
```bash
cd frontend-travel-discovery
npm run dev
```

## ✅ Step 4: Verify Services

Open your browser and check:
- **Frontend**: http://localhost:3000
- **BAP Health**: http://localhost:8081/health
- **Flights BPP Health**: http://localhost:7001/health
- **Intl Flights BPP Health**: http://localhost:7005/health
- **Hotels BPP Health**: http://localhost:7003/health

## 🧪 Step 5: Test the System

### Test Flight Search
1. Go to http://localhost:3000
2. Select "Flight" mode
3. Origin: "BLR" (Bangalore)
4. Destination: "BOM" (Mumbai)
5. Select date and passengers
6. Click "Search"
7. You should see 3 flights

### Test International Flight Search
1. Origin: "SIN" (Singapore)
2. Destination: "DEL" (Delhi)
3. You should see 4 international flights

### Test Hotel Search
1. Select "Hotel" mode
2. City: "Mumbai"
3. Check-in and Check-out dates
4. Rooms and guests
5. Click "Search"

### Test Booking Flow
1. Search for flights
2. Click "Book Now" on any flight
3. Register/Login if not authenticated
4. Fill passenger details
5. Click "Confirm Booking"

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -l

# Check database exists
psql -U postgres -c "\l" | grep travel_discovery

# Verify tables
psql -U postgres -d travel_discovery -c "\dt"
```

### Port Already in Use
```bash
# Windows - Kill process on port
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Or change port in .env files
```

### No Search Results
```bash
# Verify flights in database
psql -U postgres -d travel_discovery -c "SELECT COUNT(*) FROM flights WHERE status='ACTIVE';"

# Check BPP logs for errors
# Look at terminal output for BPP services
```

## 📝 Environment Variables

### BAP Service (.env)
```env
PORT=8081
DB_HOST=localhost
DB_PORT=5432
DB_NAME=travel_discovery
DB_USER=postgres
DB_PASSWORD=admin123
FLIGHTS_BPP_URL=http://localhost:7001
FLIGHTS_INTL_BPP_URL=http://localhost:7005
HOTELS_BPP_URL=http://localhost:7003
```

### Frontend (.env)
```env
VITE_BAP_URL=http://localhost:8081
```

## 🛑 Stop All Services

### Windows
```bash
# Stop all node processes
taskkill /F /IM node.exe
```

### Linux/Mac
```bash
# Stop all node processes
pkill -f node
```

## 📚 Available Routes

### Domestic Flights (in database)
- BLR → BOM (Bangalore to Mumbai) - 3 flights
- DEL → BLR (Delhi to Bangalore) - 1 flight
- HYD → BOM (Hyderabad to Mumbai) - 1 flight
- DEL → BOM (Delhi to Mumbai) - 4 flights (if added)

### International Flights (if added)
- SIN → DEL (Singapore to Delhi) - 4 flights
- DEL → SIN (Delhi to Singapore) - 3 flights

## 🎯 Next Steps

1. Add more flight routes to database
2. Customize frontend styling
3. Add payment integration
4. Implement booking confirmation emails
5. Add more BPP providers

## 📖 Documentation

- **README.md** - Project overview
- **ARCHITECTURE.md** - System architecture
- **DATABASE_SETUP_README.md** - Database schema details
- **QUICK_START.md** - This file

## 🆘 Need Help?

Check the logs in each terminal for error messages. Most issues are related to:
1. Database not running
2. Wrong database credentials
3. Ports already in use
4. Missing npm dependencies

Happy coding! 🎉
