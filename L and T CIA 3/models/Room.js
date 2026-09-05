const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: [true, 'Room type ID is required'],
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    housekeepingStatus: {
      type: String,
      enum: ['CLEAN', 'DIRTY', 'MAINTENANCE'],
      default: 'CLEAN',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
roomSchema.index({ roomTypeId: 1 });
roomSchema.index({ roomTypeId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
