const Booking = require('../models/Booking');

/**
 * @desc    Get guest booking history (upcoming, past, cancelled)
 * @route   GET /api/guests/:id/bookings
 * @access  Authenticated (Guest Owner, Admin)
 */
const getGuestBookings = async (req, res, next) => {
  try {
    const guestId = req.params.id;

    // Strict ownership authorization: Guest A cannot access Guest B's history
    if (req.user.role === 'guest' && req.user._id.toString() !== guestId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You cannot view another guest's booking history",
        errorCode: 'FORBIDDEN',
      });
    }

    const bookings = await Booking.find({ guestId })
      .populate('hotelId', 'name city rating')
      .populate('roomTypeId', 'name basePrice capacity')
      .populate('roomId', 'roomNumber housekeepingStatus')
      .sort({ createdAt: -1 });

    const now = new Date();

    const upcoming = [];
    const past = [];
    const cancelled = [];

    bookings.forEach((booking) => {
      if (booking.status === 'CANCELLED') {
        cancelled.push(booking);
      } else if (booking.status === 'CHECKED_OUT' || new Date(booking.checkOut) < now) {
        past.push(booking);
      } else {
        // RESERVED, CONFIRMED, or active CHECKED_IN
        upcoming.push(booking);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Guest booking history retrieved successfully',
      data: {
        total: bookings.length,
        upcomingCount: upcoming.length,
        pastCount: past.length,
        cancelledCount: cancelled.length,
        upcoming,
        past,
        cancelled,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGuestBookings,
};
