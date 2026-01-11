const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'travel_discovery',
    user: 'postgres',
    password: '123'
});

async function checkBookings() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Checking bookings table...\n');

        // Check if table exists
        const tableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'bookings'
            );
        `);
        
        console.log('📋 Table exists:', tableExists.rows[0].exists);

        if (tableExists.rows[0].exists) {
            // Count rows
            const count = await client.query('SELECT COUNT(*) as total FROM bookings');
            console.log('📈 Total rows:', count.rows[0].total);

            // Get column names
            const columns = await client.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'bookings'
                ORDER BY ordinal_position;
            `);
            
            console.log('\n📋 Columns (' + columns.rows.length + ' total):');
            columns.rows.slice(0, 10).forEach(col => {
                console.log(`   ${col.column_name}: ${col.data_type}`);
            });

            // Try to get all data
            const allData = await client.query('SELECT * FROM bookings ORDER BY created_at DESC');
            
            if (allData.rows.length > 0) {
                console.log(`\n📄 Found ${allData.rows.length} bookings:`);
                allData.rows.forEach((row, i) => {
                    console.log(`\n--- Booking ${i + 1} ---`);
                    console.log(`   ID: ${row.id}`);
                    console.log(`   Reference: ${row.booking_reference || 'N/A'}`);
                    console.log(`   Type: ${row.booking_type || 'N/A'}`);
                    console.log(`   Passenger: ${row.passenger_name || 'N/A'}`);
                    console.log(`   Email: ${row.passenger_email || 'N/A'}`);
                    console.log(`   Amount: ${row.currency || 'INR'}${row.amount || 'N/A'}`);
                    console.log(`   Status: ${row.booking_status || 'N/A'}`);
                    console.log(`   Created: ${row.created_at || 'N/A'}`);
                    if (row.origin && row.destination) {
                        console.log(`   Route: ${row.origin} → ${row.destination}`);
                    }
                });
            } else {
                console.log('\n📄 No data found in bookings table');
                
                // Let's check if the table is completely empty
                const tableSize = await client.query(`
                    SELECT 
                        schemaname,
                        tablename,
                        attname,
                        n_distinct,
                        correlation
                    FROM pg_stats 
                    WHERE tablename = 'bookings' 
                    LIMIT 5;
                `);
                
                console.log('\n📊 Table statistics:', tableSize.rows.length > 0 ? 'Has stats' : 'No statistics (empty table)');
                
                // Check table permissions
                const permissions = await client.query(`
                    SELECT 
                        grantee, 
                        privilege_type 
                    FROM information_schema.role_table_grants 
                    WHERE table_name = 'bookings';
                `);
                
                console.log('\n🔐 Table permissions:');
                if (permissions.rows.length > 0) {
                    permissions.rows.forEach(perm => {
                        console.log(`   ${perm.grantee}: ${perm.privilege_type}`);
                    });
                } else {
                    console.log('   No specific permissions found');
                }
            }
        } else {
            console.log('❌ Bookings table does not exist!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

checkBookings().catch(console.error);