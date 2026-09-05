const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      unique: true,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
  },
  {
    timestamps: true,
  }
);

// Index on name already created by unique: true on the schema field
hotelSchema.index({ city: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);
