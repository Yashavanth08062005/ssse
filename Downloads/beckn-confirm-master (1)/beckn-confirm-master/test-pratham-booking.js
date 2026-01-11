const axios = require('axios');

const API_BASE_URL = 'http://localhost:8081';

async function testPrathamBooking() {
    try {
        console.log('🧪 Testing booking for pratham@gmail.com...\n');

        // Create a booking exactly like the PaymentPage would (with the fix)
        const bookingPayload = {
            booking_reference: `BK${Date.now().toString().slice(-8)}`,
            booking_type: 'flight',
            item_id: 'flight-del-bom-test',
            provider_id: 'indigo-airlines',
            item_name: 'IndiGo 6E-789',
            item_code: '6E-789',
            origin: 'DEL',
            destination: 'BOM',
            departure_time: '2024-12-30T10:30:00Z',
            arrival_time: '2024-12-30T12:45:00Z',
            passenger_name: 'Pratham User',
            passenger_email: 'pratham@gmail.com', // This should match your login email
            passenger_phone: '+91-9876543210',
            passenger_gender: 'Male',
            date_of_birth: '1995-01-01',
            nationality: 'Indian',
            address_line1: 'Test Address',
            city: 'Delhi',
            state: 'Delhi',
            postal_code: '110001',
            country: 'India',
            transaction_id: `TXN${Date.now()}`,
            payment_method: 'razorpay',
            payment_status: 'PAID',
            amount: 4800,
            currency: 'INR',
            booking_status: 'CONFIRMED',
            beckn_transaction_id: `beckn-txn-${Date.now()}`,
            beckn_message_id: `beckn-msg-${Date.now()}`,
            order_id: `order-${Date.now()}`,
            item_details: {
                airline: 'IndiGo',
                flightNumber: '6E-789',
                origin: 'DEL',
                destination: 'BOM',
                departureTime: '2024-12-30T10:30:00Z',
                arrivalTime: '2024-12-30T12:45:00Z'
            },
            booking_metadata: {
                payment_date: new Date().toISOString(),
                booking_source: 'web',
                test_fix: true
            }
        };

        console.log('📧 Using email:', bookingPayload.passenger_email);
        console.log('✈️ Flight:', bookingPayload.item_name);
        console.log('💰 Amount: ₹' + bookingPayload.amount);

        // Save the booking
        const response = await axios.post(`${API_BASE_URL}/api/bookings`, bookingPayload);
        console.log('✅ Booking created successfully!');
        console.log('   Reference:', response.data.booking.booking_reference);

        // Verify it can be fetched
        console.log('\n🔍 Verifying booking can be fetched...');
        const fetchResponse = await axios.get(`${API_BASE_URL}/api/bookings/email/pratham@gmail.com`);
        const bookings = fetchResponse.data.bookings || [];
        
        console.log(`✅ Total bookings for pratham@gmail.com: ${bookings.length}`);
        
        // Show the most recent booking
        if (bookings.length > 0) {
            const latest = bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
            console.log('🎯 Latest booking:');
            console.log(`   Reference: ${latest.booking_reference}`);
            console.log(`   Flight: ${latest.item_name}`);
            console.log(`   Email: ${latest.passenger_email}`);
            console.log(`   Created: ${new Date(latest.created_at).toLocaleString()}`);
        }

        console.log('\n🚀 Now go to "Your Bookings" page and you should see this booking!');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testPrathamBooking().catch(console.error);