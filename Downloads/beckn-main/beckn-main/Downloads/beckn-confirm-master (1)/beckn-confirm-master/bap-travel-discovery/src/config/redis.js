// Redis functionality commented out - not needed for development
// const redis = require('redis');
// const { promisify } = require('util');
// const env = require('./env');

// let redisClient = null;
// let getAsync = null;
// let setAsync = null;

// const initializeRedis = () => {
//     console.log('Redis is disabled for development. Using in-memory cache instead.');
    
    // Commented out Redis implementation
    // try {
    //     redisClient = redis.createClient({
    //         host: env.REDIS_HOST,
    //         port: env.REDIS_PORT,
    //         password: env.REDIS_PASSWORD,
    //     });

    //     redisClient.on('error', (err) => {
    //         console.error('Redis error: ', err);
    //         console.log('Continuing without Redis connection...');
    //     });

    //     redisClient.on('connect', () => {
    //         console.log('Redis connected successfully');
    //     });

    //     getAsync = promisify(redisClient.get).bind(redisClient);
    //     setAsync = promisify(redisClient.set).bind(redisClient);
    // } catch (error) {
    //     console.error('Redis initialization failed:', error);
    //     console.log('Continuing without Redis...');
    // }
// };

// module.exports = {
//     initializeRedis,
//     redisClient,
//     getAsync,
//     setAsync,
// };