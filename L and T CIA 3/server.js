const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());

// Enable CORS
app.use(cors());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hotel Booking System API is running',
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

// =====================
// Routes
// =====================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/hotels', require('./routes/hotelRoutes'));
app.use('/api/room-types', require('./routes/roomTypeRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/pricing-rules', require('./routes/pricingRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/guests', require('./routes/guestRoutes'));
app.use('/api/admin/reports', require('./routes/reportRoutes'));

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errorCode: 'ROUTE_NOT_FOUND',
  });
});

// Centralized error handler (must be last middleware)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
