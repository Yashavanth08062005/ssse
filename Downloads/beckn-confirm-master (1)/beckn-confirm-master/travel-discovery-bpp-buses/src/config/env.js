require('dotenv').config();

const envConfig = {
    PORT: process.env.PORT || 3004,

    // BPP Configuration
    BPP_ID: process.env.BPP_ID || 'buses-bpp.example.com',
    BPP_URI: process.env.BPP_URI || 'http://localhost:3004',
    BPP_PUBLIC_KEY: process.env.BPP_PUBLIC_KEY || '',
    BPP_PRIVATE_KEY: process.env.BPP_PRIVATE_KEY || '',

    // ONIX Configuration
    ONIX_URL: process.env.ONIX_URL || 'http://localhost:5000',
};

module.exports = envConfig;
