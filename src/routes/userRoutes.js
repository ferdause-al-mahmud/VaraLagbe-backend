const express = require('express');
const router = express.Router();
const {
    deleteCurrentUser,
    getCurrentUser,
    updateCurrentUser,
    updateCurrentUserPassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/me', getCurrentUser);
router.patch('/me', updateCurrentUser);
router.patch('/me/password', updateCurrentUserPassword);
router.delete('/me', deleteCurrentUser);

module.exports = router;
