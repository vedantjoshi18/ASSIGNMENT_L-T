/**
 * Centralized error handling middleware.
 *
 * All errors thrown or passed via next(err) end up here.
 * Returns a consistent JSON response shape for every error.
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'SERVER_ERROR';

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid resource ID format';
    errorCode = 'INVALID_ID';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    statusCode = 409;
    message = `Duplicate value for: ${field}`;
    errorCode = 'DUPLICATE_RESOURCE';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    statusCode = 400;
    message = messages.join('. ');
    errorCode = 'VALIDATION_ERROR';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
    errorCode = 'TOKEN_EXPIRED';
  }

  // Log in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${statusCode} - ${errorCode}: ${message}`);
    if (statusCode === 500) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
  });
};

module.exports = errorHandler;
