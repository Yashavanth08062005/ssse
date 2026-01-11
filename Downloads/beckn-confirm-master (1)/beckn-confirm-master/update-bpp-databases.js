const { Pool } = require('pg');

// Configuration for all BPP databases
const databases = [
  { name: 'flights_bpp', port: 5432 },
  { name: 'hotels_bpp', port: 5432 },
  { name: 'international_flights_bpp', port: 5432 }
];

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123',
};

async function updateDatabase(dbName) {
  console.log(`Updating database: ${dbName}`);
  
  const pool = new Pool({
    ...dbConfig,
    database: dbName
  });

  try {
    // Add cancellation and refund fields to bpp_bookings table
    const alterQuery = `
      ALTER TABLE bpp_bookings 
      ADD COLUMN IF NOT EXISTS cancellation_status VARCHAR(20) DEFAULT 'NOT_CANCELLED',
      ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(100),
      ADD COLUMN IF NOT EXISTS cancellation_time TIMESTAMP,
      ADD COLUMN IF NOT EXISTS cancellation_charges DECIMAL(10, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20) DEFAULT 'NOT_INITIATED',
      ADD COLUMN IF NOT EXISTS refund_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS refund_initiated_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS refund_completed_at TIMESTAMP;
    `;
    
    await pool.query(alterQuery);
    console.log(`✅ Successfully updated bpp_bookings table in ${dbName}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${dbName}:`, error.message);
  } finally {
    await pool.end();
  }
}

async function runUpdates() {
  console.log('Starting database schema updates...\n');
  
  for (const db of databases) {
    await updateDatabase(db.name);
  }
  
  console.log('\n✅ All database updates completed!');
}

// Run the updates
runUpdates().catch(console.error);