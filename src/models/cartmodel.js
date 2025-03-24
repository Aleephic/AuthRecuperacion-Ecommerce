// Cart Model
// Handles user shopping carts for the e-commerce system

const mongoose = require('mongoose');

// Define cart status values
const CART_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned'
};

const cartSchema = new mongoose.Schema({
  // Reference to the user who owns the cart
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Status of the cart
  status: {
    type: String,
    enum: {
      values: Object.values(CART_STATUS),
      message: 'Invalid cart status'
    },
    default: CART_STATUS.ACTIVE
  },
  // Items in the cart
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0.01, 'Price must be at least 0.01']
    },
    name: {
      type: String
