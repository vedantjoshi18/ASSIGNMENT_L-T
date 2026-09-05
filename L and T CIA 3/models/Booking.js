const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Guest ID is required'],
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel ID is required'],
    },
    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: [true, 'Room type ID is required'],
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least 1 guest is required'],
    },
    status: {
      type: String,
      enum: ['RESERVED', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'],
      default: 'RESERVED',
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    nights: {
      type: Number,
      required: [true, 'Number of nights is required'],
      min: [1, 'Minimum 1 night stay'],
    },
    taxAmount: {
      type: Number,
      required: [true, 'Tax amount is required'],
    },
    actualCheckIn: {
      type: Date,
      default: null,
    },
    actualCheckOut: {
      type: Date,
      default: null,
    },
    cancellationDate: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ guestId: 1 });
bookingSchema.index({ hotelId: 1, roomId: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
