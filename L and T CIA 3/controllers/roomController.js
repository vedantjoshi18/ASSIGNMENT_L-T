const Room = require('../models/Room');
const RoomType = require('../models/RoomType');

/**
 * @desc    Create a new physical room
 * @route   POST /api/rooms
 * @access  Admin
 */
const createRoom = async (req, res, next) => {
  try {
    const { roomTypeId, roomNumber, housekeepingStatus } = req.body;

    // Verify room type exists
    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found',
        errorCode: 'ROOM_TYPE_NOT_FOUND',
      });
    }

    // Check if adding this room would exceed totalRooms for this room type
    const existingRoomCount = await Room.countDocuments({ roomTypeId });
    if (existingRoomCount >= roomType.totalRooms) {
      return res.status(409).json({
        success: false,
        message: `Cannot add more rooms. Room type "${roomType.name}" allows a maximum of ${roomType.totalRooms} rooms (currently ${existingRoomCount})`,
        errorCode: 'ROOM_LIMIT_EXCEEDED',
      });
    }

    const room = await Room.create({
      roomTypeId,
      roomNumber,
      housekeepingStatus: housekeepingStatus || 'CLEAN',
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get rooms (optionally filter by roomTypeId)
 * @route   GET /api/rooms?roomTypeId=xxx
 * @access  Staff, Admin
 */
const getRooms = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.roomTypeId) {
      filter.roomTypeId = req.query.roomTypeId;
    }

    const rooms = await Room.find(filter).populate({
      path: 'roomTypeId',
      select: 'name basePrice capacity hotelId',
    });

    res.status(200).json({
      success: true,
      message: 'Rooms retrieved successfully',
      data: rooms,
      count: rooms.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single room by ID
 * @route   GET /api/rooms/:id
 * @access  Staff, Admin
 */
const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate({
      path: 'roomTypeId',
      select: 'name basePrice capacity hotelId',
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
        errorCode: 'ROOM_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room retrieved successfully',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a room
 * @route   PUT /api/rooms/:id
 * @access  Admin
 */
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
        errorCode: 'ROOM_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a room
 * @route   DELETE /api/rooms/:id
 * @access  Admin
 */
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
        errorCode: 'ROOM_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update housekeeping status of a room
 * @route   PUT /api/rooms/:id/housekeeping
 * @access  Staff, Admin
 */
const updateHousekeeping = async (req, res, next) => {
  try {
    const { housekeepingStatus } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
        errorCode: 'ROOM_NOT_FOUND',
      });
    }

    room.housekeepingStatus = housekeepingStatus;
    await room.save();

    res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} housekeeping status updated to ${housekeepingStatus}`,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRoom, getRooms, getRoom, updateRoom, deleteRoom, updateHousekeeping };
