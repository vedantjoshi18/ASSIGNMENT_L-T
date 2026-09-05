const express = require('express');
const router = express.Router();
const { getOccupancyReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

// GET /api/admin/reports/occupancy - Admin only
router.get('/occupancy', auth, authorize('admin'), validate('reportQuery', 'query'), getOccupancyReport);

module.exports = router;
