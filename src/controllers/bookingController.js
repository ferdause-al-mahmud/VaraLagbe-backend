const Booking = require('../models/Booking');
const User = require('../models/User');

// Generate unique booking ID
const generateBookingId = () => {
    return 'BK' + Date.now() + Math.floor(Math.random() * 1000);
};

// Create a new booking
exports.createBooking = async (req, res, next) => {
    try {
        const {
            propertyId,
            propertyTitle,
            propertyImage,
            propertyType,
            hostId,
            hostName,
            hostAvatar,
            hostRating,
            hostReviews,
            checkInDate,
            checkOutDate,
            guests,
            price,
            specialRequests,
        } = req.body;

        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: 'Please log in to create a booking',
            });
        }

        // Validate required fields
        if (!propertyId || !hostId || !propertyTitle || !checkInDate || !checkOutDate || !guests || !price) {
            return res.status(400).json({
                success: false,
                message: 'Missing required booking fields',
            });
        }

        if (!guests.adults || guests.adults < 1) {
            return res.status(400).json({
                success: false,
                message: 'At least one adult guest is required',
            });
        }

        if (!price.totalAmount || price.totalAmount < 1) {
            return res.status(400).json({
                success: false,
                message: 'A valid booking amount is required',
            });
        }

        // Validate dates
        if (new Date(checkInDate) >= new Date(checkOutDate)) {
            return res.status(400).json({
                success: false,
                message: 'Check-out date must be after check-in date',
            });
        }

        const booking = await Booking.create({
            bookingId: generateBookingId(),
            userId: req.user._id,
            propertyId,
            propertyTitle,
            propertyImage,
            propertyType,
            hostId,
            hostName,
            hostAvatar,
            hostRating,
            hostReviews,
            checkInDate,
            checkOutDate,
            guests,
            price,
            specialRequests,
            bookingStatus: 'confirmed',
            payment: {
                status: 'completed',
                paidAt: new Date(),
            },
        });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

// Get all bookings
exports.getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'fullName email phone')
            .populate('hostId', 'fullName email');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

// Get booking by ID
exports.getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'fullName email phone')
            .populate('hostId', 'fullName email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

// Get user bookings
exports.getUserBookings = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        const bookings = await Booking.find({ userId })
            .populate('hostId', 'fullName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

// Get host bookings
exports.getHostBookings = async (req, res, next) => {
    try {
        const hostId = req.params.hostId;

        const bookings = await Booking.find({ hostId })
            .populate('userId', 'fullName email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

// Get bookings by property
exports.getPropertyBookings = async (req, res, next) => {
    try {
        const propertyId = req.params.propertyId;

        const bookings = await Booking.find({ propertyId })
            .populate('userId', 'fullName email')
            .populate('hostId', 'fullName email')
            .sort({ checkInDate: 1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

// Update booking
exports.updateBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            checkInDate,
            checkOutDate,
            guests,
            specialRequests,
            bookingStatus,
        } = req.body;

        // Validate dates if provided
        if (checkInDate && checkOutDate) {
            if (new Date(checkInDate) >= new Date(checkOutDate)) {
                return res.status(400).json({
                    success: false,
                    message: 'Check-out date must be after check-in date',
                });
            }
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            {
                ...(checkInDate && { checkInDate }),
                ...(checkOutDate && { checkOutDate }),
                ...(guests && { guests }),
                ...(specialRequests && { specialRequests }),
                ...(bookingStatus && { bookingStatus }),
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason, refundAmount } = req.body;

        const booking = await Booking.findByIdAndUpdate(
            id,
            {
                bookingStatus: 'cancelled',
                'cancellation.reason': reason,
                'cancellation.cancelledAt': new Date(),
                'cancellation.refundAmount': refundAmount,
                'payment.status': 'refunded',
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

// Delete booking
exports.deleteBooking = async (req, res, next) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully',
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

// Get booking statistics
exports.getBookingStats = async (req, res, next) => {
    try {
        const stats = await Booking.aggregate([
            {
                $group: {
                    _id: '$bookingStatus',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$price.totalAmount' },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

// Get available dates for a property
exports.getPropertyAvailableDates = async (req, res, next) => {
    try {
        const { propertyId } = req.params;

        const bookings = await Booking.find({
            propertyId,
            bookingStatus: { $in: ['confirmed', 'checked-in'] },
        });

        const bookedDates = [];
        bookings.forEach((booking) => {
            const currentDate = new Date(booking.checkInDate);
            while (currentDate < new Date(booking.checkOutDate)) {
                bookedDates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });

        res.status(200).json({
            success: true,
            data: {
                propertyId,
                bookedDates,
                totalBookings: bookings.length,
            },
        });
    } catch (error) {
        next(error);
    }
};
