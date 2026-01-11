const axios = require('axios');

const payload = {
    context: {
        domain: "mobility",
        action: "search",
        transaction_id: "test-txn-" + Date.now(),
        message_id: "test-msg-" + Date.now(),
        timestamp: new Date().toISOString()
    },
    message: {
        intent: {
            fulfillment: {
                start: {
                    location: {
                        gps: "12.9716,77.5946" // Bangalore
                    }
                },
                end: {
                    location: {
                        gps: "12.9941,80.1709" // Chennai (MAA Airport GPS from frontend)
                    }
                },
                time: {
                    range: {
                        start: new Date().toISOString()
                    }
                }
            }
        }
    }
};

async function testSearch() {
    try {
        console.log('🚀 Sending search request to Trains BPP (http://localhost:3005/search)...');
        const response = await axios.post('http://localhost:3005/search', payload);

        console.log('✅ Response Status:', response.status);
        const catalog = response.data.message?.catalog;

        if (catalog && catalog.providers && catalog.providers.length > 0) {
            console.log(`✅ Found ${catalog.providers[0].items.length} items.`);
            // console.log(JSON.stringify(catalog, null, 2));
        } else {
            console.log('❌ No items found in catalog.');
            console.log(JSON.stringify(response.data, null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

testSearch();
