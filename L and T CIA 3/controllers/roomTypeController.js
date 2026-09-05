const RoomType = require('../models/RoomType');
const Hotel = require('../models/Hotel');

/**
 * @desc    Create a new room type
 * @route   POST /api/room-types
 * @access  Admin
 */
const createRoomType = async (req, res, next) => {
  try {
    const { hotelId, name, basePrice, totalRooms, capacity } = req.body;

    // Verify hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
        errorCode: 'HOTEL_NOT_FOUND',
      });
    }

    const roomType = await RoomType.create({
      hotelId,
      name,
      basePrice,
      totalRooms,
      capacity,
    });

    res.status(201).json({
      success: true,
      message: 'Room type created successfully',
      data: roomType,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get room types (optionally filter by hotelId)
 * @route   GET /api/room-types?hotelId=xxx
 * @access  Public (authenticated)
 */
const getRoomTypes = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.hotelId) {
      filter.hotelId = req.query.hotelId;
    }

    const roomTypes = await RoomType.find(filter).populate('hotelId', 'name city');

    res.status(200).json({
      success: true,
      message: 'Room types retrieved successfully',
      data: roomTypes,
      count: roomTypes.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single room type by ID
 * @route   GET /api/room-types/:id
 * @access  Public (authenticated)
 */
const getRoomType = async (req, res, next) => {
  try {
    const roomType = await RoomType.findById(req.params.id).populate('hotelId', 'name city');

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found',
        errorCode: 'ROOM_TYPE_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room type retrieved successfully',
      data: roomType,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a room type
 * @route   PUT /api/room-types/:id
 * @access  Admin
 */
const updateRoomType = async (req, res, next) => {
  try {
    const roomType = await RoomType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found',
        errorCode: 'ROOM_TYPE_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room type updated successfully',
      data: roomType,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a room type
 * @route   DELETE /api/room-types/:id
 * @access  Admin
 */
const deleteRoomType = async (req, res, next) => {
  try {
    const roomType = await RoomType.findByIdAndDelete(req.params.id);

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found',
        errorCode: 'ROOM_TYPE_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room type deleted successfully',
      data: roomType,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRoomType, getRoomTypes, getRoomType, updateRoomType, deleteRoomType };
