/**
 * Role-based authorization middleware factory.
 * Returns a middleware that checks if req.user.role is in the allowed roles.
 *
 * Usage: authorize('admin', 'staff')
 *
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errorCode: 'NOT_AUTHENTICATED',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
        errorCode: 'FORBIDDEN',
      });
    }

    next();
  };
};

module.exports = authorize;
