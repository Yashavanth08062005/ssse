const axios = require('axios');

const API_BASE_URL = 'http://localhost:8081';

async function debugBookings() {
    try {
        console.log('🔍 Debugging Bookings Database...\n');

        // Check what emails have bookings
        const testEmails = [
            'pratham@example.com',
            'test@example.com', 
            'admin@example.com',
            'user@example.com'
        ];

        for (const email of testEmails) {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/bookings/email/${email}`);
                const bookings = response.data.bookings || [];
                console.log(`📧 ${email}: ${bookings.length} bookings`);
                
                if (bookings.length > 0) {
                    bookings.forEach((booking, index) => {
                        console.log(`   ${index + 1}. ${booking.item_name} - ${booking.booking_reference}`);
                        console.log(`      Email: ${booking.passenger_email}`);
                        console.log(`      Status: ${booking.booking_status}`);
                        console.log(`      Created: ${new Date(booking.created_at).toLocaleString()}`);
                    });
                }
                console.log('');
            } catch (error) {
                console.log(`📧 ${email}: No bookings or error`);
            }
        }

        // Try to get all bookings to see what exists
        console.log('🗄️ Checking all bookings in database...');
        try {
            // This might not work if there's no "get all" endpoint, but let's try
            const response = await axios.get(`${API_BASE_URL}/api/bookings`);
            console.log(`Total bookings in database: ${response.data.bookings?.length || 0}`);
        } catch (error) {
            console.log('Cannot fetch all bookings (endpoint might not exist)');
        }

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugBookings().catch(console.error);