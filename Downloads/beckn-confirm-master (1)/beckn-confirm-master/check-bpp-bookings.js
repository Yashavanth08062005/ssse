const { Pool } = require('pg');

// Database configurations for each BPP
const databases = [
    {
        name: 'Flights BPP',
        config: {
            host: 'localhost',
            port: 5432,
            database: 'flights_bpp',
            user: 'postgres',
            password: '123'
        }
    },
    {
        name: 'International Flights BPP',
        config: {
            host: 'localhost',
            port: 5432,
            database: 'international_flights_bpp',
            user: 'postgres',
            password: '123'
        }
    },
    {
        name: 'Hotels BPP',
        config: {
            host: 'localhost',
            port: 5432,
            database: 'hotels_bpp',
            user: 'postgres',
            password: '123'
        }
    }
];

async function checkBppBookings() {
    console.log('🔍 Checking BPP Bookings Tables...\n');

    for (const db of databases) {
        const pool = new Pool(db.config);
        const client = await pool.connect();
        
        try {
            console.log(`📋 === ${db.name} (${db.config.database}) ===`);

            // Check if bpp_bookings table exists
            const tableExists = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'bpp_bookings'
                );
            `);

            if (tableExists.rows[0].exists) {
                // Count bookings
                const count = await client.query('SELECT COUNT(*) as total FROM bpp_bookings');
                console.log(`   📊 Total BPP bookings: ${count.rows[0].total}`);

                if (count.rows[0].total > 0) {
                    // Get all bookings
                    const bookings = await client.query(`
                        SELECT 
                            bpp_booking_id,
                            platform_booking_id,
                            passenger_name,
                            passenger_email,
                            booking_status,
                            created_at
                        FROM bpp_bookings 
                        ORDER BY created_at DESC
                    `);

                    console.log(`   📄 BPP Bookings:`);
                    bookings.rows.forEach((booking, i) => {
                        console.log(`      ${i + 1}. ${booking.bpp_booking_id}`);
                        console.log(`         Platform ID: ${booking.platform_booking_id}`);
                        console.log(`         Passenger: ${booking.passenger_name}`);
                        console.log(`         Status: ${booking.booking_status}`);
                        console.log(`         Created: ${booking.created_at}`);
                        console.log('');
                    });
                } else {
                    console.log('   📄 No BPP bookings found');
                }

                // Check table structure
                const columns = await client.query(`
                    SELECT column_name, data_type
                    FROM information_schema.columns
                    WHERE table_name = 'bpp_bookings'
                    ORDER BY ordinal_position
                    LIMIT 8;
                `);

                console.log('   📋 Table columns:');
                columns.rows.forEach(col => {
                    console.log(`      ${col.column_name}: ${col.data_type}`);
                });

            } else {
                console.log('   ❌ bpp_bookings table does not exist');
            }

        } catch (error) {
            console.error(`   ❌ Error checking ${db.name}:`, error.message);
        } finally {
            client.release();
            await pool.end();
        }

        console.log(''); // Empty line between databases
    }

    // Also check the BPP mapping table
    console.log('📋 === BPP Booking Mappings (BAP Database) ===');
    const bapPool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'travel_discovery',
        user: 'postgres',
        password: '123'
    });

    const bapClient = await bapPool.connect();
    
    try {
        const mappingExists = await bapClient.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'bpp_booking_mappings'
            );
        `);

        if (mappingExists.rows[0].exists) {
            const mappingCount = await bapClient.query('SELECT COUNT(*) as total FROM bpp_booking_mappings');
            console.log(`   📊 Total mappings: ${mappingCount.rows[0].total}`);

            if (mappingCount.rows[0].total > 0) {
                const mappings = await bapClient.query(`
                    SELECT 
                        platform_booking_id,
                        bpp_booking_id,
                        bpp_service_type,
                        mapping_status,
                        created_at
                    FROM bpp_booking_mappings 
                    ORDER BY created_at DESC
                `);

                console.log('   📄 Mappings:');
                mappings.rows.forEach((mapping, i) => {
                    console.log(`      ${i + 1}. Platform: ${mapping.platform_booking_id}`);
                    console.log(`         BPP: ${mapping.bpp_booking_id}`);
                    console.log(`         Service: ${mapping.bpp_service_type}`);
                    console.log(`         Status: ${mapping.mapping_status}`);
                    console.log('');
                });
            } else {
                console.log('   📄 No mappings found');
            }
        } else {
            console.log('   ❌ bpp_booking_mappings table does not exist');
        }

    } catch (error) {
        console.error('   ❌ Error checking mappings:', error.message);
    } finally {
        bapClient.release();
        await bapPool.end();
    }
}

checkBppBookings().catch(console.error);