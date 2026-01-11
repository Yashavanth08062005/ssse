# Database Setup Guide

## Prerequisites
- PostgreSQL installed (pgAdmin 4 recommended)
- PostgreSQL server running on localhost:5432
- Default postgres user with password: `123`

## Setup Steps

### 1. Create Database
Open pgAdmin and connect to your PostgreSQL server, then:

1. Right-click on "Databases" → "Create" → "Database"
2. Database name: `travel_discovery`
3. Click "Save"

### 2. Run SQL Script
1. Select the `travel_discovery` database
2. Click on "Query Tool" (or press Alt+Shift+Q)
3. Open the file `database-setup.sql` from this project
4. Copy all contents and paste into the Query Tool
5. Click "Execute" (or press F5)

### 3. Verify Data
Run these queries to verify the setup:

```sql
-- Check flights
SELECT COUNT(*) as total_flights FROM flights;
SELECT flight_type, COUNT(*) as count FROM flights GROUP BY flight_type;

-- Check hotels
SELECT COUNT(*) as total_hotels FROM hotels;
SELECT city, COUNT(*) as count FROM hotels GROUP BY city;

-- View sample data
SELECT * FROM flights LIMIT 5;
SELECT * FROM hotels LIMIT 5;
```

## Database Schema

### Flights Table
- Stores both domestic and international flights
- Fields: flight_code, airline_name, departure/arrival airports, price, amenities, etc.
- Sample data: 5 domestic flights + 4 international flights

### Hotels Table
- Stores hotel information across multiple cities
- Fields: hotel_code, hotel_name, city, price_per_night, amenities (JSON), etc.
- Sample data: 8 hotels across Mumbai, Bangalore, Delhi, Hyderabad

## Connection Configuration

All BPP services connect to PostgreSQL with these settings:
```javascript
{
    host: 'localhost',
    port: 5432,
    database: 'travel_discovery',
    user: 'postgres',
    password: '123'
}
```

To change the password, update the `password` field in:
- `travel-discovery-bpp-flights/src/config/database.js`
- `travel-discovery-bpp-hotels/src/config/database.js`
- `travel-discovery-bpp-international-flights/src/config/database.js`

## Adding More Data

### Add a Flight
```sql
INSERT INTO flights (flight_code, airline_name, aircraft_model, departure_airport, 
    arrival_airport, departure_city, arrival_city, departure_time, arrival_time, 
    duration_minutes, price, flight_type, short_desc, long_desc, meals_included, 
    baggage_kg, wifi_available)
VALUES
    ('AI-9999', 'Air India', 'Boeing 737', 'DEL', 'GOI', 'Delhi', 'Goa',
     '09:00:00', '11:30:00', 150, 6500.00, 'DOMESTIC',
     'Delhi to Goa', 'Comfortable flight to beach paradise',
     true, 20, true);
```

### Add a Hotel
```sql
INSERT INTO hotels (hotel_code, hotel_name, city, location, star_rating, 
    price_per_night, room_type, short_desc, long_desc, amenities)
VALUES
    ('SAMPLE-001', 'Sample Hotel', 'Goa', 'Calangute Beach', 4.0,
     8500.00, 'Sea View Room',
     'Beach resort', 'Beautiful beach resort with ocean views',
     '{"wifi": true, "pool": true, "beach_access": true, "restaurant": true}');
```

## Troubleshooting

### Connection Error
If you see "connection refused" errors:
1. Ensure PostgreSQL is running
2. Check if the port 5432 is correct
3. Verify username and password
4. Check if the database `travel_discovery` exists

### No Data Returned
If searches return empty results:
1. Verify data was inserted: `SELECT COUNT(*) FROM flights;`
2. Check if status is 'ACTIVE': `SELECT * FROM flights WHERE status = 'ACTIVE';`
3. Review the service logs for SQL errors

### Permission Denied
If you get permission errors:
1. Ensure the postgres user has proper permissions
2. Grant permissions: `GRANT ALL PRIVILEGES ON DATABASE travel_discovery TO postgres;`
