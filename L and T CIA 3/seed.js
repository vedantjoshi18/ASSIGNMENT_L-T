const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Hotel = require('./models/Hotel');
const RoomType = require('./models/RoomType');
const Room = require('./models/Room');
const Booking = require('./models/Booking');
const PricingRule = require('./models/PricingRule');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not set. Check your .env file.');
  process.exit(1);
}

function daysFromNow(d) {
  const date = new Date();
  date.setDate(date.getDate() + d);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  // Clear everything
  console.log('Clearing old data...');
  await Promise.all([
    User.deleteMany({}),
    Hotel.deleteMany({}),
    RoomType.deleteMany({}),
    Room.deleteMany({}),
    Booking.deleteMany({}),
    PricingRule.deleteMany({}),
  ]);
  console.log('Cleared.\n');

  // ── Users ──
  console.log('Creating users...');
  const salt = await bcrypt.genSalt(10);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@hotel.com',
    passwordHash: await bcrypt.hash('admin123', salt),
    role: 'admin',
  });

  const staff = await User.create({
    name: 'Riya Sharma',
    email: 'staff@hotel.com',
    passwordHash: await bcrypt.hash('staff123', salt),
    role: 'staff',
  });

  const guest1 = await User.create({
    name: 'Arjun Patel',
    email: 'guest@hotel.com',
    passwordHash: await bcrypt.hash('guest123', salt),
    role: 'guest',
  });

  const guest2 = await User.create({
    name: 'Priya Gupta',
    email: 'priya@hotel.com',
    passwordHash: await bcrypt.hash('priya123', salt),
    role: 'guest',
  });

  console.log(`  Admin:   admin@hotel.com / admin123`);
  console.log(`  Staff:   staff@hotel.com / staff123`);
  console.log(`  Guest 1: guest@hotel.com / guest123`);
  console.log(`  Guest 2: priya@hotel.com / priya123\n`);

  // ── Hotels ──
  console.log('Creating hotels...');
  const hotel1 = await Hotel.create({
    name: 'The Grand Palace',
    city: 'Mumbai',
    amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Free WiFi', 'Room Service'],
    rating: 5,
  });

  const hotel2 = await Hotel.create({
    name: 'Sunset Beach Resort',
    city: 'Goa',
    amenities: ['Beach Access', 'Pool', 'Bar', 'Free WiFi', 'Parking', 'Kayaking'],
    rating: 4,
  });

  const hotel3 = await Hotel.create({
    name: 'Mountain View Lodge',
    city: 'Manali',
    amenities: ['Mountain View', 'Bonfire', 'Trekking', 'Free WiFi', 'Parking', 'Café'],
    rating: 4,
  });

  console.log(`  ${hotel1.name} (${hotel1.city})`);
  console.log(`  ${hotel2.name} (${hotel2.city})`);
  console.log(`  ${hotel3.name} (${hotel3.city})\n`);

  // ── Room Types ──
  console.log('Creating room types...');
  const rt1a = await RoomType.create({ hotelId: hotel1._id, name: 'Deluxe Suite', basePrice: 8500, totalRooms: 10, capacity: 3 });
  const rt1b = await RoomType.create({ hotelId: hotel1._id, name: 'Standard Double', basePrice: 4500, totalRooms: 15, capacity: 2 });
  const rt1c = await RoomType.create({ hotelId: hotel1._id, name: 'Presidential Suite', basePrice: 25000, totalRooms: 3, capacity: 4 });

  const rt2a = await RoomType.create({ hotelId: hotel2._id, name: 'Beach Villa', basePrice: 12000, totalRooms: 6, capacity: 3 });
  const rt2b = await RoomType.create({ hotelId: hotel2._id, name: 'Garden Room', basePrice: 5500, totalRooms: 12, capacity: 2 });
  const rt2c = await RoomType.create({ hotelId: hotel2._id, name: 'Ocean View Suite', basePrice: 15000, totalRooms: 4, capacity: 4 });

  const rt3a = await RoomType.create({ hotelId: hotel3._id, name: 'Cozy Cottage', basePrice: 6000, totalRooms: 8, capacity: 2 });
  const rt3b = await RoomType.create({ hotelId: hotel3._id, name: 'Family Cabin', basePrice: 9500, totalRooms: 5, capacity: 4 });

  console.log(`  ${hotel1.name}: Deluxe Suite (10), Standard Double (15), Presidential Suite (3)`);
  console.log(`  ${hotel2.name}: Beach Villa (6), Garden Room (12), Ocean View Suite (4)`);
  console.log(`  ${hotel3.name}: Cozy Cottage (8), Family Cabin (5)\n`);

  // ── Rooms ──
  console.log('Creating rooms...');
  const allRoomTypes = [rt1a, rt1b, rt1c, rt2a, rt2b, rt2c, rt3a, rt3b];
  let roomCount = 0;
  for (const rt of allRoomTypes) {
    const prefix = rt.name === 'Presidential Suite' ? 'PS' :
                   rt.name === 'Deluxe Suite' ? 'DS' :
                   rt.name === 'Beach Villa' ? 'BV' :
                   rt.name === 'Ocean View Suite' ? 'OV' :
                   rt.name === 'Family Cabin' ? 'FC' :
                   rt.name === 'Cozy Cottage' ? 'CC' :
                   rt.name === 'Garden Room' ? 'GR' : 'SD';
    for (let i = 1; i <= rt.totalRooms; i++) {
      const statuses = ['CLEAN', 'CLEAN', 'CLEAN', 'DIRTY', 'MAINTENANCE'];
      await Room.create({
        roomTypeId: rt._id,
        roomNumber: `${prefix}-${String(i).padStart(3, '0')}`,
        housekeepingStatus: statuses[Math.floor(Math.random() * statuses.length)],
      });
      roomCount++;
    }
  }
  console.log(`  ${roomCount} rooms created across all hotels\n`);

  // ── Pricing Rules ──
  console.log('Creating pricing rules...');

  // Peak season (Dec-Jan) - all hotels
  const peakStart = new Date(new Date().getFullYear(), 11, 15); // Dec 15
  const peakEnd = new Date(new Date().getFullYear() + 1, 1, 15); // Feb 15

  // Weekend surcharge (Apr-Sep)
  const weekendStart = new Date(new Date().getFullYear(), 3, 1); // Apr 1
  const weekendEnd = new Date(new Date().getFullYear(), 8, 30); // Sep 30

  // Monsoon discount
  const monsoonStart = new Date(new Date().getFullYear(), 5, 1); // Jun 1
  const monsoonEnd = new Date(new Date().getFullYear(), 8, 15); // Sep 15

  for (const rt of allRoomTypes) {
    await PricingRule.create({
      roomTypeId: rt._id,
      season: 'Peak Season (Dec-Feb)',
      startDate: peakStart,
      endDate: peakEnd,
      multiplier: 1.5,
    });
    await PricingRule.create({
      roomTypeId: rt._id,
      season: 'Weekend Surcharge',
      startDate: weekendStart,
      endDate: weekendEnd,
      multiplier: 1.25,
    });
    await PricingRule.create({
      roomTypeId: rt._id,
      season: 'Monsoon Discount',
      startDate: monsoonStart,
      endDate: monsoonEnd,
      multiplier: 0.8,
    });
  }
  console.log(`  3 pricing rules per room type (${allRoomTypes.length * 3} total)\n`);

  // ── Bookings ──
  console.log('Creating bookings...');

  // Booking 1: Guest 1 - CHECKED_OUT at Grand Palace
  const booking1 = await Booking.create({
    guestId: guest1._id,
    hotelId: hotel1._id,
    roomTypeId: rt1a._id,
    roomId: (await Room.findOne({ roomTypeId: rt1a._id }))._id,
    checkIn: daysFromNow(-10),
    checkOut: daysFromNow(-7),
    guests: 2,
    status: 'CHECKED_OUT',
    totalAmount: 25500,
    nights: 3,
    taxAmount: 4590,
    actualCheckIn: daysFromNow(-10),
    actualCheckOut: daysFromNow(-7),
  });

  // Booking 2: Guest 1 - CHECKED_IN at Grand Palace
  const booking2 = await Booking.create({
    guestId: guest1._id,
    hotelId: hotel1._id,
    roomTypeId: rt1b._id,
    roomId: (await Room.findOne({ roomTypeId: rt1b._id }))._id,
    checkIn: daysFromNow(-1),
    checkOut: daysFromNow(2),
    guests: 1,
    status: 'CHECKED_IN',
    totalAmount: 13500,
    nights: 3,
    taxAmount: 2430,
    actualCheckIn: daysFromNow(-1),
  });

  // Booking 3: Guest 2 - CONFIRMED at Goa
  const booking3 = await Booking.create({
    guestId: guest2._id,
    hotelId: hotel2._id,
    roomTypeId: rt2a._id,
    roomId: (await Room.findOne({ roomTypeId: rt2a._id }))._id,
    checkIn: daysFromNow(5),
    checkOut: daysFromNow(9),
    guests: 3,
    status: 'CONFIRMED',
    totalAmount: 48000,
    nights: 4,
    taxAmount: 8640,
  });

  // Booking 4: Guest 2 - RESERVED at Manali
  const booking4 = await Booking.create({
    guestId: guest2._id,
    hotelId: hotel3._id,
    roomTypeId: rt3a._id,
    roomId: (await Room.findOne({ roomTypeId: rt3a._id }))._id,
    checkIn: daysFromNow(15),
    checkOut: daysFromNow(18),
    guests: 2,
    status: 'RESERVED',
    totalAmount: 18000,
    nights: 3,
    taxAmount: 3240,
  });

  // Booking 5: Guest 1 - CANCELLED
  const booking5 = await Booking.create({
    guestId: guest1._id,
    hotelId: hotel2._id,
    roomTypeId: rt2b._id,
    roomId: (await Room.findOne({ roomTypeId: rt2b._id }))._id,
    checkIn: daysFromNow(3),
    checkOut: daysFromNow(6),
    guests: 2,
    status: 'CANCELLED',
    totalAmount: 16500,
    nights: 3,
    taxAmount: 2970,
    cancellationDate: daysFromNow(-2),
    refundAmount: 16500,
  });

  // Booking 6: Guest 2 - CHECKED_OUT at Grand Palace
  const booking6 = await Booking.create({
    guestId: guest2._id,
    hotelId: hotel1._id,
    roomTypeId: rt1c._id,
    roomId: (await Room.findOne({ roomTypeId: rt1c._id }))._id,
    checkIn: daysFromNow(-20),
    checkOut: daysFromNow(-17),
    guests: 2,
    status: 'CHECKED_OUT',
    totalAmount: 75000,
    nights: 3,
    taxAmount: 13500,
    actualCheckIn: daysFromNow(-20),
    actualCheckOut: daysFromNow(-17),
  });

  // Booking 7: Guest 1 - CONFIRMED upcoming at Mountain View
  const booking7 = await Booking.create({
    guestId: guest1._id,
    hotelId: hotel3._id,
    roomTypeId: rt3b._id,
    roomId: (await Room.findOne({ roomTypeId: rt3b._id }))._id,
    checkIn: daysFromNow(10),
    checkOut: daysFromNow(14),
    guests: 4,
    status: 'CONFIRMED',
    totalAmount: 38000,
    nights: 4,
    taxAmount: 6840,
  });

  console.log(`  7 bookings created:\n`);
  console.log(`  Booking 1: ${guest1.name} — ${hotel1.name} — CHECKED OUT (past)`);
  console.log(`  Booking 2: ${guest1.name} — ${hotel1.name} — CHECKED IN (current)`);
  console.log(`  Booking 3: ${guest2.name} — ${hotel2.name} — CONFIRMED (upcoming)`);
  console.log(`  Booking 4: ${guest2.name} — ${hotel3.name} — RESERVED (upcoming)`);
  console.log(`  Booking 5: ${guest1.name} — ${hotel2.name} — CANCELLED (refunded)`);
  console.log(`  Booking 6: ${guest2.name} — ${hotel1.name} — CHECKED OUT (past)`);
  console.log(`  Booking 7: ${guest1.name} — ${hotel3.name} — CONFIRMED (upcoming)\n`);

  console.log('Seed complete!');
  console.log('\n── Login Credentials ──');
  console.log('Admin:  admin@hotel.com / admin123');
  console.log('Staff:  staff@hotel.com / staff123');
  console.log('Guest1: guest@hotel.com / guest123');
  console.log('Guest2: priya@hotel.com / priya123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
