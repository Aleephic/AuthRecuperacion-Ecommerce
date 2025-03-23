//Utility- API c:
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { log } = require('./utilities/logger');

/* Hash a password*/
async function hashPassword(password) {
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    log.error('Error hashing password', error);
    throw new Error('Password hashing failed');
  }
}

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if match, false otherwise
 */
async function comparePassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    log.error('Error comparing passwords', error);
    throw new Error('Password comparison failed');
  }
}

/**
 * Generate a JWT token
 * @param {object} payload - Data to encode in the token
 * @returns {string} - JWT token
 */
function generateToken(payload) {
  try {
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    log.error('Error generating JWT token', error);
    throw new Error('Token generation failed');
  }
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {object|null} - Decoded token or null if invalid
 */
function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';
    return jwt.verify(token, secret);
  } catch (error) {
    log.error('Error verifying JWT token', error);
    return null;
  }
}

function generateResetToken() {
  return crypto.randomBytes(20).toString('hex');
}

function calculateTokenExpiry() {
  const expiryTime = new Date();
  expiryTime.setHours(expiryTime.getHours() + 1);
  return expiryTime;
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generateResetToken,
  calculateTokenExpiry
};
