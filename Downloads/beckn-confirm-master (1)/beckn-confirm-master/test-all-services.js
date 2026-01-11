/**
 * Test script to verify all services are running with correct database connections
 * Run: node test-all-services.js
 */

const axios = require('axios');
const { Pool } = require('pg');

// Service endpoints
const services = {
    'BAP Service': 'http://localhost:8081/health',
    'Flights BPP': 'http://localhost:7001/health',
    'International Flights BPP': 'http://localhost:7005/health',
    'Hotels BPP': 'http://localhost:7003/health',
    'Frontend': 'http://localhost:3000'
};

// Database configurations
const databases = {
    'BAP Service': 'travel_discovery',
    'Flights BPP': 'flights_bpp',
    'International Flights BPP': 'international_flights_bpp',
    'Hotels BPP': 'hotels_bpp'
};

async function testServiceEndpoint(serviceName, url) {
    try {
        const response = await axios.get(url, { timeout: 5000 });
        console.log(`✅ ${serviceName}: ${response.status} - ${response.data.status || 'OK'}`);
        return true;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log(`❌ ${serviceName}: Service not running (${url})`);
        } else if (error.code === 'ETIMEDOUT') {
            console.log(`⏱️ ${serviceName}: Timeout (service may be starting)`);
        } else {
            console.log(`❌ ${serviceName}: ${error.message}`);
        }
        return false;
    }
}

async function testDatabaseConnection(serviceName, dbName) {
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: dbName,
        user: 'postgres',
        password: '123',
    });
    
    try {
        const client = await pool.connect();
        
        if (serviceName.includes('Flights')) {
            const result = await client.query('SELECT COUNT(*) as count FROM flights');
            console.log(`   Database: ${dbName} (${result.rows[0].count} flights)`);
        } else if (serviceName.includes('Hotels')) {
            const result = await client.query('SELECT COUNT(*) as count FROM hotels');
            console.log(`   Database: ${dbName} (${result.rows[0].count} hotels)`);
        } else if (serviceName.includes('BAP')) {
            const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
            const bookingsResult = await client.query('SELECT COUNT(*) as count FROM bookings');
            console.log(`   Database: ${dbName} (${usersResult.rows[0].count} users, ${bookingsResult.rows[0].count} bookings)`);
        }
        
        client.release();
        await pool.end();
        return true;
        
    } catch (error) {
        console.log(`   ❌ Database error: ${error.message}`);
        await pool.end();
        return false;
    }
}

async function main() {
    console.log('🚀 Testing Beckn Travel Discovery Platform...\n');
    
    // Test service endpoints
    console.log('📡 Testing Service Endpoints:');
    let servicesRunning = 0;
    for (const [serviceName, url] of Object.entries(services)) {
        const isRunning = await testServiceEndpoint(serviceName, url);
        if (isRunning) servicesRunning++;
    }
    
    console.log('\n🗄️ Testing Database Connections:');
    let databasesWorking = 0;
    for (const [serviceName, dbName] of Object.entries(databases)) {
        console.log(`🔍 ${serviceName}:`);
        const isWorking = await testDatabaseConnection(serviceName, dbName);
        if (isWorking) databasesWorking++;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SYSTEM STATUS SUMMARY:');
    console.log(`   Services Running: ${servicesRunning}/${Object.keys(services).length}`);
    console.log(`   Databases Working: ${databasesWorking}/${Object.keys(databases).length}`);
    
    if (servicesRunning === Object.keys(services).length && databasesWorking === Object.keys(databases).length) {
        console.log('\n🎉 ALL SYSTEMS OPERATIONAL!');
        console.log('\n✅ Separate Database Architecture:');
        console.log('   - BAP Service → travel_discovery');
        console.log('   - Flights BPP → flights_bpp');
        console.log('   - International Flights BPP → international_flights_bpp');
        console.log('   - Hotels BPP → hotels_bpp');
        console.log('\n🌐 Access Points:');
        console.log('   - Frontend: http://localhost:3000');
        console.log('   - BAP API: http://localhost:8081/health');
        console.log('   - Flights BPP: http://localhost:7001/health');
        console.log('   - International Flights BPP: http://localhost:7005/health');
        console.log('   - Hotels BPP: http://localhost:7003/health');
    } else {
        console.log('\n⚠️ SOME ISSUES DETECTED');
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Wait a few seconds for services to fully start');
        console.log('   2. Check if PostgreSQL is running');
        console.log('   3. Verify all databases exist (run: node test-bpp-databases.js)');
        console.log('   4. Restart services if needed (stop-all-services.bat then start-all-services.bat)');
    }
}

main().catch(console.error);