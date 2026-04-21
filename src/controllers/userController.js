const bcrypt = require('bcryptjs');
const User = require('../models/User');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^01[0-9]{9}$/;

const formatUserResponse = (user) => ({
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    favorites: user.favorites,
    nidFile: user.nidFile,
    agreedToTerms: user.agreedToTerms,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

const getCurrentUser = async (req, res) => {
    return res.status(200).json({
        success: true,
        data: req.user,
    });
};

const updateCurrentUser = async (req, res, next) => {
    try {
        const { fullName, email, phone, address, favorites, nidFile } = req.body;
        const updates = {};

        if (fullName !== undefined) {
            if (!fullName.trim()) {
                return res.status(400).json({ message: 'Full name cannot be empty' });
            }
            updates.fullName = fullName.trim();
        }

        if (email !== undefined) {
            const normalizedEmail = email.toLowerCase().trim();

            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({ message: 'Please enter a valid email address' });
            }

            const existingEmail = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: req.user._id },
            });

            if (existingEmail) {
                return res.status(409).json({ message: 'An account with this email already exists' });
            }

            updates.email = normalizedEmail;
        }

        if (phone !== undefined) {
            const normalizedPhone = phone.trim();

            if (!phoneRegex.test(normalizedPhone)) {
                return res
                    .status(400)
                    .json({ message: 'Please enter a valid Bangladesh phone number' });
            }

            const existingPhone = await User.findOne({
                phone: normalizedPhone,
                _id: { $ne: req.user._id },
            });

            if (existingPhone) {
                return res
                    .status(409)
                    .json({ message: 'An account with this phone number already exists' });
            }

            updates.phone = normalizedPhone;
        }

        if (address !== undefined) {
            updates.address = address ? address.trim() : '';
        }

        if (favorites !== undefined) {
            if (!Array.isArray(favorites)) {
                return res.status(400).json({ message: 'Favorites must be an array' });
            }

            updates.favorites = favorites;
        }

        if (nidFile !== undefined) {
            updates.nidFile = nidFile || null;
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        }).select('-password');

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user,
        });
    } catch (error) {
        return next(error);
    }
};

const updateCurrentUserPassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All password fields are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const user = await User.findById(req.user._id);
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error) {
        return next(error);
    }
};

const deleteCurrentUser = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.user._id);

        return res.status(200).json({
            success: true,
            message: 'User account deleted successfully',
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    deleteCurrentUser,
    getCurrentUser,
    updateCurrentUser,
    updateCurrentUserPassword,
};
