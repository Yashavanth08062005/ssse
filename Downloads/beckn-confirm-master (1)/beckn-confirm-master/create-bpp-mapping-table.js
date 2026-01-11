/**
 * Create BPP Booking Mapping Table in BAP Database
 * Run: node create-bpp-mapping-table.js
 */

const { Pool } = require('pg');

async function createBppMappingTable() {
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'travel_discovery',
        user: 'postgres',
        password: '123',
    });

    try {
        console.log('🗄️ Creating BPP booking mapping table...');
        
        const client = await pool.connect();

        // Create the mapping table
        await client.query(`
            CREATE TABLE IF NOT EXISTS bpp_booking_mappings (
                id SERIAL PRIMARY KEY,
                platform_booking_id VARCHAR(50) NOT NULL,
                platform_booking_reference VARCHAR(50) NOT NULL,
                bpp_service_type VARCHAR(50) NOT NULL,
                bpp_booking_id VARCHAR(50) NOT NULL,
                bpp_service_url VARCHAR(200),
                beckn_transaction_id VARCHAR(100),
                beckn_message_id VARCHAR(100),
                mapping_status VARCHAR(20) DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                UNIQUE(platform_booking_id, bpp_service_type)
            )
        `);

        console.log('✅ Table bpp_booking_mappings created successfully');

        // Create indexes
        await client.query('CREATE INDEX IF NOT EXISTS idx_bpp_mappings_platform_id ON bpp_booking_mappings(platform_booking_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_bpp_mappings_bpp_id ON bpp_booking_mappings(bpp_booking_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_bpp_mappings_reference ON bpp_booking_mappings(platform_booking_reference)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_bpp_mappings_service_type ON bpp_booking_mappings(bpp_service_type)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_bpp_mappings_status ON bpp_booking_mappings(mapping_status)');

        console.log('✅ Indexes created successfully');

        // Add comment
        await client.query(`
            COMMENT ON TABLE bpp_booking_mappings IS 'Maps platform booking IDs to BPP booking IDs for tracking bookings across services'
        `);

        // Verify table structure
        const result = await client.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable, 
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'bpp_booking_mappings' 
            ORDER BY ordinal_position
        `);

        console.log('\n📋 Table structure:');
        result.rows.forEach(row => {
            console.log(`   ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
        });

        client.release();
        await pool.end();

        console.log('\n🎉 BPP booking mapping table setup completed!');
        console.log('\n📊 Table Features:');
        console.log('   ✅ Maps platform booking IDs to BPP booking IDs');
        console.log('   ✅ Tracks service type (flights, international_flights, hotels)');
        console.log('   ✅ Stores Beckn transaction and message IDs');
        console.log('   ✅ Supports status tracking (ACTIVE, CANCELLED, FAILED)');
        console.log('   ✅ Optimized with indexes for fast lookups');
        console.log('\n🔄 Ready for booking ID mapping operations!');

    } catch (error) {
        console.error('❌ Error creating BPP mapping table:', error.message);
        
        if (error.code === '28P01') {
            console.log('💡 Authentication failed. Check password (should be "123")');
        } else if (error.code === '3D000') {
            console.log('💡 Database "travel_discovery" not found. Make sure it exists.');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 Cannot connect to PostgreSQL. Make sure it\'s running.');
        }
        
        await pool.end();
        process.exit(1);
    }
}

createBppMappingTable();