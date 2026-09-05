const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user.
 * @param {Object} user - User document from MongoDB
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Verify and decode a JWT token.
 * @param {string} token - JWT token string
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
