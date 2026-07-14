const express = require('express');
const router = express.Router();
const {
    createProperty,
    getAllProperties,
    getPropertyById,
    searchAndFilterProperties,
    updateProperty,
    deleteProperty,
    getFilterOptions,
} = require('../controllers/propertyController');

router.post('/', createProperty);

// Specific routes BEFORE generic :id route
router.get('/search/filter', searchAndFilterProperties);
router.get('/options', getFilterOptions);

// Generic routes AFTER specific routes
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);

router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

module.exports = router;

