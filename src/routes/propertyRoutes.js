const express = require('express');
const router = express.Router();
const {
    createProperty,
    getAllProperties,
    getPropertyById,
    searchAndFilterProperties,
    updateProperty,
} = require('../controllers/propertyController');

router.post('/', createProperty);

router.get('/', getAllProperties);

router.get('/search/filter', searchAndFilterProperties);

router.get('/:id', getPropertyById);

router.put('/:id', updateProperty);

module.exports = router;
