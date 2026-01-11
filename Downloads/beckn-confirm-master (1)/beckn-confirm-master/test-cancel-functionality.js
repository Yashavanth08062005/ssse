/**
 * Comprehensive test for cancel booking functionality
 */

const { Pool } = require('pg');
const axios = require('axios');

async function testCancelFunctionality() {
    console.log('🧪 Testing complete cancel booking functionality...\n');
    
    const API_BASE_URL = 'http://localhost:8081';
    
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'travel_discovery',
        user: 'postgres',
        password: '2005',
    });
    
    try {
        const client = await pool.connect();
        
        // Step 1: Check current booking statuses
        console.log('📊 Current booking statuses:');
        const statusResult = await client.query(`
            SELECT booking_status, COUNT(*) as count
            FROM bookings 
            WHERE passenger_email = 'yashavanthkate@gmal.com'
            GROUP BY booking_status
            ORDER BY booking_status
        `);
        
        statusResult.rows.forEach(row => {
            console.log(`   ${row.booking_status}: ${row.count} bookings`);
        });
        
        // Step 2: Find a confirmed booking to cancel
        const confirmedResult = await client.query(`
            SELECT booking_reference, booking_type, item_name, amount, booking_status
            FROM bookings 
            WHERE passenger_email = 'yashavanthkate@gmal.com'
            AND booking_status = 'CONFIRMED'
            ORDER BY created_at DESC
            LIMIT 1
        `);
        
        if (confirmedResult.rows.length === 0) {
            console.log('\n❌ No confirmed bookings found to test cancellation');
            
            // Show available bookings
            const allResult = await client.query(`
                SELECT booking_reference, booking_status, booking_type, item_name
                FROM bookings 
                WHERE passenger_email = 'yashavanthkate@gmal.com'
                ORDER BY created_at DESC
                LIMIT 5
            `);
            
            console.log('\n📋 Available bookings:');
            allResult.rows.forEach((booking, index) => {
                console.log(`   ${index + 1}. ${booking.booking_reference} (${booking.booking_type}) - ${booking.booking_status}`);
            });
            
            client.release();
            await pool.end();
            return;
        }
        
        const bookingToCancel = confirmedResult.rows[0];
        console.log(`\n📋 Testing cancellation for: ${bookingToCancel.booking_reference}`);
        console.log(`   Type: ${bookingToCancel.booking_type}`);
        console.log(`   Name: ${bookingToCancel.item_name || 'N/A'}`);
        console.log(`   Amount: ₹${bookingToCancel.amount}`);
        console.log(`   Current Status: ${bookingToCancel.booking_status}`);
        
        // Step 3: Test the cancel API
        console.log('\n🔄 Calling cancel API...');
        const cancelResponse = await axios.patch(
            `${API_BASE_URL}/api/bookings/${bookingToCancel.booking_reference}/cancel`
        );
        
        if (cancelResponse.data.success) {
            console.log('✅ Cancel API successful!');
            console.log(`   New Status: ${cancelResponse.data.booking.booking_status}`);
            console.log(`   Updated At: ${cancelResponse.data.booking.updated_at}`);
            
            // Step 4: Verify in database
            console.log('\n📋 Verifying in database...');
            const verifyResult = await client.query(`
                SELECT booking_reference, booking_status, updated_at
                FROM bookings 
                WHERE booking_reference = $1
            `, [bookingToCancel.booking_reference]);
            
            const updatedBooking = verifyResult.rows[0];
            if (updatedBooking.booking_status === 'CANCELLED') {
                console.log('✅ Database verification successful!');
                console.log(`   Status: ${updatedBooking.booking_status}`);
                console.log(`   Updated: ${new Date(updatedBooking.updated_at).toLocaleString()}`);
            } else {
                console.log('❌ Database verification failed!');
                console.log(`   Expected: CANCELLED, Got: ${updatedBooking.booking_status}`);
            }
            
            // Step 5: Check updated status distribution
            console.log('\n📊 Updated booking statuses:');
            const newStatusResult = await client.query(`
                SELECT booking_status, COUNT(*) as count
                FROM bookings 
                WHERE passenger_email = 'yashavanthkate@gmal.com'
                GROUP BY booking_status
                ORDER BY booking_status
            `);
            
            newStatusResult.rows.forEach(row => {
                console.log(`   ${row.booking_status}: ${row.count} bookings`);
            });
            
        } else {
            console.log('❌ Cancel API failed:', cancelResponse.data);
        }
        
        client.release();
        await pool.end();
        
        console.log('\n🎉 Cancel functionality test completed!');
        
    } catch (error) {
        console.error('❌ Error testing cancel functionality:', error.response?.data || error.message);
        await pool.end();
    }
}

testCancelFunctionality();