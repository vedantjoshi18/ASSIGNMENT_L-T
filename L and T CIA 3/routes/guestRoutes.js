const express = require('express');
const router = express.Router();
const { getGuestBookings } = require('../controllers/guestController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// GET /api/guests/:id/bookings - Guest can view own history, Admin can view any
router.get('/:id/bookings', auth, validate('paramId', 'params'), getGuestBookings);

module.exports = router;
