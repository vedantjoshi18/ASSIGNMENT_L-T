const Booking = require('../models/Booking');
const Room = require('../models/Room');

/**
 * Active booking statuses that block availability.
 * CANCELLED and CHECKED_OUT bookings do NOT block rooms.
 */
const ACTIVE_BOOKING_STATUSES = ['RESERVED', 'CONFIRMED', 'CHECKED_IN'];

/**
 * Find all available rooms for a given room type within a date range.
 *
 * Logic:
 * 1. Get all physical rooms for the room type that are NOT in MAINTENANCE.
 * 2. Find all active bookings for those rooms that overlap the requested dates.
 * 3. Subtract booked rooms from the total to get available rooms.
 *
 * Date overlap condition:
 *   existingCheckIn < requestedCheckOut AND existingCheckOut > requestedCheckIn
 *
 * @param {string} roomTypeId - The room type to check
 * @param {Date} checkIn - Requested check-in date
 * @param {Date} checkOut - Requested check-out date
 * @returns {Object} { totalRooms, maintenanceRooms, bookedRoomIds, availableRooms, availableCount }
 */
const getAvailableRooms = async (roomTypeId, checkIn, checkOut) => {
  // Step 1: Get all non-MAINTENANCE rooms for this room type
  const allRooms = await Room.find({ roomTypeId });
  const availablePhysicalRooms = allRooms.filter(
    (room) => room.housekeepingStatus !== 'MAINTENANCE'
  );
  const maintenanceCount = allRooms.length - availablePhysicalRooms.length;

  if (availablePhysicalRooms.length === 0) {
    return {
      totalRooms: allRooms.length,
      maintenanceRooms: maintenanceCount,
      bookedRoomIds: [],
      availableRooms: [],
      availableCount: 0,
    };
  }

  const roomIds = availablePhysicalRooms.map((r) => r._id);

  // Step 2: Find all active bookings that overlap the requested date range
  const overlappingBookings = await Booking.find({
    roomId: { $in: roomIds },
    status: { $in: ACTIVE_BOOKING_STATUSES },
    checkIn: { $lt: new Date(checkOut) },   // existing check-in is before requested check-out
    checkOut: { $gt: new Date(checkIn) },    // existing check-out is after requested check-in
  });

  // Step 3: Collect booked room IDs (unique)
  const bookedRoomIdSet = new Set(
    overlappingBookings.map((b) => b.roomId.toString())
  );

  // Step 4: Filter out booked rooms
  const availableRooms = availablePhysicalRooms.filter(
    (room) => !bookedRoomIdSet.has(room._id.toString())
  );

  return {
    totalRooms: allRooms.length,
    maintenanceRooms: maintenanceCount,
    bookedRoomIds: Array.from(bookedRoomIdSet),
    availableRooms,
    availableCount: availableRooms.length,
  };
};

/**
 * Find the first available room for a room type within a date range.
 * Used during booking creation to assign a specific room.
 *
 * @param {string} roomTypeId - The room type
 * @param {Date} checkIn - Check-in date
 * @param {Date} checkOut - Check-out date
 * @returns {Object|null} Available room document or null
 */
const findAvailableRoom = async (roomTypeId, checkIn, checkOut) => {
  const result = await getAvailableRooms(roomTypeId, checkIn, checkOut);
  return result.availableRooms.length > 0 ? result.availableRooms[0] : null;
};

module.exports = { getAvailableRooms, findAvailableRoom, ACTIVE_BOOKING_STATUSES };
