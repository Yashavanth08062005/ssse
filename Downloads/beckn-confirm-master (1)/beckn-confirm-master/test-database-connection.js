/**
 * Quick test script to verify PostgreSQL database connection
 * Run: node test-database-connection.js
 */

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'travel_discovery',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2005',
});

async function testConnection() {
    console.log('🔍 Testing PostgreSQL connection...\n');

    try {
        // Test connection
        const client = await pool.connect();
        console.log('✅ Successfully connected to PostgreSQL!\n');

        // Test flights table
        console.log('📊 Testing flights table...');
        const flightsResult = await client.query('SELECT COUNT(*) as count FROM flights');
        console.log(`   Total flights: ${flightsResult.rows[0].count}`);

        const domesticResult = await client.query("SELECT COUNT(*) as count FROM flights WHERE flight_type = 'DOMESTIC'");
        console.log(`   Domestic flights: ${domesticResult.rows[0].count}`);

        const intlResult = await client.query("SELECT COUNT(*) as count FROM flights WHERE flight_type = 'INTERNATIONAL'");
        console.log(`   International flights: ${intlResult.rows[0].count}\n`);

        // Test hotels table
        console.log('📊 Testing hotels table...');
        const hotelsResult = await client.query('SELECT COUNT(*) as count FROM hotels');
        console.log(`   Total hotels: ${hotelsResult.rows[0].count}`);

        const citiesResult = await client.query('SELECT city, COUNT(*) as count FROM hotels GROUP BY city ORDER BY city');
        console.log('   Hotels by city:');
        citiesResult.rows.forEach(row => {
            console.log(`     - ${row.city}: ${row.count}`);
        });

        console.log('\n✅ All tests passed! Database is ready.\n');

        // Sample data preview
        console.log('📋 Sample Flights:');
        const sampleFlights = await client.query('SELECT flight_code, airline_name, departure_city, arrival_city, price FROM flights LIMIT 3');
        sampleFlights.rows.forEach(flight => {
            console.log(`   ${flight.flight_code} - ${flight.airline_name}: ${flight.departure_city} → ${flight.arrival_city} (₹${flight.price})`);
        });

        console.log('\n📋 Sample Hotels:');
        const sampleHotels = await client.query('SELECT hotel_code, hotel_name, city, price_per_night FROM hotels LIMIT 3');
        sampleHotels.rows.forEach(hotel => {
            console.log(`   ${hotel.hotel_code} - ${hotel.hotel_name} in ${hotel.city} (₹${hotel.price_per_night}/night)`);
        });

        client.release();
        await pool.end();

        console.log('\n🎉 Database is properly configured and ready to use!');

    } catch (error) {
        console.error('❌ Error connecting to database:');
        console.error('   Message:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Ensure PostgreSQL is running');
        console.error('   2. Verify database "travel_discovery" exists');
        console.error('   3. Check username/password (postgres/123456)');
        console.error('   4. Run database-setup.sql script in pgAdmin');
        process.exit(1);
    }
}

testConnection();
