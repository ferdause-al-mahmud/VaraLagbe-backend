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
    address: user.address,
    favorites: user.favorites,
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
            address: '',
            favorites: [],
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

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'varalagbe-dev-secret',
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: formatUserResponse(user),
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    login,
    signUp,
};
