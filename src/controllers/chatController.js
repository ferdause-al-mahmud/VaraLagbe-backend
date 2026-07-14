const Chat = require('../models/Chat');
const Property = require('../models/Property');
const User = require('../models/User');

const userSelect = 'fullName email role avatar';

const getOtherParticipant = (chat, userId) =>
    chat.participants.find((participant) => String(participant._id) !== String(userId));

const formatChat = (chat, userId) => {
    const other = getOtherParticipant(chat, userId);
    const lastMessage = chat.messages[chat.messages.length - 1];
    const unreadCount = chat.messages.filter(
        (message) =>
            String(message.senderId?._id || message.senderId) !== String(userId) &&
            !message.readBy.some((readerId) => String(readerId) === String(userId))
    ).length;

    return {
        id: chat._id,
        propertyId: chat.propertyId,
        propertyTitle: chat.propertyTitle,
        participant: other
            ? {
                  id: other._id,
                  name: other.fullName,
                  role: other.role,
                  avatar: other.avatar,
              }
            : null,
        lastMessage: lastMessage?.text || 'No messages yet',
        lastMessageAt: lastMessage?.createdAt || chat.updatedAt,
        unreadCount,
        messages: chat.messages,
    };
};

const getUserChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({ participants: req.user._id })
            .populate('participants', userSelect)
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: chats.length,
            data: chats.map((chat) => formatChat(chat, req.user._id)),
        });
    } catch (error) {
        next(error);
    }
};

const startChat = async (req, res, next) => {
    try {
        const { participantId, propertyId, propertyTitle, message } = req.body;

        if (!participantId) {
            return res.status(400).json({ success: false, message: 'participantId is required' });
        }

        if (String(participantId) === String(req.user._id)) {
            return res.status(400).json({ success: false, message: 'You cannot message yourself' });
        }

        const participant = await User.findById(participantId);
        if (!participant) {
            return res.status(404).json({ success: false, message: 'Participant not found' });
        }

        let resolvedPropertyTitle = propertyTitle || 'Property conversation';
        if (propertyId && !propertyTitle) {
            const property = await Property.findById(propertyId);
            if (property) resolvedPropertyTitle = property.title;
        }

        const participants = [String(req.user._id), String(participantId)].sort();
        let chat = await Chat.findOne({
            participants: { $all: participants },
            propertyId: propertyId || '',
        });

        if (!chat) {
            chat = await Chat.create({
                participants,
                propertyId: propertyId || '',
                propertyTitle: resolvedPropertyTitle,
                messages: [],
            });
        }

        if (message?.trim()) {
            chat.messages.push({
                senderId: req.user._id,
                text: message.trim(),
                readBy: [req.user._id],
            });
            await chat.save();
        }

        const populated = await Chat.findById(chat._id).populate('participants', userSelect);

        res.status(200).json({
            success: true,
            data: formatChat(populated, req.user._id),
        });
    } catch (error) {
        next(error);
    }
};

const getChat = async (req, res, next) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.id,
            participants: req.user._id,
        }).populate('participants', userSelect);

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        res.status(200).json({
            success: true,
            data: formatChat(chat, req.user._id),
        });
    } catch (error) {
        next(error);
    }
};

const sendMessage = async (req, res, next) => {
    try {
        const { text } = req.body;

        if (!text?.trim()) {
            return res.status(400).json({ success: false, message: 'Message cannot be empty' });
        }

        const chat = await Chat.findOne({
            _id: req.params.id,
            participants: req.user._id,
        });

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        chat.messages.push({
            senderId: req.user._id,
            text: text.trim(),
            readBy: [req.user._id],
        });
        await chat.save();

        const populated = await Chat.findById(chat._id).populate('participants', userSelect);

        res.status(201).json({
            success: true,
            data: formatChat(populated, req.user._id),
        });
    } catch (error) {
        next(error);
    }
};

const markRead = async (req, res, next) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.id,
            participants: req.user._id,
        });

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        chat.messages.forEach((message) => {
            if (!message.readBy.some((readerId) => String(readerId) === String(req.user._id))) {
                message.readBy.push(req.user._id);
            }
        });
        await chat.save();

        const populated = await Chat.findById(chat._id).populate('participants', userSelect);

        res.status(200).json({
            success: true,
            data: formatChat(populated, req.user._id),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getChat,
    getUserChats,
    markRead,
    sendMessage,
    startChat,
};
