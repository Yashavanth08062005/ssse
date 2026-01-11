# 🚀 Beckn Travel Discovery - Setup Without Docker

## Quick Setup Guide

### Prerequisites
1. **PostgreSQL** - Download from https://www.postgresql.org/download/windows/
   - During installation, remember the password for 'postgres' user
   - Default port: 5432
2. **Node.js** - Already installed ✅

### Step 1: Database Setup
1. Make sure PostgreSQL is running
2. Run: `setup-database.bat`
3. Enter your PostgreSQL password when prompted

### Step 2: Install Dependencies
1. Run: `install-dependencies.bat` (Already completed ✅)

### Step 3: Start All Services
1. Run: `start-all-services.bat`
2. This will open 5 terminal windows for each service
3. Wait for all services to start (about 30 seconds)

### Step 4: Access the Application
- **Frontend**: http://localhost:3000
- **BAP API Health**: http://localhost:8081/health

### Service Ports
- Frontend: 3000
- BAP Service: 8081
- Flights BPP: 7001
- International Flights BPP: 7005
- Hotels BPP: 7003
- PostgreSQL: 5432

### Stop Services
Run: `stop-all-services.bat`

### Test the Application
1. Go to http://localhost:3000
2. Search for flights: BLR → BOM (Bangalore to Mumbai)
3. Search for hotels in Mumbai
4. Register/Login to test booking flow

### Available Flight Routes
- BLR → BOM (3 flights)
- DEL → BLR (1 flight)  
- HYD → BOM (1 flight)
- International: SIN ↔ DEL

### Available Hotel Cities
- Mumbai, Delhi, Bangalore, Hyderabad

### Troubleshooting
1. **Database connection error**: Check PostgreSQL is running and password is correct
2. **Port already in use**: Run `stop-all-services.bat` first
3. **No search results**: Verify database setup completed successfully

### Manual Service Start (Alternative)
If batch files don't work, start each service manually in separate terminals:

```bash
# Terminal 1 - BAP Service
cd bap-travel-discovery
npm start

# Terminal 2 - Flights BPP  
cd travel-discovery-bpp-flights
npm start

# Terminal 3 - International Flights BPP
cd travel-discovery-bpp-international-flights
npm start

# Terminal 4 - Hotels BPP
cd travel-discovery-bpp-hotels
npm start

# Terminal 5 - Frontend
cd frontend-travel-discovery
npm run dev
```

## Environment Configuration
All services are configured to use:
- Database: localhost:5432/travel_discovery
- Username: postgres
- Password: postgres (update in .env files if different)

The project is now ready to run without Docker! 🎉