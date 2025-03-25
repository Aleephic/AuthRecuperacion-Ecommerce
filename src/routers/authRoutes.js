// Authentication Routes
// Defines endpoints for user registration, login, password recovery, and session management

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Validation rules for registration
const registerValidation = [
  check('username', 'Username is required').not().isEmpty().trim(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be at least 8 characters').isLength({ min: 8 })
];

// Validation rules for login
const loginValidation = [
  check('username', 'Username is required').not().isEmpty().trim(),
  check('password', 'Password is required').exists()
];

// Validation rules for password reset request
const forgotPasswordValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail()
];

// Validation rules for password reset
const resetPasswordValidation = [
  check('token', 'Token is required').not().isEmpty(),
  check('password', 'Password must be at least 8 characters').isLength({ min: 8 })
];

// Register a new user
router.post('/register', registerValidation, authController.register);

// Login user
router.post('/login', loginValidation, authController.login);

// Get current authenticated user
router.get('/me', isAuthenticated, authController.getCurrentUser);

// Request password reset
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);

// Reset password with token
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

// Logout user (JWT tokens are managed client-side; this endpoint can handle any server cleanup)
router.post('/logout', isAuthenticated, (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

module.exports = router;
