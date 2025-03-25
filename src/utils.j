// Utility functions for the API

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { log } = require('./utilities/logger');

// Hash a password
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

// Compare a plain password with a hash
async function comparePassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    log.error('Error comparing passwords', error);
    throw new Error('Password comparison failed');
  }
}

// Generate a JWT token
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

// Verify a JWT token
function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';
    return jwt.verify(token, secret);
  } catch (error) {
    log.error('Error verifying JWT token', error);
    return null;
  }
}

// Generate a random reset token
function generateResetToken() {
  return crypto.randomBytes(20).toString('hex');
}

// Calculate token expiry (1 hour from now)
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
