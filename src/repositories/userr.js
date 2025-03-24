// User Repository
// Business logic layer for user operations

const userDAO = require('../DAO/userDAO');
const UserDTO = require('../DTO/user.dto');
const { hashPassword, generateResetToken, calculateTokenExpiry } = require('../utils');
const { log } = require('../utilities/logger');

class UserRepository {
  // Get a user by ID and return a User DTO, or null if not found
  async getUserById(id) {
    try {
      const user = await userDAO.findById(id);
      return user ? UserDTO.toDTO(user) : null;
    } catch (error) {
      log.error('Error in getUserById:', error);
      return null;
    }
  }
  
  // Get a user by username and return a User DTO, or null if not found
  async getUserByUsername(username) {
    try {
      const user = await userDAO.findByUsername(username);
      return user ? UserDTO.toDTO(user) : null;
    } catch (error) {
      log.error('Error in getUserByUsername:', error);
      return null;
    }
  }
  
  // Get a user by email and return a User DTO, or null if not found
  async getUserByEmail(email) {
    try {
      const user = await userDAO.findByEmail(email);
      return user ? UserDTO.toDTO(user) : null;
    } catch (error) {
      log.error('Error in getUserByEmail:', error);
      return null;
    }
  }
  
  // Get all users as an array of User DTOs
  async getAllUsers() {
    try {
      const users = await userDAO.findAll();
      return UserDTO.toDTOArray(users);
    } catch (error) {
      log.error('Error in getAllUsers:', error);
      return [];
    }
  }
  
  // Create a new user and return the created User DTO
  async createUser(userData) {
    try {
      const user = await userDAO.create(userData);
      return UserDTO.toDTO(user);
    } catch (error) {
      log.error('Error in createUser:', error);
      throw error;
    }
  }
  
  // Update an existing user; if password is updated, it is hashed first
  async updateUser(id, userData) {
    try {
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      const user = await userDAO.update(id, userData);
      return user ? UserDTO.toDTO(user) : null;
    } catch (error) {
      log.error('Error in updateUser:', error);
      throw error;
    }
  }
  
  // Delete a user by ID and return true if deletion was successful
  async deleteUser(id) {
    try {
      const result = await userDAO.delete(id);
      return !!result;
    } catch (error) {
      log.error('Error in deleteUser:', error);
      return false;
    }
  }
  
  // Authenticate a user with username and password; return a User DTO if authenticated
  async authenticateUser(username, password) {
    try {
      const user = await userDAO.authenticateUser(username, password);
      return user ? UserDTO.toDTO(user) : null;
    } catch (error) {
      log.error('Error in authenticateUser:', error);
      return null;
    }
  }
  
  // Generate a password reset token for the given email
  async generateResetToken(email) {
    try {
      // Generate a token and calculate its expiry
      const token = generateResetToken();
      const expiry = calculateTokenExpiry();
      
      // Update the user with the reset token and expiry
      const updatedUser = await userDAO.generateResetToken(email, token, expiry);
      if (!updatedUser) {
        return null;
      }
      
      return {
        user: UserDTO.toDTO(updatedUser),
        token
      };
    } catch (error) {
      log.error('Error in generateResetToken:', error);
      return null;
    }
  }
  
  // Reset password using the provided token and new password
  async resetPassword(token, newPassword) {
    try {
      // Find the user by the reset token and ensure the token is still valid
      const user = await userDAO.findByResetToken(token);
      if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        return false;
      }
      
      const hashedPassword = await hashPassword(newPassword);
      
      // Update the user: set the new password and clear reset token fields
      const updatedUser = await userDAO.update(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
      
      return !!updatedUser;
    } catch (error) {
      log.error('Error in resetPassword:', error);
      return false;
    }
  }
}

module.exports = new UserRepository();
