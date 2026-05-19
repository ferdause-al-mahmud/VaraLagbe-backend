const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        bookingId: {
            type: String,
            required: true,
            unique: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        propertyId: {
            type: String,
            required: true,
        },
        propertyTitle: {
            type: String,
            required: true,
        },
        propertyImage: {
            type: String,
            default: null,
        },
        propertyType: {
            type: String,
            default: 'PREMIUM STAY',
        },
        hostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        hostName: {
            type: String,
            required: true,
        },
        hostAvatar: {
            type: String,
            default: null,
        },
        hostRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        hostReviews: {
            type: Number,
            default: 0,
        },
        checkInDate: {
            type: Date,
            required: true,
        },
        checkOutDate: {
            type: Date,
            required: true,
        },
        guests: {
            adults: {
                type: Number,
                required: true,
                default: 1,
            },
            children: {
                type: Number,
                required: true,
                default: 0,
            },
        },
        price: {
            totalAmount: {
                type: Number,
                required: true,
            },
            currency: {
                type: String,
                default: 'BDT',
            },
            nightlyRate: {
                type: Number,
                default: 0,
            },
            numberOfNights: {
                type: Number,
                default: 1,
            },
        },
        payment: {
            status: {
                type: String,
                enum: ['pending', 'completed', 'failed', 'refunded'],
                default: 'pending',
            },
            method: {
                type: String,
                default: 'Slotcommerz',
            },
            transactionId: {
                type: String,
                default: null,
            },
            paidAt: {
                type: Date,
                default: null,
            },
        },
        bookingStatus: {
            type: String,
            enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
            default: 'pending',
        },
        specialRequests: {
            type: String,
            default: '',
        },
        cancellation: {
            reason: {
                type: String,
                default: null,
            },
            cancelledAt: {
                type: Date,
                default: null,
            },
            refundAmount: {
                type: Number,
                default: null,
            },
        },
    },
    {
        timestamps: true,
        collection: 'bookings',
    }
);

module.exports = mongoose.model('Booking', bookingSchema);
