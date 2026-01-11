const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    console.error('❌ Error Stack:', err.stack);
    
    logger.error('Unhandled error', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    const statusCode = err.status || err.statusCode || 500;
    const errorResponse = {
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;