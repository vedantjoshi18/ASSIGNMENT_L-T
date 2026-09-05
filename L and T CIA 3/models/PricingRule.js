const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema(
  {
    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: [true, 'Room type ID is required'],
    },
    season: {
      type: String,
      required: [true, 'Season name is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    multiplier: {
      type: Number,
      required: [true, 'Multiplier is required'],
      min: [0.1, 'Multiplier must be at least 0.1'],
    },
  },
  {
    timestamps: true,
  }
);

// Index
pricingRuleSchema.index({ roomTypeId: 1 });

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
