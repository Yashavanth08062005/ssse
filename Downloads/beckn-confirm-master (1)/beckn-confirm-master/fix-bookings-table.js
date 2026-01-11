const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'travel_discovery',
    user: 'postgres',
    password: '123'
});

async function fixBookingsTable() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 Fixing bookings table...\n');

        // Check if bookings table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'bookings'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.log('📋 Creating bookings table...');
            
            // Create bookings table
            await client.query(`
                CREATE TABLE bookings (
                    id SERIAL PRIMARY KEY,
                    booking_reference VARCHAR(50) UNIQUE NOT NULL,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    
                    -- Booking Type
                    booking_type VARCHAR(20) NOT NULL, -- 'flight' or 'hotel'
                    
                    -- Item Details (flight or hotel)
                    item_id VARCHAR(100) NOT NULL,
                    provider_id VARCHAR(100),
                    item_name VARCHAR(255), -- Airline name or Hotel name
                    item_code VARCHAR(100), -- Flight number or Hotel code
                    
                    -- Flight specific
                    origin VARCHAR(10),
                    destination VARCHAR(10),
                    departure_time TIMESTAMP,
                    arrival_time TIMESTAMP,
                    
                    -- Hotel specific
                    check_in_date DATE,
                    check_out_date DATE,
                    
                    -- Passenger/Guest Details
                    passenger_name VARCHAR(255) NOT NULL,
                    passenger_email VARCHAR(255) NOT NULL,
                    passenger_phone VARCHAR(50) NOT NULL,
                    passenger_gender VARCHAR(20),
                    date_of_birth DATE,
                    nationality VARCHAR(100),
                    passport_number VARCHAR(50),
                    
                    -- Address Details
                    address_line1 VARCHAR(255),
                    address_line2 VARCHAR(255),
                    city VARCHAR(100),
                    state VARCHAR(100),
                    postal_code VARCHAR(20),
                    country VARCHAR(100),
                    
                    -- Payment Details
                    transaction_id VARCHAR(100) UNIQUE NOT NULL,
                    payment_method VARCHAR(50), -- 'card', 'upi', 'wallet'
                    payment_status VARCHAR(50) DEFAULT 'PAID', -- 'PAID', 'PENDING', 'FAILED', 'REFUNDED'
                    amount DECIMAL(10, 2) NOT NULL,
                    currency VARCHAR(3) DEFAULT 'INR',
                    
                    -- Booking Status
                    booking_status VARCHAR(50) DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'CANCELLED', 'COMPLETED'
                    
                    -- Beckn Details
                    beckn_transaction_id VARCHAR(100),
                    beckn_message_id VARCHAR(100),
                    order_id VARCHAR(100),
                    
                    -- Additional Details (JSON for flexibility)
                    item_details JSONB, -- Complete item object
                    booking_metadata JSONB, -- Any additional data
                    
                    -- Timestamps
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            console.log('✅ Bookings table created successfully!');

            // Create indexes (with IF NOT EXISTS to avoid conflicts)
            const indexes = [
                'CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id)',
                'CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference)',
                'CREATE INDEX IF NOT EXISTS idx_bookings_transaction_id ON bookings(transaction_id)',
                'CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings(booking_type)',
                'CREATE INDEX IF NOT EXISTS idx_bookings_booking_status ON bookings(booking_status)',
                'CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC)',
                'CREATE INDEX IF NOT EXISTS idx_bookings_passenger_email ON bookings(passenger_email)'
            ];

            for (const indexQuery of indexes) {
                try {
                    await client.query(indexQuery);
                } catch (error) {
                    // Ignore if index already exists
                    if (!error.message.includes('already exists')) {
                        console.log('⚠️ Index warning:', error.message);
                    }
                }
            }

            console.log('✅ Indexes created successfully!');

        } else {
            console.log('✅ Bookings table already exists');
        }

        // Verify table and get count
        const result = await client.query('SELECT COUNT(*) as total_bookings FROM bookings');
        console.log('📊 Total bookings:', result.rows[0].total_bookings);

        // Show table structure
        const columns = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'bookings'
            ORDER BY ordinal_position
            LIMIT 10
        `);

        console.log('\n📋 Table structure (first 10 columns):');
        columns.rows.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
        });

        console.log('\n🎉 Bookings table is ready!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

fixBookingsTable().catch(console.error);