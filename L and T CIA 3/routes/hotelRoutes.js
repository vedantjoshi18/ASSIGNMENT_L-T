const express = require('express');
const router = express.Router();
const {
  createHotel,
  getHotels,
  getHotel,
  updateHotel,
  deleteHotel,
  searchAvailability,
} = require('../controllers/hotelController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

// Search route (must be before /:id to avoid treating "search" as an ID)
router.get('/search', auth, validate('searchAvailability', 'query'), searchAvailability);

// Public (authenticated) routes
router.get('/', auth, getHotels);
router.get('/:id', auth, validate('paramId', 'params'), getHotel);

// Admin-only routes
router.post('/', auth, authorize('admin'), validate('createHotel'), createHotel);
router.put('/:id', auth, authorize('admin'), validate('paramId', 'params'), validate('updateHotel'), updateHotel);
router.delete('/:id', auth, authorize('admin'), validate('paramId', 'params'), deleteHotel);

module.exports = router;
