const express = require('express');
const router = express.Router();
const { login, signUp } = require('../controllers/authController');

router.post('/login', login);
router.post('/signup', signUp);
router.post('/register', signUp);

module.exports = router;
