const axios = require('axios');

const API_BASE_URL = 'http://localhost:8081';

async function createPrathamBooking() {
    try {
        console.log('🎯 Creating booking for pratham@example.com...\n');

        const booking = {
            booking_reference: `PK${Date.now().toString().slice(-8)}`,
            booking_type: 'flight',
            item_id: 'flight-blr-del-001',
            provider_id: 'air-india',
            item_name: 'Air India AI-505',
            item_code: 'AI-505',
            origin: 'BLR',
            destination: 'DEL',
            departure_time: '2024-12-30T08:30:00Z',
            arrival_time: '2024-12-30T11:15:00Z',
            passenger_name: 'Pratham Kumar',
            passenger_email: 'pratham@example.com', // Exact email
            passenger_phone: '+91-9876543210',
            passenger_gender: 'Male',
            date_of_birth: '1995-05-15',
            nationality: 'Indian',
            address_line1: '123 Tech Street',
            city: 'Bangalore',
            state: 'Karnataka',
            postal_code: '560001',
            country: 'India',
            transaction_id: `TXN${Date.now()}`,
            payment_method: 'razorpay',
            payment_status: 'PAID',
            amount: 7500,
            currency: 'INR',
            booking_status: 'CONFIRMED',
            beckn_transaction_id: `beckn-txn-${Date.now()}`,
            beckn_message_id: `beckn-msg-${Date.now()}`,
            order_id: `order-${Date.now()}`,
            item_details: {
                airline: 'Air India',
                flightNumber: 'AI-505',
                origin: 'BLR',
                destination: 'DEL',
                departureTime: '2024-12-30T08:30:00Z',
                arrivalTime: '2024-12-30T11:15:00Z'
            },
            booking_metadata: {
                payment_date: new Date().toISOString(),
                booking_source: 'web',
                created_for_user: 'pratham@example.com'
            }
        };

        const response = await axios.post(`${API_BASE_URL}/api/bookings`, booking);
        console.log('✅ Booking created successfully!');
        console.log(`   Reference: ${response.data.booking.booking_reference}`);
        console.log(`   Email: ${response.data.booking.passenger_email}`);
        console.log(`   Amount: ₹${response.data.booking.amount}`);
        console.log(`   Flight: ${response.data.booking.item_name}`);

        // Verify it was saved correctly
        console.log('\\n🔍 Verifying booking...');
        const verifyResponse = await axios.get(`${API_BASE_URL}/api/bookings/email/pratham@example.com`);
        console.log(`✅ Bookings for pratham@example.com: ${verifyResponse.data.bookings?.length || 0}`);
        
        if (verifyResponse.data.bookings && verifyResponse.data.bookings.length > 0) {
            verifyResponse.data.bookings.forEach((booking, index) => {
                console.log(`   ${index + 1}. ${booking.item_name} - ${booking.booking_reference}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

createPrathamBooking().catch(console.error);