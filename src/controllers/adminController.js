const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');

const getDisplayUser = (user) => ({
    id: user._id,
    name: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    nidVerificationStatus: user.nidVerificationStatus,
    nidFile: user.nidFile,
    avatar: user.avatar,
    createdAt: user.createdAt,
});

const getListingStatus = (property) => {
    if (property.moderationStatus === 'flagged') return 'FLAGGED';
    if (property.moderationStatus === 'removed') return 'REMOVED';
    if (property.verified || property.moderationStatus === 'live') return 'LIVE';
    return 'PENDING REVIEW';
};

const getDisplayListing = (property) => ({
    id: property._id,
    title: property.title,
    owner: property.host?.name || 'Property Host',
    ownerId: property.owner_id,
    note: property.moderationNote || (property.verified ? 'Live listing' : 'Submitted for admin review'),
    status: getListingStatus(property),
    image: property.images?.[0] || '',
    createdAt: property.createdAt,
});

const getDashboard = async (req, res, next) => {
    try {
        const [
            totalListings,
            activeUsers,
            pendingNid,
            pendingListings,
            flaggedListings,
            bookings,
            recentUsers,
            recentListings,
        ] = await Promise.all([
            Property.countDocuments({ moderationStatus: { $ne: 'removed' } }),
            User.countDocuments({ status: 'active' }),
            User.countDocuments({ nidVerificationStatus: 'pending' }),
            Property.countDocuments({ verified: false, moderationStatus: { $nin: ['flagged', 'removed'] } }),
            Property.countDocuments({ moderationStatus: 'flagged' }),
            Booking.find(),
            User.find({ nidVerificationStatus: 'pending' }).sort({ updatedAt: -1 }).limit(5),
            Property.find({ verified: false, moderationStatus: { $nin: ['flagged', 'removed'] } }).sort({ createdAt: -1 }).limit(5),
        ]);

        const totalRevenue = bookings.reduce((sum, booking) => {
            if (booking.payment?.status === 'completed') {
                return sum + (booking.price?.totalAmount || 0);
            }
            return sum;
        }, 0);

        const monthlyRevenue = Array.from({ length: 7 }, (_, index) => {
            const monthStart = new Date();
            monthStart.setMonth(monthStart.getMonth() - (6 - index), 1);
            monthStart.setHours(0, 0, 0, 0);

            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);

            const value = bookings.reduce((sum, booking) => {
                const paidAt = booking.payment?.paidAt || booking.createdAt;
                if (
                    booking.payment?.status === 'completed' &&
                    paidAt >= monthStart &&
                    paidAt < monthEnd
                ) {
                    return sum + (booking.price?.totalAmount || 0);
                }
                return sum;
            }, 0);

            return {
                label: monthStart.toLocaleString('en-US', { month: 'short' }),
                value,
            };
        });

        res.status(200).json({
            success: true,
            data: {
                totalListings,
                activeUsers,
                pendingNid,
                pendingListings,
                flaggedListings,
                totalBookings: bookings.length,
                totalRevenue,
                monthlyRevenue,
                verificationQueue: [
                    ...recentUsers.map((user) => ({
                        id: user._id,
                        name: user.fullName,
                        detail: 'NID verification requested',
                        type: 'user',
                        avatar: user.avatar,
                    })),
                    ...recentListings.map((listing) => ({
                        id: listing._id,
                        name: listing.title,
                        detail: 'Listing review pending',
                        type: 'listing',
                        avatar: listing.images?.[0] || '',
                    })),
                ].slice(0, 5),
            },
        });
    } catch (error) {
        next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        const filter = search
            ? {
                  $or: [
                      { fullName: { $regex: search, $options: 'i' } },
                      { email: { $regex: search, $options: 'i' } },
                      { phone: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users.map(getDisplayUser),
        });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { status, nidVerificationStatus } = req.body;
        const updates = {};

        if (status) updates.status = status;
        if (nidVerificationStatus) updates.nidVerificationStatus = nidVerificationStatus;

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        }).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: getDisplayUser(user),
        });
    } catch (error) {
        next(error);
    }
};

const getContent = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        const status = req.query.status || 'all';
        const filter = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'host.name': { $regex: search, $options: 'i' } },
                { moderationNote: { $regex: search, $options: 'i' } },
            ];
        }

        if (status === 'live') {
            filter.$or = [{ verified: true }, { moderationStatus: 'live' }];
        }
        if (status === 'pending') {
            filter.verified = false;
            filter.moderationStatus = { $nin: ['flagged', 'removed'] };
        }
        if (status === 'flagged') filter.moderationStatus = 'flagged';

        const listings = await Property.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: listings.length,
            data: listings.map(getDisplayListing),
        });
    } catch (error) {
        next(error);
    }
};

const updateContent = async (req, res, next) => {
    try {
        const { action, note } = req.body;
        const updates = {};

        if (action === 'approve') {
            updates.verified = true;
            updates.moderationStatus = 'live';
            updates.moderationNote = note || 'Approved by admin';
        } else if (action === 'flag') {
            updates.verified = false;
            updates.moderationStatus = 'flagged';
            updates.moderationNote = note || 'Flagged by admin';
        } else if (action === 'remove') {
            updates.verified = false;
            updates.moderationStatus = 'removed';
            updates.availability = 'Unavailable';
            updates.moderationNote = note || 'Removed by admin';
        } else {
            return res.status(400).json({ success: false, message: 'Invalid moderation action' });
        }

        const listing = await Property.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        });

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Listing updated successfully',
            data: getDisplayListing(listing),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getContent,
    getDashboard,
    getUsers,
    updateContent,
    updateUser,
};
