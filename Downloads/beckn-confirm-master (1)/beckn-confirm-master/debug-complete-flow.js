const axios = require('axios');

const API_BASE_URL = 'http://localhost:8081';

async function debugCompleteFlow() {
    try {
        console.log('🔍 COMPLETE BOOKING FLOW DEBUG\n');

        // Step 1: Check all possible emails for bookings
        console.log('1️⃣ CHECKING ALL POSSIBLE USER EMAILS...');
        const possibleEmails = [
            'pratham@gmail.com',
            'pratham@example.com', 
            'test@example.com',
            'admin@example.com',
            'user@example.com',
            'pratham.kumar@example.com',
            'pratham.kumar@gmail.com'
        ];

        let allBookings = [];
        for (const email of possibleEmails) {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/bookings/email/${email}`);
                const bookings = response.data.bookings || [];
                if (bookings.length > 0) {
                    console.log(`✅ ${email}: ${bookings.length} bookings`);
                    allBookings.push(...bookings.map(b => ({...b, searchEmail: email})));
                } else {
                    console.log(`❌ ${email}: 0 bookings`);
                }
            } catch (error) {
                console.log(`❌ ${email}: API Error`);
            }
        }

        // Step 2: Show most recent bookings
        console.log('\\n2️⃣ MOST RECENT BOOKINGS (Last 3):');
        allBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        allBookings.slice(0, 3).forEach((booking, index) => {
            console.log(`${index + 1}. ${booking.item_name} - ${booking.booking_reference}`);
            console.log(`   Email: ${booking.passenger_email} (found via: ${booking.searchEmail})`);
            console.log(`   Created: ${new Date(booking.created_at).toLocaleString()}`);
            console.log(`   Amount: ₹${booking.amount}`);
            console.log('');
        });

        // Step 3: Test the exact API calls the frontend makes
        console.log('3️⃣ TESTING FRONTEND API CALLS...');
        
        // Test primary email (what frontend should use)
        const primaryEmail = 'pratham@gmail.com';
        console.log(`\\n🔍 Testing primary email: ${primaryEmail}`);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/bookings/email/${primaryEmail}`);
            const bookings = response.data.bookings || [];
            console.log(`✅ Primary email result: ${bookings.length} bookings`);
            
            if (bookings.length > 0) {
                console.log('   Latest booking:', bookings[0].booking_reference);
                console.log('   This should appear in "Your Bookings"');
            }
        } catch (error) {
            console.log(`❌ Primary email error:`, error.message);
        }

        // Step 4: Test fallback logic
        console.log('\\n4️⃣ TESTING FALLBACK LOGIC...');
        const fallbackEmails = [
            'pratham@gmail.com',
            'pratham@example.com',
            'test@example.com',
            'admin@example.com'
        ];

        for (const email of fallbackEmails) {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/bookings/email/${email}`);
                const bookings = response.data.bookings || [];
                console.log(`🔄 Fallback ${email}: ${bookings.length} bookings`);
            } catch (error) {
                console.log(`🔄 Fallback ${email}: Error`);
            }
        }

        // Step 5: Check if there are any API issues
        console.log('\\n5️⃣ TESTING API HEALTH...');
        try {
            const healthResponse = await axios.get(`${API_BASE_URL}/health`);
            console.log('✅ API Health: OK');
        } catch (error) {
            try {
                // Try a simple endpoint
                const testResponse = await axios.get(`${API_BASE_URL}/api/bookings/email/test@example.com`);
                console.log('✅ API Working: Basic endpoint responds');
            } catch (testError) {
                console.log('❌ API Issue:', testError.message);
            }
        }

        // Step 6: Recommendations
        console.log('\\n6️⃣ RECOMMENDATIONS:');
        
        if (allBookings.length === 0) {
            console.log('❌ NO BOOKINGS FOUND AT ALL');
            console.log('   - Database might be empty');
            console.log('   - API might not be working');
        } else {
            const prathamGmailBookings = allBookings.filter(b => b.passenger_email === 'pratham@gmail.com');
            if (prathamGmailBookings.length > 0) {
                console.log(`✅ Found ${prathamGmailBookings.length} bookings for pratham@gmail.com`);
                console.log('   - Make sure you are logged in as: pratham@gmail.com');
                console.log('   - Check browser console for frontend errors');
                console.log('   - Try refreshing the "Your Bookings" page');
            } else {
                console.log('❌ No bookings found for pratham@gmail.com');
                console.log('   - Your bookings might be under a different email');
                console.log('   - Check what email you used during booking');
            }
        }

        console.log('\\n🎯 NEXT STEPS:');
        console.log('1. Check what email you are logged in with (look at debug info on Bookings page)');
        console.log('2. If logged in with different email, logout and login with pratham@gmail.com');
        console.log('3. Check browser console (F12) for any JavaScript errors');
        console.log('4. Try clicking the "Refresh" button on the Bookings page');

    } catch (error) {
        console.error('❌ Debug script failed:', error.message);
    }
}

debugCompleteFlow().catch(console.error);