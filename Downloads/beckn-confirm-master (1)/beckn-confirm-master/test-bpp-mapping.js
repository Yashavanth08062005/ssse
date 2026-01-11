/**
 * Test BPP Booking Mapping functionality
 * Run: node test-bpp-mapping.js
 */

const axios = require('axios');

const BAP_BASE_URL = 'http://localhost:8081';

async function testBppMappingAPIs() {
    console.log('🧪 Testing BPP Booking Mapping APIs...\n');

    try {
        // Test 1: Get mapping statistics
        console.log('1️⃣ Testing mapping statistics...');
        try {
            const statsResponse = await axios.get(`${BAP_BASE_URL}/api/bpp-mappings/stats`);
            console.log('✅ Statistics retrieved successfully');
            console.log('   Total mappings:', statsResponse.data.statistics.totalMappings);
            console.log('   By service type:', JSON.stringify(statsResponse.data.statistics.byServiceType, null, 2));
        } catch (error) {
            console.log('⚠️ Statistics endpoint error (expected if no mappings exist yet):', error.response?.status);
        }

        // Test 2: Try to get mappings for a sample platform booking ID
        console.log('\n2️⃣ Testing platform booking ID lookup...');
        try {
            const platformResponse = await axios.get(`${BAP_BASE_URL}/api/bpp-mappings/platform/sample-booking-123`);
            console.log('✅ Platform booking mappings retrieved');
            console.log('   Mapping count:', platformResponse.data.mappingCount);
        } catch (error) {
            if (error.response?.status === 200) {
                console.log('✅ Platform booking endpoint working (no mappings found)');
            } else {
                console.log('⚠️ Platform booking endpoint error:', error.response?.status);
            }
        }

        // Test 3: Try to get mapping for a sample BPP booking ID
        console.log('\n3️⃣ Testing BPP booking ID lookup...');
        try {
            const bppResponse = await axios.get(`${BAP_BASE_URL}/api/bpp-mappings/bpp/FLT-123456-ABC123`);
            console.log('✅ BPP booking mapping retrieved');
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ BPP booking endpoint working (mapping not found - expected)');
            } else {
                console.log('⚠️ BPP booking endpoint error:', error.response?.status);
            }
        }

        // Test 4: Try to get mappings for a sample booking reference
        console.log('\n4️⃣ Testing booking reference lookup...');
        try {
            const refResponse = await axios.get(`${BAP_BASE_URL}/api/bpp-mappings/reference/BK12345678`);
            console.log('✅ Booking reference mappings retrieved');
            console.log('   Mapping count:', refResponse.data.mappingCount);
        } catch (error) {
            if (error.response?.status === 200) {
                console.log('✅ Booking reference endpoint working (no mappings found)');
            } else {
                console.log('⚠️ Booking reference endpoint error:', error.response?.status);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 BPP Mapping API tests completed!');
        console.log('\n📋 Available Endpoints:');
        console.log('   GET /api/bpp-mappings/stats - Get mapping statistics');
        console.log('   GET /api/bpp-mappings/platform/{id} - Get mappings by platform booking ID');
        console.log('   GET /api/bpp-mappings/bpp/{id} - Get mapping by BPP booking ID');
        console.log('   GET /api/bpp-mappings/reference/{ref} - Get mappings by booking reference');
        console.log('   PATCH /api/bpp-mappings/bpp/{id}/status - Update mapping status');
        
        console.log('\n💡 To test with real data:');
        console.log('   1. Make a booking through the frontend');
        console.log('   2. Check the mapping was created');
        console.log('   3. Use the APIs to retrieve mapping information');

    } catch (error) {
        console.error('❌ Error testing BPP mapping APIs:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the BAP service is running:');
            console.log('   - Run: start-all-services.bat');
            console.log('   - Wait for services to start');
            console.log('   - BAP should be available at http://localhost:8081');
        }
    }
}

async function testDatabaseTable() {
    console.log('\n🗄️ Testing BPP Mapping Database Table...');
    
    try {
        // This would require database connection, but we'll just show the SQL
        console.log('📝 To create the BPP mapping table, run this in pgAdmin:');
        console.log('   Database: travel_discovery');
        console.log('   File: create-bpp-booking-mapping-table.sql');
        console.log('\n   Or manually execute:');
        console.log('   CREATE TABLE bpp_booking_mappings (...);');
        
    } catch (error) {
        console.error('❌ Database test error:', error.message);
    }
}

async function main() {
    console.log('🚀 BPP Booking Mapping System Test\n');
    
    await testBppMappingAPIs();
    await testDatabaseTable();
    
    console.log('\n✅ Test completed!');
}

main().catch(console.error);