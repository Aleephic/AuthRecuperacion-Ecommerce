// User Controller

const userRepository = require('../repositories/userRepository');
const { log } = require('../utilities/logger');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    log.error('Error in getAllUsers controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users',
      error: error.message
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userRepository.getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    log.error('Error in getUserById controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user',
      error: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Prevent updating the role through this endpoint
    if (updateData.role) {
      delete updateData.role;
    }
    
    // Check if user exists
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Allow update only for the user themselves or an admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const updatedUser = await userRepository.updateUser(id, updateData);
    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    log.error('Error in updateUser controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user',
      error: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Allow deletion only for the user themselves or an admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user'
      });
    }

    await userRepository.deleteUser(id);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    log.error('Error in deleteUser controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user',
      error: error.message
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required (user or admin)'
      });
    }
    
    // Check if user exists
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = await userRepository.updateUser(id, { role });
    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    log.error('Error in updateUserRole controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user role',
      error: error.message
    });
  }
};
