const Property = require('../models/Property');

const getAllProperties = async (req, res, next) => {
    try {
        const properties = await Property.find();
        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties,
        });
    } catch (error) {
        next(error);
    }
};

const getPropertyById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const property = await Property.findById(id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        res.status(200).json({
            success: true,
            data: property,
        });
    } catch (error) {
        next(error);
    }
};

const searchAndFilterProperties = async (req, res, next) => {
    try {
        const {
            search,
            minPrice,
            maxPrice,
            propertyType,
            amenities,
            location,
        } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'location.area': { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (minPrice || maxPrice) {
            filter['price.monthly_rent'] = {};
            if (minPrice) {
                filter['price.monthly_rent'].$gte = parseInt(minPrice);
            }
            if (maxPrice) {
                filter['price.monthly_rent'].$lte = parseInt(maxPrice);
            }
        }

        if (propertyType) {
            const types = Array.isArray(propertyType) ? propertyType : [propertyType];
            filter.property_type = { $in: types };
        }

        if (location) {
            const locations = Array.isArray(location) ? location : [location];
            filter['location.area'] = { $in: locations };
        }

        if (amenities) {
            const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
            filter.amenities = { $all: amenitiesArray };
        }

        const properties = await Property.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllProperties,
    getPropertyById,
    searchAndFilterProperties,
};
