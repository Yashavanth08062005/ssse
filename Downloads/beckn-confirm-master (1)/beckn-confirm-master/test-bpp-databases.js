/**
 * Test script to verify all BPP databases are working correctly
 * Run: node test-bpp-databases.js
 */

const { Pool } = require('pg');

// Database configurations for each BPP
const databases = {
    'BAP Service': {
        host: 'localhost',
        port: 5432,
        database: 'travel_discovery',
        user: 'postgres',
        password: '123',
    },
    'Flights BPP': {
        host: 'localhost',
        port: 5432,
        database: 'flights_bpp',
        user: 'postgres',
        password: '123',
    },
    'International Flights BPP': {
        host: 'localhost',
        port: 5432,
        database: 'international_flights_bpp',
        user: 'postgres',
        password: '123',
    },
    'Hotels BPP': {
        host: 'localhost',
        port: 5432,
        database: 'hotels_bpp',
        user: 'postgres',
        password: '123',
    }
};

async function testDatabase(serviceName, config) {
    console.log(`\n🔍 Testing ${serviceName}...`);
    
    const pool = new Pool(config);
    
    try {
        // Test connection
        const client = await pool.connect();
        console.log(`✅ Connected to ${config.database}`);
        
        // Test data based on service type
        if (serviceName.includes('Flights')) {
            const result = await client.query('SELECT COUNT(*) as count FROM flights');
            const typeResult = await client.query('SELECT flight_type, COUNT(*) as count FROM flights GROUP BY flight_type');
            
            console.log(`   Total flights: ${result.rows[0].count}`);
            typeResult.rows.forEach(row => {
                console.log(`   ${row.flight_type} flights: ${row.count}`);
            });
            
            // Test BPP bookings table
            const bookingsResult = await client.query('SELECT COUNT(*) as count FROM bpp_bookings');
            console.log(`   BPP bookings: ${bookingsResult.rows[0].count}`);
            
        } else if (serviceName.includes('Hotels')) {
            const result = await client.query('SELECT COUNT(*) as count FROM hotels');
            const cityResult = await client.query('SELECT city, COUNT(*) as count FROM hotels GROUP BY city ORDER BY city');
            
            console.log(`   Total hotels: ${result.rows[0].count}`);
            console.log('   Hotels by city:');
            cityResult.rows.forEach(row => {
                console.log(`     - ${row.city}: ${row.count}`);
            });
            
            // Test BPP bookings table
            const bookingsResult = await client.query('SELECT COUNT(*) as count FROM bpp_bookings');
            console.log(`   BPP bookings: ${bookingsResult.rows[0].count}`);
            
        } else if (serviceName.includes('BAP')) {
            // Test BAP-specific tables
            const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
            const bookingsResult = await client.query('SELECT COUNT(*) as count FROM bookings');
            
            console.log(`   Total users: ${usersResult.rows[0].count}`);
            console.log(`   Total bookings: ${bookingsResult.rows[0].count}`);
        }
        
        client.release();
        await pool.end();
        
        console.log(`✅ ${serviceName} database test passed!`);
        
    } catch (error) {
        console.error(`❌ Error testing ${serviceName}:`);
        console.error(`   Database: ${config.database}`);
        console.error(`   Error: ${error.message}`);
        
        if (error.code === '3D000') {
            console.error(`   💡 Database '${config.database}' does not exist. Run setup-separate-databases.bat first.`);
        } else if (error.code === '28P01') {
            console.error(`   💡 Authentication failed. Check username/password.`);
        }
        
        await pool.end();
        return false;
    }
    
    return true;
}

async function testAllDatabases() {
    console.log('🚀 Testing all BPP databases...\n');
    console.log('Expected databases:');
    Object.entries(databases).forEach(([name, config]) => {
        console.log(`   - ${name}: ${config.database}`);
    });
    
    let allPassed = true;
    
    for (const [serviceName, config] of Object.entries(databases)) {
        const passed = await testDatabase(serviceName, config);
        if (!passed) {
            allPassed = false;
        }
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (allPassed) {
        console.log('🎉 All database tests passed!');
        console.log('\n✅ Each BPP now has its own separate database:');
        console.log('   - BAP Service → travel_discovery');
        console.log('   - Flights BPP → flights_bpp');
        console.log('   - International Flights BPP → international_flights_bpp');
        console.log('   - Hotels BPP → hotels_bpp');
        console.log('\n🔄 You can now restart the services to use separate databases.');
    } else {
        console.log('❌ Some database tests failed.');
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Run setup-separate-databases.bat to create databases');
        console.log('   2. Ensure PostgreSQL is running');
        console.log('   3. Check username/password (postgres/123)');
    }
}

testAllDatabases();