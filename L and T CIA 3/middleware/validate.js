const Joi = require('joi');
const mongoose = require('mongoose');

// ============================================
// Custom Joi extension for MongoDB ObjectId
// ============================================
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// ============================================
// Validation Schemas
// ============================================

const schemas = {
  // --- Auth ---
  register: Joi.object({
    name: Joi.string().trim().min(2).max(50).required()
      .messages({ 'any.required': 'Name is required' }),
    email: Joi.string().email().lowercase().trim().required()
      .messages({ 'any.required': 'Email is required', 'string.email': 'Invalid email format' }),
    password: Joi.string().min(6).max(128).required()
      .messages({ 'any.required': 'Password is required', 'string.min': 'Password must be at least 6 characters' }),
    role: Joi.string().valid('guest', 'staff', 'admin').default('guest')
      .messages({ 'any.only': 'Role must be guest, staff, or admin' }),
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().trim().required()
      .messages({ 'any.required': 'Email is required', 'string.email': 'Invalid email format' }),
    password: Joi.string().required()
      .messages({ 'any.required': 'Password is required' }),
  }),

  // --- Hotels ---
  createHotel: Joi.object({
    name: Joi.string().trim().min(2).max(100).required()
      .messages({ 'any.required': 'Hotel name is required' }),
    city: Joi.string().trim().min(2).max(100).required()
      .messages({ 'any.required': 'City is required' }),
    amenities: Joi.array().items(Joi.string().trim()).default([]),
    rating: Joi.number().min(1).max(5).required()
      .messages({ 'any.required': 'Rating is required', 'number.min': 'Rating must be at least 1', 'number.max': 'Rating cannot exceed 5' }),
  }),

  updateHotel: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    city: Joi.string().trim().min(2).max(100),
    amenities: Joi.array().items(Joi.string().trim()),
    rating: Joi.number().min(1).max(5),
  }).min(1).messages({ 'object.min': 'At least one field is required to update' }),

  // --- Room Types ---
  createRoomType: Joi.object({
    hotelId: Joi.string().custom(objectId).required()
      .messages({ 'any.required': 'Hotel ID is required', 'any.invalid': 'Invalid Hotel ID format' }),
    name: Joi.string().trim().min(2).max(50).required()
      .messages({ 'any.required': 'Room type name is required' }),
    basePrice: Joi.number().min(0).required()
      .messages({ 'any.required': 'Base price is required', 'number.min': 'Base price cannot be negative' }),
    totalRooms: Joi.number().integer().min(1).required()
      .messages({ 'any.required': 'Total rooms is required', 'number.min': 'Total rooms must be at least 1' }),
    capacity: Joi.number().integer().min(1).required()
      .messages({ 'any.required': 'Capacity is required', 'number.min': 'Capacity must be at least 1' }),
  }),

  updateRoomType: Joi.object({
    name: Joi.string().trim().min(2).max(50),
    basePrice: Joi.number().min(0),
    totalRooms: Joi.number().integer().min(1),
    capacity: Joi.number().integer().min(1),
  }).min(1).messages({ 'object.min': 'At least one field is required to update' }),

  // --- Rooms ---
  createRoom: Joi.object({
    roomTypeId: Joi.string().custom(objectId).required()
      .messages({ 'any.required': 'Room type ID is required', 'any.invalid': 'Invalid Room type ID format' }),
    roomNumber: Joi.string().trim().min(1).max(20).required()
      .messages({ 'any.required': 'Room number is required' }),
    housekeepingStatus: Joi.string().valid('CLEAN', 'DIRTY', 'MAINTENANCE').default('CLEAN'),
  }),

  updateRoom: Joi.object({
    roomNumber: Joi.string().trim().min(1).max(20),
    housekeepingStatus: Joi.string().valid('CLEAN', 'DIRTY', 'MAINTENANCE'),
  }).min(1).messages({ 'object.min': 'At least one field is required to update' }),

  updateHousekeeping: Joi.object({
    housekeepingStatus: Joi.string().valid('CLEAN', 'DIRTY', 'MAINTENANCE').required()
      .messages({ 'any.required': 'Housekeeping status is required', 'any.only': 'Status must be CLEAN, DIRTY, or MAINTENANCE' }),
  }),

  // --- Bookings ---
  createBooking: Joi.object({
    hotelId: Joi.string().custom(objectId).required()
      .messages({ 'any.required': 'Hotel ID is required', 'any.invalid': 'Invalid Hotel ID format' }),
    roomTypeId: Joi.string().custom(objectId).required()
      .messages({ 'any.required': 'Room type ID is required', 'any.invalid': 'Invalid Room type ID format' }),
    checkIn: Joi.date().iso().required()
      .messages({ 'any.required': 'Check-in date is required', 'date.format': 'Check-in must be a valid ISO date' }),
    checkOut: Joi.date().iso().greater(Joi.ref('checkIn')).required()
      .messages({ 'any.required': 'Check-out date is required', 'date.greater': 'Check-out must be after check-in' }),
    guests: Joi.number().integer().min(1).required()
      .messages({ 'any.required': 'Number of guests is required', 'number.min': 'At least 1 guest is required' }),
  }),

  // --- Pricing Rules ---
  createPricingRule: Joi.object({
    roomTypeId: Joi.string().custom(objectId).required()
      .messages({ 'any.required': 'Room type ID is required', 'any.invalid': 'Invalid Room type ID format' }),
    season: Joi.string().trim().min(2).max(50).required()
      .messages({ 'any.required': 'Season name is required' }),
    startDate: Joi.date().iso().required()
      .messages({ 'any.required': 'Start date is required' }),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required()
      .messages({ 'any.required': 'End date is required', 'date.greater': 'End date must be after start date' }),
    multiplier: Joi.number().min(0.1).required()
      .messages({ 'any.required': 'Multiplier is required', 'number.min': 'Multiplier must be at least 0.1' }),
  }),

  updatePricingRule: Joi.object({
    season: Joi.string().trim().min(2).max(50),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    multiplier: Joi.number().min(0.1),
  }).min(1).messages({ 'object.min': 'At least one field is required to update' }),

  // --- Search ---
  searchAvailability: Joi.object({
    hotelId: Joi.string().custom(objectId)
      .messages({ 'any.invalid': 'Invalid Hotel ID format' }),
    city: Joi.string().trim(),
    checkIn: Joi.date().iso().required()
      .messages({ 'any.required': 'Check-in date is required' }),
    checkOut: Joi.date().iso().greater(Joi.ref('checkIn')).required()
      .messages({ 'any.required': 'Check-out date is required', 'date.greater': 'Check-out must be after check-in' }),
    guests: Joi.number().integer().min(1).required()
      .messages({ 'any.required': 'Number of guests is required' }),
  }),

  // --- Param ID validation ---
  paramId: Joi.object({
    id: Joi.string().custom(objectId).required()
      .messages({ 'any.invalid': 'Invalid ID format' }),
  }),

  // --- Report Query validation ---
  reportQuery: Joi.object({
    hotelId: Joi.string().custom(objectId)
      .messages({ 'any.invalid': 'Invalid Hotel ID format' }),
  }),
};

// ============================================
// Validation Middleware Factory
// ============================================

/**
 * Creates a validation middleware for the given schema name.
 * Validates req.body by default, or req.query / req.params based on source.
 *
 * Usage:
 *   validate('register')          → validates req.body
 *   validate('searchAvailability', 'query') → validates req.query
 *   validate('paramId', 'params') → validates req.params
 *
 * @param {string} schemaName - Key from the schemas object
 * @param {string} source - 'body' | 'query' | 'params'
 * @returns {Function} Express middleware
 */
const validate = (schemaName, source = 'body') => {
  return (req, res, next) => {
    const schema = schemas[schemaName];

    if (!schema) {
      return next(new Error(`Validation schema '${schemaName}' not found`));
    }

    const dataToValidate = req[source];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
        errorCode: 'VALIDATION_ERROR',
      });
    }

    // Replace with validated/sanitized values
    req[source] = value;
    next();
  };
};

module.exports = { validate, schemas };
