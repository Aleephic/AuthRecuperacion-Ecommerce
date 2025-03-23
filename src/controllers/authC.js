// Authentication Controller
const { validationResult } = require('express-validator');
const userRepository = require('../repositories/userRepository');
const { ApiError } = require('../middlewares/errorHandler');
const { generateToken, hashPassword, comparePassword } = require('../utils');
const { log } = require('../utilities/logger');

async function register(req, res, next) {
  try {
    // Validate input data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation error', 400, errors.array());
    }
    const { username, email, password } = req.body;
    
    // Check if username or email already exists
    const existingUser = await userRepository.getUserByUsername(username);
    if (existingUser) {
      throw new ApiError('Username already exists', 400);
    }
    const existingEmail = await userRepository.getUserByEmail(email);
    if (existingEmail) {
      throw new ApiError('Email already exists', 400);
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Prepare user data with default role 'user'
    const userData = { username, email, password: hashedPassword, role: 'user' };
    
    // Create user in the database
    const user = await userRepository.createUser(userData);
    
    // Generate JWT token
    const token = generateToken({ userId: user.id });
    
    // Respond with user data and token
    res.status(201).json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    // Validate input data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation error', 400, errors.array());
    }
    const { username, password } = req.body;
    
    // Find user by username
    const user = await userRepository.getUserByUsername(username);
    if (!user) {
      throw new ApiError('Invalid credentials', 401);
    }
    
    // Compare passwords
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new ApiError('Invalid credentials', 401);
    }
    
    // Generate JWT token
    const token = generateToken({ userId: user.id });
    
    // Respond with user data and token
    res.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    // Validate input data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation error', 400, errors.array());
    }
    const { email } = req.body;
    
    // Generate a reset token and save it to the user record
    const result = await userRepository.generateResetToken(email);
    if (!result) {
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a reset link'
      });
    }
    
    // Log the reset token (in production, send it via email)
    log.info(`Password reset token for ${email}: ${result.token}`);
    
    res.json({
      success: true,
      message: 'If your email is registered, you will receive a reset link',
      ...(process.env.NODE_ENV === 'development' && { token: result.token })
    });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    // Validate input data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation error', 400, errors.array());
    }
    const { token, password } = req.body;
    
    // Reset the password using the provided token
    const success = await userRepository.resetPassword(token, password);
    if (!success) {
      throw new ApiError('Invalid or expired token', 400);
    }
    
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    // The authenticated user is attached to req.user by the auth middleware
    if (!req.user) {
      throw new ApiError('Not authenticated', 401);
    }
    res.json({
      success: true,
      user: { id: req.user.id, username: req.user.username, email: req.user.email, role: req.user.role }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, forgotPassword, resetPassword, getCurrentUser };
