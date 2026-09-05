const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const { getAvailableRooms } = require('../utils/availability');

/**
 * @desc    Create a new hotel
 * @route   POST /api/hotels
 * @access  Admin
 */
const createHotel = async (req, res, next) => {
  try {
    const { name, city, amenities, rating } = req.body;

    const hotel = await Hotel.create({ name, city, amenities, rating });

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all hotels
 * @route   GET /api/hotels
 * @access  Public (authenticated)
 */
const getHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find();

    res.status(200).json({
      success: true,
      message: 'Hotels retrieved successfully',
      data: hotels,
      count: hotels.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single hotel by ID
 * @route   GET /api/hotels/:id
 * @access  Public (authenticated)
 */
const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
        errorCode: 'HOTEL_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hotel retrieved successfully',
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a hotel
 * @route   PUT /api/hotels/:id
 * @access  Admin
 */
const updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
        errorCode: 'HOTEL_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a hotel
 * @route   DELETE /api/hotels/:id
 * @access  Admin
 */
const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
        errorCode: 'HOTEL_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully',
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createHotel, getHotels, getHotel, updateHotel, deleteHotel, searchAvailability };

/**
 * @desc    Search available rooms across hotels
 * @route   GET /api/hotels/search?checkIn=&checkOut=&guests=&hotelId=&city=
 * @access  Authenticated (all roles)
 */
async function searchAvailability(req, res, next) {
  try {
    const { hotelId, city, checkIn, checkOut, guests } = req.query;

    // Validate check-in is not in the past (allow today)
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

    // Build hotel filter
    const hotelFilter = {};
    if (hotelId) hotelFilter._id = hotelId;
    if (city) hotelFilter.city = new RegExp(city, 'i');

    const hotels = await Hotel.find(hotelFilter);

    if (hotels.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hotels found matching criteria',
        data: [],
        count: 0,
      });
    }

    const results = [];

    for (const hotel of hotels) {
      // Find room types with sufficient capacity
      const roomTypes = await RoomType.find({
        hotelId: hotel._id,
        capacity: { $gte: parseInt(guests) },
      });

      const availableRoomTypes = [];

      for (const roomType of roomTypes) {
        const availability = await getAvailableRooms(
          roomType._id,
          checkIn,
          checkOut
        );

        if (availability.availableCount > 0) {
          availableRoomTypes.push({
            roomTypeId: roomType._id,
            name: roomType.name,
            basePrice: roomType.basePrice,
            capacity: roomType.capacity,
            totalRooms: availability.totalRooms,
            maintenanceRooms: availability.maintenanceRooms,
            bookedRooms: availability.bookedRoomIds.length,
            availableRooms: availability.availableCount,
          });
        }
      }

      if (availableRoomTypes.length > 0) {
        results.push({
          hotelId: hotel._id,
          name: hotel.name,
          city: hotel.city,
          rating: hotel.rating,
          amenities: hotel.amenities,
          availableRoomTypes,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: results.length > 0
        ? 'Available rooms found'
        : 'No rooms available for the selected criteria',
      data: results,
      count: results.length,
    });
  } catch (error) {
    next(error);
  }
}
