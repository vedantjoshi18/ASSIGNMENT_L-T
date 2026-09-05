const PricingRule = require('../models/PricingRule');

/**
 * Calculate dynamic pricing for a stay.
 * 
 * Rules:
 * 1. Base price from roomType.
 * 2. For each night of stay:
 *    - Check for matching PricingRules for this roomTypeId where night falls between startDate and endDate.
 *    - Check for weekend (Friday & Saturday nights).
 *    - Apply the highest applicable multiplier.
 * 3. Calculate tax (18%).
 * 4. Return complete pricing breakdown.
 *
 * @param {Object} roomType - RoomType mongoose document
 * @param {Date|string} checkIn - Check-in date
 * @param {Date|string} checkOut - Check-out date
 * @returns {Object} Price calculation summary & nightly breakdown
 */
const calculatePricing = async (roomType, checkIn, checkOut) => {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  // Normalize dates to midnight UTC to accurately count nights
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(0, 0, 0, 0);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const nights = Math.round((endDate - startDate) / MS_PER_DAY);

  if (nights <= 0) {
    throw new Error('Check-out date must be after check-in date');
  }

  // Fetch all pricing rules for this room type
  const rules = await PricingRule.find({ roomTypeId: roomType._id });

  const nightlyBreakdown = [];
  let subtotal = 0;

  for (let i = 0; i < nights; i++) {
    const currentNight = new Date(startDate.getTime() + i * MS_PER_DAY);
    const dayOfWeek = currentNight.getUTCDay(); // 0 = Sun, 5 = Fri, 6 = Sat
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    let highestMultiplier = 1.0;
    let appliedRuleName = 'Standard Base Rate';

    // Find applicable rules for this date
    for (const rule of rules) {
      const ruleStart = new Date(rule.startDate);
      const ruleEnd = new Date(rule.endDate);
      ruleStart.setUTCHours(0, 0, 0, 0);
      ruleEnd.setUTCHours(23, 59, 59, 999);

      // Check if night falls within rule date range
      if (currentNight >= ruleStart && currentNight <= ruleEnd) {
        // If rule is specifically for weekend, check if it's weekend
        if (rule.season.toLowerCase().includes('weekend')) {
          if (isWeekend && rule.multiplier > highestMultiplier) {
            highestMultiplier = rule.multiplier;
            appliedRuleName = rule.season;
          }
        } else if (rule.multiplier > highestMultiplier) {
          // Regular seasonal rule
          highestMultiplier = rule.multiplier;
          appliedRuleName = rule.season;
        }
      }
    }

    const nightlyPrice = Math.round(roomType.basePrice * highestMultiplier);
    subtotal += nightlyPrice;

    nightlyBreakdown.push({
      date: currentNight.toISOString().split('T')[0],
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
      isWeekend,
      basePrice: roomType.basePrice,
      multiplier: highestMultiplier,
      appliedRule: appliedRuleName,
      price: nightlyPrice,
    });
  }

  const taxRate = 0.18; // 18% standard hotel GST
  const taxAmount = Math.round(subtotal * taxRate);
  const totalAmount = subtotal + taxAmount;

  return {
    nights,
    basePrice: roomType.basePrice,
    nightlyBreakdown,
    subtotal,
    taxRate,
    taxAmount,
    totalAmount,
  };
};

module.exports = { calculatePricing };
