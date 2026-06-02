const express = require('express');
const router = express.Router();
const {
    createProperty,
    getAllProperties,
    getPropertyById,
    searchAndFilterProperties,
} = require('../controllers/propertyController');

router.post('/', createProperty);

router.get('/', getAllProperties);

router.get('/search/filter', searchAndFilterProperties);

router.get('/:id', getPropertyById);

module.exports = router;
