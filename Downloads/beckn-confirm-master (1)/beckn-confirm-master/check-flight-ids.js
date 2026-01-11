const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'flights_bpp',
    user: 'postgres',
    password: '123'
});

async function checkFlightIds() {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT id, flight_code, airline_name, departure_city, arrival_city FROM flights LIMIT 5');
        console.log('Available flights in flights_bpp:');
        result.rows.forEach(flight => {
            console.log(`   ID: ${flight.id} - ${flight.flight_code} (${flight.airline_name}) ${flight.departure_city} → ${flight.arrival_city}`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkFlightIds().catch(console.error);