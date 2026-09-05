/**
 * Cancellation Policy and Refund Engine.
 * 
 * Centralized Refund Policy:
 * - Greater than 48 hours prior to check-in: 100% refund
 * - 24 to 48 hours prior to check-in: 50% refund
 * - Less than 24 hours prior to check-in: 0% refund
 */

/**
 * Calculate refund amount based on cancellation timing relative to check-in.
 * 
 * @param {Object} booking - Mongoose Booking document
 * @param {Date} [cancellationDate=new Date()] - Time of cancellation
 * @returns {Object} { refundPercentage, refundAmount, hoursUntilCheckIn, cancellationDate }
 */
const calculateRefund = (booking, cancellationDate = new Date()) => {
  const checkInTime = new Date(booking.checkIn).getTime();
  const cancelTime = new Date(cancellationDate).getTime();

  // Difference in hours
  const hoursUntilCheckIn = (checkInTime - cancelTime) / (1000 * 60 * 60);

  let refundPercentage = 0;

  if (hoursUntilCheckIn > 48) {
    refundPercentage = 100;
  } else if (hoursUntilCheckIn >= 24) {
    refundPercentage = 50;
  } else {
    refundPercentage = 0;
  }

  const refundAmount = Math.round((booking.totalAmount * refundPercentage) / 100);

  return {
    hoursUntilCheckIn: Math.round(hoursUntilCheckIn * 10) / 10,
    refundPercentage,
    refundAmount,
    totalBookingAmount: booking.totalAmount,
    cancellationDate: new Date(cancelTime),
  };
};

module.exports = { calculateRefund };
