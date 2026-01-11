const axios = require('axios');

const API_BASE_URL = 'http://localhost:8081';

async function checkRecentBookings() {
    try {
        console.log('🔍 Checking for recent bookings...\n');

        // Check common emails
        const emails = [
            'pratham@example.com',
            'test@example.com',
            'admin@example.com',
            'user@example.com',
            'pratham.kumar@example.com',
            'pratham@gmail.com'
        ];

        let allBookings = [];

        for (const email of emails) {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/bookings/email/${email}`);
                const bookings = response.data.bookings || [];
                
                if (bookings.length > 0) {
                    console.log(`📧 ${email}: ${bookings.length} bookings`);
                    bookings.forEach((booking, index) => {
                        console.log(`   ${index + 1}. ${booking.item_name} - ${booking.booking_reference}`);
                        console.log(`      Email: ${booking.passenger_email}`);
                        console.log(`      Status: ${booking.booking_status}`);
                        console.log(`      Created: ${new Date(booking.created_at).toLocaleString()}`);
                        console.log(`      Amount: ₹${booking.amount}`);
                        console.log('');
                    });
                    allBookings.push(...bookings);
                } else {
                    console.log(`📧 ${email}: 0 bookings`);
                }
            } catch (error) {
                console.log(`📧 ${email}: Error or no bookings`);
            }
        }

        // Sort all bookings by creation time (most recent first)
        allBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        console.log('\\n🕒 All bookings sorted by time (most recent first):');
        allBookings.forEach((booking, index) => {
            console.log(`${index + 1}. ${booking.item_name} - ${booking.booking_reference}`);
            console.log(`   Email: ${booking.passenger_email}`);
            console.log(`   Created: ${new Date(booking.created_at).toLocaleString()}`);
            console.log(`   Amount: ₹${booking.amount}`);
            console.log('');
        });

        if (allBookings.length > 0) {
            const mostRecent = allBookings[0];
            console.log('🎯 Most recent booking:');
            console.log(`   Reference: ${mostRecent.booking_reference}`);
            console.log(`   Email: ${mostRecent.passenger_email}`);
            console.log(`   Flight: ${mostRecent.item_name}`);
            console.log(`   Time: ${new Date(mostRecent.created_at).toLocaleString()}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkRecentBookings().catch(console.error);