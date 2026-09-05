const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Room type name is required'],
      trim: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    totalRooms: {
      type: Number,
      required: [true, 'Total rooms is required'],
      min: [1, 'Total rooms must be at least 1'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
roomTypeSchema.index({ hotelId: 1 });
roomTypeSchema.index({ hotelId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('RoomType', roomTypeSchema);
