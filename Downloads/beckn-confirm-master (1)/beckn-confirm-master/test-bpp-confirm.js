const axios = require('axios');

async function testBppConfirm() {
    console.log('🧪 Testing BPP Confirm Process...\n');

    // Test data for a flight booking
    const testBooking = {
        context: {
            domain: "mobility",
            country: "IND",
            city: "std:080",
            action: "confirm",
            core_version: "1.2.0",
            bap_id: "travel-discovery-bap.example.com",
            bap_uri: "http://localhost:8081",
            bpp_id: "flights-bpp.example.com",
            bpp_uri: "http://localhost:7001",
            transaction_id: `txn-${Date.now()}`,
            message_id: `msg-${Date.now()}`,
            timestamp: new Date().toISOString()
        },
        message: {
            order: {
                id: `order-${Date.now()}`,
                items: [
                    {
                        id: "flight-1", // This should now be parsed correctly as flight ID 1
                        category_id: "FLIGHT",
                        descriptor: {
                            name: "Air India",
                            code: "AI-1234"
                        }
                    }
                ],
                billing: {
                    name: "Test Passenger",
                    email: "test@example.com",
                    phone: "+91-9876543210"
                },
                fulfillment: {
                    start: {
                        location: {
                            gps: "12.9716,77.5946"
                        }
                    },
                    end: {
                        location: {
                            gps: "19.0896,72.8656"
                        }
                    }
                }
            }
        }
    };

    try {
        console.log('1️⃣ Testing direct BPP confirm call...');
        
        // Test direct call to Flights BPP
        const bppResponse = await axios.post('http://localhost:7001/confirm', testBooking, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ BPP Response Status:', bppResponse.status);
        console.log('📄 BPP Response Data:', JSON.stringify(bppResponse.data, null, 2));

        // Check if BPP booking was created
        console.log('\n2️⃣ Checking if BPP booking was saved...');
        
        const bppBookingId = bppResponse.data?.message?.order?.bpp_booking_id;
        if (bppBookingId) {
            console.log('✅ BPP Booking ID returned:', bppBookingId);
        } else {
            console.log('❌ No BPP Booking ID in response');
        }

    } catch (error) {
        console.error('❌ Error testing BPP confirm:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }

    try {
        console.log('\n3️⃣ Testing BAP confirm call (full flow)...');
        
        // Test call through BAP (which should route to BPP)
        const bapResponse = await axios.post('http://localhost:8081/beckn/confirm', testBooking, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ BAP Response Status:', bapResponse.status);
        console.log('📄 BAP Response Data:', JSON.stringify(bapResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Error testing BAP confirm:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }

    // Check BPP bookings after test
    console.log('\n4️⃣ Checking BPP bookings table after test...');
    
    const { Pool } = require('pg');
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'flights_bpp',
        user: 'postgres',
        password: '123'
    });

    const client = await pool.connect();
    
    try {
        const result = await client.query('SELECT * FROM bpp_bookings ORDER BY created_at DESC LIMIT 3');
        
        if (result.rows.length > 0) {
            console.log(`✅ Found ${result.rows.length} BPP bookings:`);
            result.rows.forEach((booking, i) => {
                console.log(`   ${i + 1}. ${booking.bpp_booking_id} - ${booking.passenger_name} (${booking.booking_status})`);
            });
        } else {
            console.log('❌ No BPP bookings found in database');
        }

    } catch (dbError) {
        console.error('❌ Database error:', dbError.message);
    } finally {
        client.release();
        await pool.end();
    }
}

testBppConfirm().catch(console.error);