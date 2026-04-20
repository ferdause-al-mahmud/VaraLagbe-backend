const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^01[0-9]{9}$/;

const formatUserResponse = (user) => ({
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    nidFile: user.nidFile,
    agreedToTerms: user.agreedToTerms,
    createdAt: user.createdAt,
});

const signUp = async (req, res, next) => {
    try {
        const {
            fullName,
            email,
            phone,
            password,
            confirmPassword,
            agreed,
            nidFile,
        } = req.body;

        if (!fullName || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        if (!phoneRegex.test(phone)) {
            return res
                .status(400)
                .json({ message: 'Please enter a valid Bangladesh phone number' });
        }

        if (password.length < 8) {
            return res
                .status(400)
                .json({ message: 'Password must be at least 8 characters' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (!agreed) {
            return res
                .status(400)
                .json({ message: 'Please agree to the Terms and Conditions' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedPhone = phone.trim();

        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
        });

        if (existingUser) {
            return res.status(409).json({
                message:
                    existingUser.email === normalizedEmail
                        ? 'An account with this email already exists'
                        : 'An account with this phone number already exists',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            password: hashedPassword,
            nidFile: nidFile || null,
            agreedToTerms: true,
        });

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'varalagbe-dev-secret',
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            message: 'Account created successfully',
            token,
            user: formatUserResponse(user),
        });
    } catch (error) {
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0];
            const fieldLabel = duplicateField === 'phone' ? 'phone number' : 'email';

            return res.status(409).json({
                message: `An account with this ${fieldLabel} already exists`,
            });
        }

        return next(error);
    }
};

module.exports = {
    signUp,
};