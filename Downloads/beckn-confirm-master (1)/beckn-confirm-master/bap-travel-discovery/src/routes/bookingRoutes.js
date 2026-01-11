const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create a new booking
router.post('/', bookingController.createBooking);

// Get user's booking history
router.get('/user/:userId', bookingController.getUserBookings);

// Get booking by reference
router.get('/reference/:bookingReference', bookingController.getBookingByReference);

// Get bookings by email
router.get('/email/:email', bookingController.getBookingsByEmail);

// Update booking status
router.patch('/:bookingReference/status', bookingController.updateBookingStatus);

// Cancel booking
router.patch('/:bookingReference/cancel', bookingController.cancelBooking);

module.exports = router;
