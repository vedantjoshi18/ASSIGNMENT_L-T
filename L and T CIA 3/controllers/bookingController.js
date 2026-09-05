const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const { findAvailableRoom } = require('../utils/availability');
const { calculatePricing } = require('../utils/pricing');
const { isValidStatusTransition } = require('../utils/bookingStatus');
const { calculateRefund } = require('../utils/cancellation');
const { generateInvoice } = require('../utils/invoice');

/**
 * @desc    Create a new reservation booking
 * @route   POST /api/bookings
 * @access  Authenticated (Guest, Admin)
 */
const createBooking = async (req, res, next) => {
  try {
    const { hotelId, roomTypeId, checkIn, checkOut, guests } = req.body;
    const guestId = req.user._id;

    // 1. Validate check-in date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(checkIn);
    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past',
        errorCode: 'INVALID_DATE',
      });
    }

    // 2. Validate Hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
        errorCode: 'HOTEL_NOT_FOUND',
      });
    }

    // 3. Validate RoomType exists and belongs to this hotel
    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType || roomType.hotelId.toString() !== hotelId) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found for this hotel',
        errorCode: 'ROOM_TYPE_NOT_FOUND',
      });
    }

    // 4. Validate Capacity
    if (guests > roomType.capacity) {
      return res.status(400).json({
        success: false,
        message: `Requested guests (${guests}) exceeds room capacity of ${roomType.capacity}`,
        errorCode: 'CAPACITY_EXCEEDED',
      });
    }

    // 5. Check availability and find available physical room
    const availableRoom = await findAvailableRoom(roomTypeId, checkIn, checkOut);
    if (!availableRoom) {
      return res.status(409).json({
        success: false,
        message: 'No available rooms found for the selected dates and room type',
        errorCode: 'ROOM_UNAVAILABLE',
      });
    }

    // 6. Calculate dynamic pricing & taxes
    const pricing = await calculatePricing(roomType, checkIn, checkOut);

    // 7. Create booking with status RESERVED and assigned roomId
    const booking = await Booking.create({
      guestId,
      hotelId,
      roomTypeId,
      roomId: availableRoom._id,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests,
      status: 'RESERVED',
      totalAmount: pricing.totalAmount,
      nights: pricing.nights,
      taxAmount: pricing.taxAmount,
    });

    // Populate references for clean response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('hotelId', 'name city rating')
      .populate('roomTypeId', 'name basePrice capacity')
      .populate('roomId', 'roomNumber housekeepingStatus')
      .populate('guestId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Booking reserved successfully',
      data: {
        booking: populatedBooking,
        pricingSummary: pricing,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get booking details by ID
 * @route   GET /api/bookings/:id
 * @access  Authenticated (Owner, Staff, Admin)
 */
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotelId', 'name city rating')
      .populate('roomTypeId', 'name basePrice capacity')
      .populate('roomId', 'roomNumber housekeepingStatus')
      .populate('guestId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        errorCode: 'BOOKING_NOT_FOUND',
      });
    }

    // Authorization: Guest can only view their own booking
    if (req.user.role === 'guest' && booking.guestId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own bookings',
        errorCode: 'FORBIDDEN',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm a reserved booking
 * @route   PUT /api/bookings/:id/confirm
 * @access  Staff, Admin
 */
const confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        errorCode: 'BOOKING_NOT_FOUND',
      });
    }

    if (!isValidStatusTransition(booking.status, 'CONFIRMED')) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition booking from '${booking.status}' to 'CONFIRMED'`,
        errorCode: 'INVALID_STATUS_TRANSITION',
      });
    }

    booking.status = 'CONFIRMED';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check-in guest
 * @route   PUT /api/bookings/:id/checkin
 * @access  Staff, Admin
 */
const checkInBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        errorCode: 'BOOKING_NOT_FOUND',
      });
    }

    if (!isValidStatusTransition(booking.status, 'CHECKED_IN')) {
      return res.status(400).json({
        success: false,
        message: `Cannot check in booking with status '${booking.status}'. Booking must be CONFIRMED before check-in`,
        errorCode: 'INVALID_STATUS_TRANSITION',
      });
    }

    booking.status = 'CHECKED_IN';
    booking.actualCheckIn = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Guest checked in successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check-out guest and mark room DIRTY
 * @route   PUT /api/bookings/:id/checkout
 * @access  Staff, Admin
 */
const checkOutBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        errorCode: 'BOOKING_NOT_FOUND',
      });
    }

    if (!isValidStatusTransition(booking.status, 'CHECKED_OUT')) {
      return res.status(400).json({
        success: false,
        message: `Cannot check out booking with status '${booking.status}'. Booking must be CHECKED_IN before check-out`,
        errorCode: 'INVALID_STATUS_TRANSITION',
      });
    }

    booking.status = 'CHECKED_OUT';
    booking.actualCheckOut = new Date();
    await booking.save();

    // Trigger housekeeping workflow: Room becomes DIRTY
    const room = await Room.findById(booking.roomId);
    if (room) {
      room.housekeepingStatus = 'DIRTY';
      await room.save();
    }

    res.status(200).json({
      success: true,
      message: 'Guest checked out successfully. Room marked as DIRTY for housekeeping',
      data: {
        booking,
        room: room ? { _id: room._id, roomNumber: room.roomNumber, housekeepingStatus: room.housekeepingStatus } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking and calculate refund
 * @route   PUT /api/bookings/:id/cancel
 * @access  Authenticated (Booking Owner, Staff, Admin)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        errorCode: 'BOOKING_NOT_FOUND',
      });
    }

    // Ownership check: Guest can only cancel their own booking
    if (req.user.role === 'guest' && booking.guestId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own bookings',
        errorCode: 'FORBIDDEN',
      });
    }

    // Status validation: Can only cancel if RESERVED or CONFIRMED
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
        errorCode: 'ALREADY_CANCELLED',
      });
    }

    if (booking.status !== 'RESERVED' && booking.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status '${booking.status}'. Only RESERVED or CONFIRMED bookings can be cancelled`,
        errorCode: 'INVALID_CANCELLATION',
      });
    }

    // Calculate refund
    const refund = calculateRefund(booking);

    // Update booking
    booking.status = 'CANCELLED';
    booking.cancellationDate = refund.cancellationDate;
    booking.refundAmount = refund.refundAmount;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking,
        refundSummary: refund,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get booking invoice summary
 * @route   GET /api/bookings/:id/invoice
 * @access  Authenticated (Booking Owner, Staff, Admin)
 */
const getBookingInvoice = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotelId', 'name city rating')
      .populate('roomTypeId', 'name basePrice capacity')
      .populate('roomId', 'roomNumber housekeepingStatus')
      .populate('guestId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        errorCode: 'BOOKING_NOT_FOUND',
      });
    }

    // Ownership check: Guest can only view their own invoice
    if (req.user.role === 'guest' && booking.guestId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own invoice',
        errorCode: 'FORBIDDEN',
      });
    }

    const invoice = generateInvoice(booking);

    res.status(200).json({
      success: true,
      message: 'Invoice generated successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBooking,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  getBookingInvoice,
};
