const express = require('express');
const {
    getChat,
    getUserChats,
    markRead,
    sendMessage,
    startChat,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getUserChats);
router.post('/start', startChat);
router.get('/:id', getChat);
router.post('/:id/messages', sendMessage);
router.patch('/:id/read', markRead);

module.exports = router;
