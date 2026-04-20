const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        nidFile: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        agreedToTerms: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
        collection: 'users',
    }
);

module.exports = mongoose.model('User', userSchema);
