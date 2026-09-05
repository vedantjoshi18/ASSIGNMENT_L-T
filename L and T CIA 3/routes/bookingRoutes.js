const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBooking,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  getBookingInvoice,
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

// Authenticated booking creation
router.post('/', auth, validate('createBooking'), createBooking);

// Invoice summary (Owner, Staff, Admin)
router.get('/:id/invoice', auth, validate('paramId', 'params'), getBookingInvoice);

// Authenticated booking lookup (ownership checked in controller)
router.get('/:id', auth, validate('paramId', 'params'), getBooking);

// Operational status transitions (Staff & Admin only)
router.put('/:id/confirm', auth, authorize('staff', 'admin'), validate('paramId', 'params'), confirmBooking);
router.put('/:id/checkin', auth, authorize('staff', 'admin'), validate('paramId', 'params'), checkInBooking);
router.put('/:id/checkout', auth, authorize('staff', 'admin'), validate('paramId', 'params'), checkOutBooking);

// Cancellation (Owner, Staff, Admin)
router.put('/:id/cancel', auth, validate('paramId', 'params'), cancelBooking);

module.exports = router;
