const express = require('express');
const router = express.Router();
const {
  createPricingRule,
  getPricingRules,
  getPricingRule,
  updatePricingRule,
  deletePricingRule,
} = require('../controllers/pricingController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

// Staff and Admin can view pricing rules
router.get('/', auth, authorize('staff', 'admin'), getPricingRules);
router.get('/:id', auth, authorize('staff', 'admin'), validate('paramId', 'params'), getPricingRule);

// Admin-only can manage pricing rules
router.post('/', auth, authorize('admin'), validate('createPricingRule'), createPricingRule);
router.put('/:id', auth, authorize('admin'), validate('paramId', 'params'), validate('updatePricingRule'), updatePricingRule);
router.delete('/:id', auth, authorize('admin'), validate('paramId', 'params'), deletePricingRule);

module.exports = router;
