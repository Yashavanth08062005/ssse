const express = require('express');
const router = express.Router();
const becknController = require('../controllers/becknController');

// Standard Beckn routes
router.post('/search', becknController.search);
router.post('/select', becknController.select);
router.post('/init', becknController.init);
router.post('/confirm', becknController.confirm);
router.post('/status', becknController.status);
router.post('/track', becknController.track);
router.post('/cancel', becknController.cancel);
router.post('/update', becknController.update);

module.exports = router;
