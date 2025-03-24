// User Data Access Object
// Handles all database operations for the User model

const { User } = require('../models/user.model');
const { log } = require('../utilities/logger');

class UserDAO {
  // Find a user by ID
  async findById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      log.error('Error finding user by ID', { id, error: error.message });
      throw error;
    }
  }

  // Find a user by username
  async findByUsername(username) {
    try {
      return await User.findOne({ username });
    } catch (error) {
      log.error('Error finding user by username', { username, error: error.message });
      throw error;
    }
  }

  // Find a user by email
  async findByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      log.error('Error finding user by email', { email, error: error.message });
      throw error;
    }
  }

  // Create a new user
  async create(userData) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      log.error('Error creating user', { error: error.message });
      throw error;
    }
  }

  // Update a user by ID
  async update(id, userData) {
    try {
      return await User.findByIdAndUpdate(
        id,
        userData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      log.error('Error updating user', { id, error: error.message });
      throw error;
    }
  }

  // Delete a user by ID
  async delete(id) {
    try {
      return await User.findByIdAndDelete(id);
    } catch (error) {
      log.error('Error deleting user', { id, error: error.message });
      throw error;
    }
  }

  // Get all users with optional filters
  async findAll(filters = {}) {
    try {
      return await User.find(filters);
    } catch (error) {
      log.error('Error finding all users', { filters, error: error.message });
      throw error;
    }
  }

  // Generate a password reset token for a user
  async generateResetToken(email) {
    try {
      return await User.findOneAndUpdate(
        { email },
        { 
          resetPasswordToken: null, // To be updated in the repository layer
          resetPasswordExpires: null  // To be updated in the repository layer
        },
        { new: true }
      );
    } catch (error) {
      log.error('Error generating reset token', { email, error: error.message });
      throw error;
    }
  }

  // Find a user by a valid reset token
  async findByResetToken(token) {
    try {
      return await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
    } catch (error) {
      log.error('Error finding user by reset token', { error: error.message });
      throw error;
    }
  }
}

module.exports = new UserDAO();
