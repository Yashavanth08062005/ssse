const express = require('express');
const router = express.Router();
const becknController = require('../controllers/becknController');

// Discovery
router.post('/search', becknController.search);

// Transaction
router.post('/select', becknController.select);
router.post('/init', becknController.init);
router.post('/confirm', becknController.confirm);

// Post-transaction
router.post('/status', becknController.status);

module.exports = router;
