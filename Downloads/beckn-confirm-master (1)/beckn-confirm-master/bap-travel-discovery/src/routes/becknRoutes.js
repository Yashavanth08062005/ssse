const express = require('express');
const router = express.Router();
const becknController = require('../controllers/becknController');

// Async wrapper to handle async errors
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Health check route
router.get('/health', asyncHandler(becknController.health));

// Beckn protocol routes
router.post('/search', asyncHandler(becknController.search));
router.post('/select', asyncHandler(becknController.select));
router.post('/init', asyncHandler(becknController.init));
router.post('/confirm', asyncHandler(becknController.confirm));
router.post('/status', asyncHandler(becknController.status));
router.post('/cancel', asyncHandler(becknController.cancel));
router.post('/update', asyncHandler(becknController.update));

// Post-fulfillment routes
router.post('/support', asyncHandler(becknController.support));
router.post('/rating', asyncHandler(becknController.rating));

module.exports = router;
