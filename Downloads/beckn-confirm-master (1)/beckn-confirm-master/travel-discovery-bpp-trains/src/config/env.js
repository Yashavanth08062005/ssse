require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3005,
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || '2005',
    DB_NAME: process.env.DB_NAME || 'trains_bpp',
    DB_PORT: process.env.DB_PORT || 5432,
    BPP_ID: process.env.BPP_ID || 'trains-bpp.example.com',
    BPP_URI: process.env.BPP_URI || 'http://localhost:3005',
    BAP_URI: process.env.BAP_URI || 'http://localhost:8081',
    GATEWAY_URL: process.env.GATEWAY_URL || 'http://localhost:5000'
};
