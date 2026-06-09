const Property = require('../models/Property');
const crypto = require('crypto');

const createProperty = async (req, res, next) => {
    try {
        const {
            owner_id,
            property_type,
            title,
            description,
            location,
            price,
            specs,
            amenities,
            images,
        } = req.body;

        // Validate owner_id
        if (!owner_id) {
            return res.status(400).json({
                success: false,
                message: 'owner_id is required',
            });
        }

        // Validate required fields
        if (!property_type || !title || !location || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: property_type, title, location, price',
            });
        }

        // Validate location fields
        if (!location.area || !location.city) {
            return res.status(400).json({
                success: false,
                message: 'Location must include area and city',
            });
        }

        // Validate property_type enum
        const validTypes = ['Entire Flat', 'Private Room', 'Shared Seat', 'Sublet'];
        if (!validTypes.includes(property_type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid property type. Must be one of: ${validTypes.join(', ')}`,
            });
        }

        // Generate unique id
        const propertyId = `PROP_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

        const newProperty = new Property({
            id: propertyId,
            property_type,
            title,
            description: description || '',
            location: {
                area: location.area,
                city: location.city,
                country: location.country || 'Bangladesh',
                coordinates: location.coordinates,
            },
            price: {
                monthly_rent: parseInt(price),
                currency: 'BDT',
            },
            specs: {
                bedrooms: specs?.bedrooms || undefined,
                bathrooms: specs?.bathrooms || undefined,
                area_sqft: specs?.area_sqft || undefined,
                balconies: specs?.balconies || undefined,
            },
            amenities: amenities || [],
            images: images || [],
            owner_id,
            verified: false,
            availability: 'Available',
        });

        const savedProperty = await newProperty.save();

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            data: savedProperty,
        });
    } catch (error) {
        next(error);
    }
};

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

const updateProperty = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            property_type,
            title,
            description,
            location,
            price,
            specs,
            amenities,
            images,
            verified,
            availability,
        } = req.body;

        // Check if property exists
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        // Validate property_type if provided
        if (property_type) {
            const validTypes = ['Entire Flat', 'Private Room', 'Shared Seat', 'Sublet'];
            if (!validTypes.includes(property_type)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid property type. Must be one of: ${validTypes.join(', ')}`,
                });
            }
        }

        // Validate location if provided
        if (location) {
            if (!location.area || !location.city) {
                return res.status(400).json({
                    success: false,
                    message: 'Location must include area and city',
                });
            }
        }

        // Prepare update object
        const updateData = {};
        if (property_type) updateData.property_type = property_type;
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (location) {
            updateData.location = {
                area: location.area,
                city: location.city,
                country: location.country || property.location.country,
                coordinates: location.coordinates || property.location.coordinates,
            };
        }
        if (price) {
            updateData.price = {
                monthly_rent: parseInt(price),
                currency: 'BDT',
            };
        }
        if (specs) {
            updateData.specs = {
                bedrooms: specs.bedrooms !== undefined ? specs.bedrooms : property.specs.bedrooms,
                bathrooms: specs.bathrooms !== undefined ? specs.bathrooms : property.specs.bathrooms,
                area_sqft: specs.area_sqft !== undefined ? specs.area_sqft : property.specs.area_sqft,
                balconies: specs.balconies !== undefined ? specs.balconies : property.specs.balconies,
            };
        }
        if (amenities) updateData.amenities = amenities;
        if (images) updateData.images = images;
        if (verified !== undefined) updateData.verified = verified;
        if (availability) updateData.availability = availability;

        const updatedProperty = await Property.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            data: updatedProperty,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProperty,
    getAllProperties,
    getPropertyById,
    searchAndFilterProperties,
    updateProperty,
};
