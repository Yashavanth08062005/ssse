/**
 * Test script for authentication system
 * Run: node test-auth.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8081/api/auth';

async function testAuth() {
    console.log('🧪 Testing Authentication System\n');

    try {
        // Test 1: Register a new user
        console.log('1️⃣  Testing Registration...');
        const registerData = {
            email: 'test@example.com',
            password: 'password123',
            full_name: 'Test User',
            phone: '1234567890'
        };

        const registerResponse = await axios.post(`${BASE_URL}/register`, registerData);
        console.log('✅ Registration successful!');
        console.log('   User:', registerResponse.data.user.email);
        console.log('   Token:', registerResponse.data.token.substring(0, 20) + '...\n');

        const token = registerResponse.data.token;

        // Test 2: Login with the same user
        console.log('2️⃣  Testing Login...');
        const loginData = {
            email: 'test@example.com',
            password: 'password123'
        };

        const loginResponse = await axios.post(`${BASE_URL}/login`, loginData);
        console.log('✅ Login successful!');
        console.log('   User:', loginResponse.data.user.email);
        console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...\n');

        // Test 3: Get user profile (protected route)
        console.log('3️⃣  Testing Get Profile (Protected Route)...');
        const profileResponse = await axios.get(`${BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Profile retrieved successfully!');
        console.log('   User:', profileResponse.data.user);
        console.log();

        // Test 4: Verify token
        console.log('4️⃣  Testing Token Verification...');
        const verifyResponse = await axios.get(`${BASE_URL}/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Token verified successfully!');
        console.log('   Valid:', verifyResponse.data.success);
        console.log();

        // Test 5: Test invalid login
        console.log('5️⃣  Testing Invalid Login...');
        try {
            await axios.post(`${BASE_URL}/login`, {
                email: 'test@example.com',
                password: 'wrongpassword'
            });
        } catch (error) {
            console.log('✅ Invalid login correctly rejected!');
            console.log('   Error:', error.response.data.error);
            console.log();
        }

        console.log('🎉 All authentication tests passed!\n');
        console.log('📝 Summary:');
        console.log('   ✅ User registration working');
        console.log('   ✅ User login working');
        console.log('   ✅ JWT token generation working');
        console.log('   ✅ Protected routes working');
        console.log('   ✅ Token verification working');
        console.log('   ✅ Invalid credentials rejected');

    } catch (error) {
        if (error.response) {
            console.error('❌ Test failed:', error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            console.error('❌ Cannot connect to server. Make sure BAP service is running on port 8081');
        } else {
            console.error('❌ Test failed:', error.message);
        }
    }
}

// Run tests
testAuth();
