// User Data Access Object
// Handles database operations for the User model

const User = require('../models/user.model');
const { log } = require('../utilities/logger');
const crypto = require('crypto');

class UserDAO {
  // Find a user by ID
  async findById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      log.error('Error finding user by ID:', error);
      return null;
    }
  }

  // Find a user by username
  async findByUsername(username) {
    try {
      return await User.findOne({ username });
    } catch (error) {
      log.error('Error finding user by username:', error);
      return null;
    }
  }

  // Find a user by email
  async findByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      log.error('Error finding user by email:', error);
      return null;
    }
  }

  // Create a new user
  async create(userData) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      log.error('Error creating user:', error);
      throw error;
    }
  }

  // Update a user by ID
  async update(id, userData) {
    try {
      return await User.findByIdAndUpdate(
        id,
        { $set: userData },
        { new: true, runValidators: true }
      );
    } catch (error) {
      log.error('Error updating user:', error);
      return null;
    }
  }

  // Delete a user by ID
  async delete(id) {
    try {
      return await User.findByIdAndDelete(id);
    } catch (error) {
      log.error('Error deleting user:', error);
      return null;
    }
  }

  // Get all users with optional filters
  async findAll(filters = {}) {
    try {
      return await User.find(filters);
    } catch (error) {
      log.error('Error finding all users:', error);
      return [];
    }
  }

  // Generate a password reset token and update the user
  async generateResetToken(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) return null;

      // Generate a token and its hashed version
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Update user with token and expiry (1 hour)
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          resetPasswordToken,
          resetPasswordExpires: Date.now() + 3600000
        },
        { new: true }
      );

      return { user: updatedUser, resetToken };
    } catch (error) {
      log.error('Error generating reset token:', error);
      return null;
    }
  }

  // Find a user by a valid reset token
  async findByResetToken(token) {
    try {
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      return await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() }
      });
    } catch (error) {
      log.error('Error finding user by reset token:', error);
      return null;
    }
  }
}

module.exports = new UserDAO();
