const express = require('express');
const router = express.Router();
const {
    getAllProperties,
    getPropertyById,
    searchAndFilterProperties,
} = require('../controllers/propertyController');

router.get('/', getAllProperties);

router.get('/search/filter', searchAndFilterProperties);

router.get('/:id', getPropertyById);

module.exports = router;
