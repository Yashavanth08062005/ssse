/**
 * Test the cancel booking functionality
 */

const axios = require('axios');

async function testCancelBooking() {
    console.log('🧪 Testing cancel booking functionality...\n');
    
    const API_BASE_URL = 'http://localhost:8081';
    
    try {
        // First, get a recent booking to cancel
        console.log('📋 Getting recent bookings...');
        const bookingsResponse = await axios.get(`${API_BASE_URL}/api/bookings/email/yashavanthkate@gmal.com`);
        
        if (!bookingsResponse.data.bookings || bookingsResponse.data.bookings.length === 0) {
            console.log('❌ No bookings found to test cancellation');
            return;
        }
        
        // Find a confirmed booking to cancel
        const confirmedBooking = bookingsResponse.data.bookings.find(
            booking => booking.booking_status === 'CONFIRMED'
        );
        
        if (!confirmedBooking) {
            console.log('❌ No confirmed bookings found to cancel');
            return;
        }
        
        console.log(`📋 Found booking to cancel: ${confirmedBooking.booking_reference}`);
        console.log(`   Type: ${confirmedBooking.booking_type}`);
        console.log(`   Status: ${confirmedBooking.booking_status}`);
        console.log(`   Amount: ${confirmedBooking.currency} ${confirmedBooking.amount}`);
        
        // Test the cancel API
        console.log('\n🔄 Testing cancel API...');
        const cancelResponse = await axios.patch(
            `${API_BASE_URL}/api/bookings/${confirmedBooking.booking_reference}/cancel`
        );
        
        console.log('✅ Cancel API Response:', cancelResponse.data);
        
        if (cancelResponse.data.success) {
            console.log(`✅ Booking ${confirmedBooking.booking_reference} cancelled successfully!`);
            console.log(`   New Status: ${cancelResponse.data.booking.booking_status}`);
            
            // Verify the cancellation in database
            console.log('\n📋 Verifying cancellation in database...');
            const verifyResponse = await axios.get(`${API_BASE_URL}/api/bookings/email/yashavanthkate@gmal.com`);
            const cancelledBooking = verifyResponse.data.bookings.find(
                booking => booking.booking_reference === confirmedBooking.booking_reference
            );
            
            if (cancelledBooking && cancelledBooking.booking_status === 'CANCELLED') {
                console.log('✅ Cancellation verified in database!');
                console.log(`   Status: ${cancelledBooking.booking_status}`);
                console.log(`   Updated: ${cancelledBooking.updated_at}`);
            } else {
                console.log('❌ Cancellation not reflected in database');
            }
        } else {
            console.log('❌ Cancel API failed:', cancelResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Error testing cancel booking:', error.response?.data || error.message);
    }
}

testCancelBooking();