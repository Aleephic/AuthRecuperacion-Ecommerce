// Error handling middleware

const { log } = require('../utilities/logger');
const mongoose = require('mongoose');

// Custom API error class
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware for handling non-existent routes
function notFoundHandler(req, res, next) {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
}

// General error handling middleware
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on the server';
  let errorDetails = null;
  
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = Object.values(err.errors).map(e => e.message);
    log.warn('Validation error', { path: req.path, errors: errorDetails });
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid ID format';
    log.warn('Cast error', { path: req.path, error: err.message });
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry error';
    const field = err.message.match(/index:\s+(\w+)_/)?.[1] || 'field';
    errorDetails = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    log.warn('Duplicate key error', { path: req.path, field });
  } else if (err instanceof ApiError) {
    log.warn(`${statusCode} error`, { path: req.path, error: err.message });
  } else {
    log.error('Server error', { path: req.path, error: err.message, stack: err.stack });
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(errorDetails && { errors: errorDetails }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler
};
