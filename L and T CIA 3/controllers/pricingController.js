const PricingRule = require('../models/PricingRule');
const RoomType = require('../models/RoomType');

/**
 * @desc    Create dynamic pricing rule
 * @route   POST /api/pricing-rules
 * @access  Admin
 */
const createPricingRule = async (req, res, next) => {
  try {
    const { roomTypeId, season, startDate, endDate, multiplier } = req.body;

    // Verify room type exists
    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found',
        errorCode: 'ROOM_TYPE_NOT_FOUND',
      });
    }

    const pricingRule = await PricingRule.create({
      roomTypeId,
      season,
      startDate,
      endDate,
      multiplier,
    });

    res.status(201).json({
      success: true,
      message: 'Pricing rule created successfully',
      data: pricingRule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pricing rules (optionally filter by roomTypeId)
 * @route   GET /api/pricing-rules?roomTypeId=xxx
 * @access  Staff, Admin
 */
const getPricingRules = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.roomTypeId) {
      filter.roomTypeId = req.query.roomTypeId;
    }

    const rules = await PricingRule.find(filter).populate({
      path: 'roomTypeId',
      select: 'name basePrice hotelId',
    });

    res.status(200).json({
      success: true,
      message: 'Pricing rules retrieved successfully',
      data: rules,
      count: rules.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single pricing rule by ID
 * @route   GET /api/pricing-rules/:id
 * @access  Staff, Admin
 */
const getPricingRule = async (req, res, next) => {
  try {
    const rule = await PricingRule.findById(req.params.id).populate({
      path: 'roomTypeId',
      select: 'name basePrice hotelId',
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Pricing rule not found',
        errorCode: 'PRICING_RULE_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pricing rule retrieved successfully',
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a pricing rule
 * @route   PUT /api/pricing-rules/:id
 * @access  Admin
 */
const updatePricingRule = async (req, res, next) => {
  try {
    const rule = await PricingRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Pricing rule not found',
        errorCode: 'PRICING_RULE_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pricing rule updated successfully',
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a pricing rule
 * @route   DELETE /api/pricing-rules/:id
 * @access  Admin
 */
const deletePricingRule = async (req, res, next) => {
  try {
    const rule = await PricingRule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Pricing rule not found',
        errorCode: 'PRICING_RULE_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pricing rule deleted successfully',
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPricingRule,
  getPricingRules,
  getPricingRule,
  updatePricingRule,
  deletePricingRule,
};
