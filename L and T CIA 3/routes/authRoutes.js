const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validate } = require('../middleware/validate');

// POST /api/auth/register — Register a new user
router.post('/register', validate('register'), register);

// POST /api/auth/login — Login user
router.post('/login', validate('login'), login);

module.exports = router;
