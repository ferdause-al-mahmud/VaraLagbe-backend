const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

const chatSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        propertyId: {
            type: String,
            default: '',
            trim: true,
        },
        propertyTitle: {
            type: String,
            default: 'Property conversation',
            trim: true,
        },
        messages: {
            type: [messageSchema],
            default: [],
        },
        archivedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
        collection: 'chats',
    }
);

chatSchema.index({ participants: 1, propertyId: 1 });

module.exports = mongoose.model('Chat', chatSchema);
