const express = require('express');
const {
    getContent,
    getDashboard,
    getUsers,
    updateContent,
    updateUser,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    return next();
};

router.use(protect, requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.get('/content', getContent);
router.patch('/content/:id', updateContent);

module.exports = router;
