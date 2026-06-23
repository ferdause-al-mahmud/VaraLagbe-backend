const express = require('express');
const router = express.Router();
const {
    createBooking,
    getAllBookings,
    getBookingById,
    getUserBookings,
    getHostBookings,
    getPropertyBookings,
    updateBooking,
    cancelBooking,
    deleteBooking,
    getBookingStats,
    getPropertyAvailableDates,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllBookings);
router.get('/stats', getBookingStats);

// User specific routes
router.get('/user/:userId', getUserBookings);
router.get('/host/:hostId', getHostBookings);

// Property routes
router.get('/property/:propertyId', getPropertyBookings);
router.get('/property/:propertyId/available-dates', getPropertyAvailableDates);

// Update and delete routes
router.post('/', protect, createBooking);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.patch('/:id/cancel', cancelBooking);
router.delete('/:id', deleteBooking);

module.exports = router;
