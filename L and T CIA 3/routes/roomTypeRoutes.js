const express = require('express');
const router = express.Router();
const {
  createRoomType,
  getRoomTypes,
  getRoomType,
  updateRoomType,
  deleteRoomType,
} = require('../controllers/roomTypeController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

// Authenticated routes (all roles)
router.get('/', auth, getRoomTypes);
router.get('/:id', auth, validate('paramId', 'params'), getRoomType);

// Admin-only routes
router.post('/', auth, authorize('admin'), validate('createRoomType'), createRoomType);
router.put('/:id', auth, authorize('admin'), validate('paramId', 'params'), validate('updateRoomType'), updateRoomType);
router.delete('/:id', auth, authorize('admin'), validate('paramId', 'params'), deleteRoomType);

module.exports = router;
