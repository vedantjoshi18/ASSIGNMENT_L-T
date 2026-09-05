const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

/**
 * @desc    Get admin occupancy and revenue report
 * @route   GET /api/admin/reports/occupancy?hotelId=xxx
 * @access  Admin only
 */
const getOccupancyReport = async (req, res, next) => {
  try {
    const { hotelId } = req.query;

    const matchHotel = {};
    if (hotelId) {
      matchHotel._id = new mongoose.Types.ObjectId(hotelId);
    }

    // 1. Fetch relevant hotels
    const hotels = await Hotel.find(matchHotel);
    if (hotels.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hotels found for report',
        data: {
          systemSummary: {
            totalHotels: 0,
            totalRooms: 0,
            totalOccupiedRooms: 0,
            overallOccupancyRate: '0.0%',
            totalBookings: 0,
            totalGrossRevenue: 0,
            totalRefunds: 0,
            totalNetRevenue: 0,
          },
          properties: [],
        },
      });
    }

    // 2. Aggregate Booking statistics per hotel
    const bookingMatch = {};
    if (hotelId) {
      bookingMatch.hotelId = new mongoose.Types.ObjectId(hotelId);
    }

    const bookingStats = await Booking.aggregate([
      ...(Object.keys(bookingMatch).length ? [{ $match: bookingMatch }] : []),
      {
        $group: {
          _id: '$hotelId',
          totalBookings: { $sum: 1 },
          reserved: {
            $sum: { $cond: [{ $eq: ['$status', 'RESERVED'] }, 1, 0] },
          },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$status', 'CONFIRMED'] }, 1, 0] },
          },
          checkedIn: {
            $sum: { $cond: [{ $eq: ['$status', 'CHECKED_IN'] }, 1, 0] },
          },
          checkedOut: {
            $sum: { $cond: [{ $eq: ['$status', 'CHECKED_OUT'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] },
          },
          grossRevenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['CHECKED_IN', 'CHECKED_OUT']] },
                '$totalAmount',
                0,
              ],
            },
          },
          totalRefunds: {
            $sum: '$refundAmount',
          },
          taxCollected: {
            $sum: {
              $cond: [
                { $in: ['$status', ['CHECKED_IN', 'CHECKED_OUT']] },
                '$taxAmount',
                0,
              ],
            },
          },
        },
      },
    ]);

    // Map booking stats by hotelId string
    const bookingStatsMap = {};
    bookingStats.forEach((stat) => {
      bookingStatsMap[stat._id.toString()] = stat;
    });

    // 3. Aggregate Room and Inventory statistics per hotel
    const roomStats = await Room.aggregate([
      {
        $lookup: {
          from: 'roomtypes',
          localField: 'roomTypeId',
          foreignField: '_id',
          as: 'roomType',
        },
      },
      { $unwind: '$roomType' },
      ...(hotelId
        ? [{ $match: { 'roomType.hotelId': new mongoose.Types.ObjectId(hotelId) } }]
        : []),
      {
        $group: {
          _id: '$roomType.hotelId',
          totalRooms: { $sum: 1 },
          cleanRooms: {
            $sum: { $cond: [{ $eq: ['$housekeepingStatus', 'CLEAN'] }, 1, 0] },
          },
          dirtyRooms: {
            $sum: { $cond: [{ $eq: ['$housekeepingStatus', 'DIRTY'] }, 1, 0] },
          },
          maintenanceRooms: {
            $sum: {
              $cond: [{ $eq: ['$housekeepingStatus', 'MAINTENANCE'] }, 1, 0],
            },
          },
        },
      },
    ]);

    const roomStatsMap = {};
    roomStats.forEach((stat) => {
      roomStatsMap[stat._id.toString()] = stat;
    });

    // 4. Combine into Property-level reports & calculate summary
    let systemTotalRooms = 0;
    let systemOccupiedRooms = 0;
    let systemOperationalRooms = 0;
    let systemTotalBookings = 0;
    let systemGrossRevenue = 0;
    let systemTotalRefunds = 0;

    const properties = hotels.map((hotel) => {
      const hId = hotel._id.toString();
      const rStat = roomStatsMap[hId] || {
        totalRooms: 0,
        cleanRooms: 0,
        dirtyRooms: 0,
        maintenanceRooms: 0,
      };
      const bStat = bookingStatsMap[hId] || {
        totalBookings: 0,
        reserved: 0,
        confirmed: 0,
        checkedIn: 0,
        checkedOut: 0,
        cancelled: 0,
        grossRevenue: 0,
        totalRefunds: 0,
        taxCollected: 0,
      };

      const occupiedRooms = bStat.checkedIn;
      const operationalRooms = rStat.totalRooms - rStat.maintenanceRooms;
      const occupancyRate =
        operationalRooms > 0
          ? `${((occupiedRooms / operationalRooms) * 100).toFixed(1)}%`
          : '0.0%';

      const netRevenue = bStat.grossRevenue - bStat.totalRefunds;

      systemTotalRooms += rStat.totalRooms;
      systemOccupiedRooms += occupiedRooms;
      systemOperationalRooms += operationalRooms;
      systemTotalBookings += bStat.totalBookings;
      systemGrossRevenue += bStat.grossRevenue;
      systemTotalRefunds += bStat.totalRefunds;

      return {
        hotelId: hotel._id,
        name: hotel.name,
        city: hotel.city,
        rating: hotel.rating,
        inventory: {
          totalRooms: rStat.totalRooms,
          operationalRooms,
          occupiedRooms,
          cleanRooms: rStat.cleanRooms,
          dirtyRooms: rStat.dirtyRooms,
          maintenanceRooms: rStat.maintenanceRooms,
          occupancyRate,
        },
        bookingVolume: {
          totalBookings: bStat.totalBookings,
          reserved: bStat.reserved,
          confirmed: bStat.confirmed,
          checkedIn: bStat.checkedIn,
          checkedOut: bStat.checkedOut,
          cancelled: bStat.cancelled,
        },
        financials: {
          grossRevenue: bStat.grossRevenue,
          totalRefunds: bStat.totalRefunds,
          netRevenue,
          taxCollected: bStat.taxCollected,
        },
      };
    });

    const overallOccupancyRate =
      systemOperationalRooms > 0
        ? `${((systemOccupiedRooms / systemOperationalRooms) * 100).toFixed(1)}%`
        : '0.0%';

    const systemSummary = {
      totalHotels: hotels.length,
      totalRooms: systemTotalRooms,
      totalOccupiedRooms: systemOccupiedRooms,
      overallOccupancyRate,
      totalBookings: systemTotalBookings,
      totalGrossRevenue: systemGrossRevenue,
      totalRefunds: systemTotalRefunds,
      totalNetRevenue: systemGrossRevenue - systemTotalRefunds,
    };

    res.status(200).json({
      success: true,
      message: 'Occupancy and revenue report generated successfully',
      data: {
        systemSummary,
        properties,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOccupancyReport,
};
