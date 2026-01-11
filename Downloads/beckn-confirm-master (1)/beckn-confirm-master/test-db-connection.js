const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'travel_discovery',
  user: 'postgres',
  password: '123456'
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    
    // Test if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Available tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Test flights data
    const flightsCount = await client.query('SELECT COUNT(*) FROM flights');
    console.log(`✈️  Flights in database: ${flightsCount.rows[0].count}`);
    
    // Test hotels data  
    const hotelsCount = await client.query('SELECT COUNT(*) FROM hotels');
    console.log(`🏨 Hotels in database: ${hotelsCount.rows[0].count}`);
    
    client.release();
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solutions:');
      console.log('1. Make sure PostgreSQL is running');
      console.log('2. Check if port 5432 is correct');
      console.log('3. Verify database "travel_discovery" exists');
    } else if (error.code === '28P01') {
      console.log('\n💡 Solutions:');
      console.log('1. Check username: postgres');
      console.log('2. Check password: 123456');
    } else if (error.code === '3D000') {
      console.log('\n💡 Solutions:');
      console.log('1. Create database "travel_discovery" in pgAdmin');
      console.log('2. Run the database setup scripts');
    }
  } finally {
    await pool.end();
  }
}

testConnection();