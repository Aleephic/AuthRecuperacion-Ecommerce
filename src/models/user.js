// User Model
// Defines the schema for user authentication and account management

const mongoose = require('mongoose');
const { hashPassword } = require('../utils');

// Define user roles
const ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  role: {
    type: String,
    enum: {
      values: Object.values(ROLES),
      message: 'Invalid role'
    },
    default: ROLES.USER
  },
  // Password reset fields
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook: update timestamps and hash password if modified
userSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  if (this.isModified('password')) {
    try {
      this.password = await hashPassword(this.password);
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Create indexes for improved query performance
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ resetPasswordToken: 1 });

// Create and export the User model and roles
const User = mongoose.model('User', userSchema);

module.exports = {
  User,
  ROLES
};
