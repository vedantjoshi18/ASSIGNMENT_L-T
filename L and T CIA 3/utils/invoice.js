/**
 * Invoice Generation Summary Service.
 * Formats full financial and booking details into a structured invoice JSON response.
 */

/**
 * Generate invoice summary for a booking.
 * 
 * @param {Object} booking - Populated Booking document
 * @returns {Object} Structured invoice document
 */
const generateInvoice = (booking) => {
  const invoiceNumber = `INV-${booking._id.toString().slice(-6).toUpperCase()}-${new Date().getFullYear()}`;
  const subtotal = booking.totalAmount - booking.taxAmount;
  const avgNightlyRate = booking.nights > 0 ? Math.round(subtotal / booking.nights) : subtotal;

  const invoice = {
    invoiceNumber,
    invoiceDate: new Date().toISOString(),
    status: booking.status === 'CANCELLED' ? 'CANCELLED / REFUNDED' : 'PAID',
    bookingReference: booking._id,
    hotel: {
      id: booking.hotelId?._id || booking.hotelId,
      name: booking.hotelId?.name || 'N/A',
      city: booking.hotelId?.city || 'N/A',
      rating: booking.hotelId?.rating || 'N/A',
    },
    guest: {
      id: booking.guestId?._id || booking.guestId,
      name: booking.guestId?.name || 'N/A',
      email: booking.guestId?.email || 'N/A',
    },
    stayDetails: {
      roomType: booking.roomTypeId?.name || 'N/A',
      roomNumber: booking.roomId?.roomNumber || 'N/A',
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      guests: booking.guests,
      actualCheckIn: booking.actualCheckIn,
      actualCheckOut: booking.actualCheckOut,
    },
    pricingSummary: {
      baseNightlyRate: booking.roomTypeId?.basePrice || avgNightlyRate,
      nights: booking.nights,
      subtotal,
      taxRate: '18%',
      taxAmount: booking.taxAmount,
      totalAmount: booking.totalAmount,
      refundAmount: booking.refundAmount || 0,
      netPaid: booking.status === 'CANCELLED'
        ? booking.totalAmount - (booking.refundAmount || 0)
        : booking.totalAmount,
    },
  };

  return invoice;
};

module.exports = { generateInvoice };
