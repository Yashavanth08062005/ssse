# 🚀 Manual Setup Guide - Beckn Travel Discovery

## Step 1: Database Setup in pgAdmin

1. **Open pgAdmin 4**
2. **Connect to PostgreSQL server** (localhost:5432, password: 123456)
3. **Create Database:**
   - Right-click "Databases" → "Create" → "Database"
   - Name: `travel_discovery`
   - Click "Save"

4. **Run SQL Scripts:**
   - Select `travel_discovery` database
   - Open "Query Tool" (Alt+Shift+Q)
   - Copy and run each script in order:

### Script 1: Main Tables and Data
```sql
-- Copy contents from: database-setup.sql
-- This creates flights and hotels tables with sample data
```

### Script 2: Authentication Tables  
```sql
-- Copy contents from: database-auth-setup.sql
-- This creates users and bookings tables
```

### Script 3: Additional Flights (Optional)
```sql
-- Copy contents from: add-del-bom-flights.sql
-- Copy contents from: add-international-flights.sql
```

## Step 2: Start Services Manually

Open **5 separate Command Prompt windows** and run:

### Window 1 - BAP Service (Port 8081)
```cmd
cd beckn-project--main\bap-travel-discovery
npm start
```

### Window 2 - Flights BPP (Port 7001)  
```cmd
cd beckn-project--main\travel-discovery-bpp-flights
npm start
```

### Window 3 - International Flights BPP (Port 7005)
```cmd
cd beckn-project--main\travel-discovery-bpp-international-flights
npm start
```

### Window 4 - Hotels BPP (Port 7003)
```cmd
cd beckn-project--main\travel-discovery-bpp-hotels
npm start
```

### Window 5 - Frontend (Port 3000)
```cmd
cd beckn-project--main\frontend-travel-discovery
npm run dev
```

## Step 3: Verify Services

Wait for all services to start (about 30 seconds), then check:

- **Frontend**: http://localhost:3000
- **BAP Health**: http://localhost:8081/health
- **Flights BPP**: http://localhost:7001/health
- **Hotels BPP**: http://localhost:7003/health
- **Intl Flights BPP**: http://localhost:7005/health

## Step 4: Test the Application

1. Go to http://localhost:3000
2. Search flights: BLR → BOM (Bangalore to Mumbai)
3. Search hotels in Mumbai
4. Register/Login to test booking

## Troubleshooting

**ERR_CONNECTION_REFUSED:**
- Make sure all 5 services are running
- Check each service terminal for errors
- Verify ports 3000, 7001, 7003, 7005, 8081 are not in use

**Database Connection Error:**
- Verify PostgreSQL is running
- Check database name: travel_discovery
- Verify password: 123456

**No Search Results:**
- Check database has data: `SELECT COUNT(*) FROM flights;`
- Verify services can connect to database