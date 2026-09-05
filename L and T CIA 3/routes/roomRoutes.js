const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
  updateHousekeeping,
} = require('../controllers/roomController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

// Staff + Admin routes
router.get('/', auth, authorize('staff', 'admin'), getRooms);
router.get('/:id', auth, authorize('staff', 'admin'), validate('paramId', 'params'), getRoom);

// Admin-only routes
router.post('/', auth, authorize('admin'), validate('createRoom'), createRoom);
router.put('/:id', auth, authorize('admin'), validate('paramId', 'params'), validate('updateRoom'), updateRoom);
router.delete('/:id', auth, authorize('admin'), validate('paramId', 'params'), deleteRoom);

// Staff + Admin housekeeping route
router.put('/:id/housekeeping', auth, authorize('staff', 'admin'), validate('paramId', 'params'), validate('updateHousekeeping'), updateHousekeeping);

module.exports = router;
