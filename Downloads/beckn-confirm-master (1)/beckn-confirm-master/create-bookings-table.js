const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'travel_discovery',
    user: 'postgres',
    password: '123'
});

async function createBookingsTable() {
    const client = await pool.connect();
    try {
        console.log('🔧 Creating bookings table...');

        // Create bookings table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                booking_reference VARCHAR(50) UNIQUE NOT NULL,
                user_id INTEGER,
                
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
        `;

        await client.query(createTableQuery);
        console.log('✅ Bookings table created successfully');

        // Create indexes
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);',
            'CREATE INDEX IF NOT EXISTS idx_bookings_transaction_id ON bookings(transaction_id);',
            'CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings(booking_type);',
            'CREATE INDEX IF NOT EXISTS idx_bookings_booking_status ON bookings(booking_status);',
            'CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);',
            'CREATE INDEX IF NOT EXISTS idx_bookings_passenger_email ON bookings(passenger_email);'
        ];

        for (const indexQuery of indexes) {
            await client.query(indexQuery);
        }
        console.log('✅ Indexes created successfully');

        // Verify table creation
        const verifyQuery = 'SELECT COUNT(*) as count FROM bookings;';
        const result = await client.query(verifyQuery);
        console.log(`✅ Bookings table verified. Current bookings: ${result.rows[0].count}`);

        console.log('🎉 Database setup complete! You can now make bookings.');

    } catch (error) {
        console.error('❌ Error creating bookings table:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

createBookingsTable().catch(console.error);