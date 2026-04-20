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

module.exports = {
    getAllProperties,
    getPropertyById,
};
