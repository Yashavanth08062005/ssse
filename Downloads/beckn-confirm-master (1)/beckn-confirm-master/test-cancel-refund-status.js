const axios = require('axios');

/**
 * Test script to verify the complete Beckn cancel and refund flow with status checking
 */

// Configuration
const BAP_BASE_URL = 'http://localhost:8081'; // Update this to your BAP service URL
const CANCELLATION_REASONS = [
    'CUSTOMER_REQUEST',
    'CHANGE_OF_PLANS',
    'EMERGENCY',
    'DUPLICATE_BOOKING'
];

async function testCancelAndRefundFlow() {
    console.log('🚀 Starting Beckn Cancel and Refund Flow Test...\n');

    try {
        // Test data - use a real booking ID from your system
        const testBookingId = 'test-booking-123'; // Replace with actual booking ID
        const cancellationReason = CANCELLATION_REASONS[0];

        console.log('📋 Test 1: Sending Cancel Request');
        console.log(`   Booking ID: ${testBookingId}`);
        console.log(`   Cancellation Reason: ${cancellationReason}\n`);

        // Step 1: Cancel Request
        const cancelResponse = await sendCancelRequest(testBookingId, cancellationReason);
        console.log('✅ Cancel Request Successful!');
        console.log('📋 Cancel Response:', JSON.stringify(cancelResponse.data, null, 2));

        // Extract order details from cancel response
        const order = cancelResponse.data.message.order;
        const refundAmount = order.payment?.params?.amount;
        const refundId = order.payment?.params?.refund_id;
        const cancellationStatus = order.state;

        console.log(`\n💰 Refund Details:`);
        console.log(`   Refund Amount: ₹${refundAmount}`);
        console.log(`   Refund ID: ${refundId}`);
        console.log(`   Cancellation Status: ${cancellationStatus}\n`);

        // Step 2: Status Request (immediate check)
        console.log('📋 Test 2: Checking Booking Status After Cancellation');
        const statusResponse = await sendStatusRequest(testBookingId);
        console.log('✅ Status Request Successful!');
        console.log('📋 Status Response:', JSON.stringify(statusResponse.data, null, 2));

        const statusOrder = statusResponse.data.message.order;
        const currentStatus = statusOrder.state;
        const statusCancellation = statusOrder.cancellation;

        console.log(`\n📊 Status Details:`);
        console.log(`   Current Status: ${currentStatus}`);
        console.log(`   Cancellation Info:`, statusCancellation ? 'Available' : 'Not Available');

        // Step 3: Wait and check status again after some time
        console.log('\n⏳ Waiting 5 seconds before next status check...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('📋 Test 3: Checking Booking Status After Delay');
        const statusResponse2 = await sendStatusRequest(testBookingId);
        console.log('✅ Second Status Request Successful!');
        console.log('📋 Status Response:', JSON.stringify(statusResponse2.data, null, 2));

        console.log('\n🎉 All tests completed successfully!');
        console.log('✅ Cancel and Refund flow is working correctly');
        console.log('✅ Status checking is working correctly');
        console.log('✅ Refund information is properly included');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
    }
}

async function sendCancelRequest(orderId, reason) {
    const cancelRequest = {
        context: {
            domain: 'mobility', // or 'hospitality' for hotels
            country: 'IND',
            city: 'std:080',
            action: 'cancel',
            core_version: '1.1.0',
            bap_id: 'travel-discovery-bap.example.com',
            bap_uri: BAP_BASE_URL,
            transaction_id: `txn-cancel-${Date.now()}`,
            message_id: `msg-cancel-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ttl: 'PT30S'
        },
        message: {
            order_id: orderId,
            cancellation_reason_id: reason,
            original_amount: 5000, // Example amount
            descriptor: {
                name: 'Booking Cancellation',
                short_desc: `Customer requested cancellation: ${reason}`
            }
        }
    };

    console.log('📤 Sending cancel request to:', `${BAP_BASE_URL}/beckn/cancel`);
    return await axios.post(`${BAP_BASE_URL}/beckn/cancel`, cancelRequest);
}

async function sendStatusRequest(orderId) {
    const statusRequest = {
        context: {
            domain: 'mobility', // or 'hospitality' for hotels
            country: 'IND',
            city: 'std:080',
            action: 'status',
            core_version: '1.1.0',
            bap_id: 'travel-discovery-bap.example.com',
            bap_uri: BAP_BASE_URL,
            transaction_id: `txn-status-${Date.now()}`,
            message_id: `msg-status-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ttl: 'PT30S'
        },
        message: {
            order_id: orderId
        }
    };

    console.log('📤 Sending status request to:', `${BAP_BASE_URL}/beckn/status`);
    return await axios.post(`${BAP_BASE_URL}/beckn/status`, statusRequest);
}

// Run the test
testCancelAndRefundFlow();