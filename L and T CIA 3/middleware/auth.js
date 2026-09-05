const { verifyToken } = require('../utils/token');
const User = require('../models/User');

/**
 * JWT authentication middleware.
 * Extracts token from Authorization header, verifies it,
 * and attaches the user to req.user.
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided',
        errorCode: 'NO_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);

    // Find user and attach to request
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // JWT errors are caught by the centralized error handler
    next(error);
  }
};

module.exports = auth;
