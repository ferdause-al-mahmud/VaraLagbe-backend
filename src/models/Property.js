const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            area: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
            },
            coordinates: {
                lat: Number,
                lng: Number,
            },
        },
        price: {
            monthly_rent: {
                type: Number,
                required: true,
            },
            currency: {
                type: String,
                default: 'BDT',
            },
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
        },
        reviews: {
            type: Number,
            default: 0,
        },
        availability: {
            type: String,
            enum: ['Available Now', 'Available', 'Available Soon', 'Unavailable'],
            default: 'Available',
        },
        verified: {
            type: Boolean,
            default: false,
        },
        specs: {
            bedrooms: Number,
            bathrooms: Number,
            area_sqft: Number,
            balconies: Number,
        },
        description: String,
        amenities: [String],
        host: {
            name: String,
            joined_since: Number,
            response_rate: Number,
            verified_host: Boolean,
            avatar: String,
        },
        images: [String],
    },
    {
        timestamps: true,
        collection: 'properties',
    }
);

module.exports = mongoose.model('Property', propertySchema);
