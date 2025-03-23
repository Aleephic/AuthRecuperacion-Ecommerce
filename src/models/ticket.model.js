// Ticket Model
const mongoose = require('mongoose');

// Define the ticket 
const ticketSchema = new mongoose.Schema({
  // Auto-generated unique code for the ticket
  code: {
    type: String,
    required: true,
    unique: true
  },
  
  // Purchase date
  purchase_datetime: {
    type: Date,
    default: Date.now
  },
  
  // Total purchase amount
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  
  purchaser: {
    type: String,
    required: true,
    trim: true
  },
  
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    }
  }],
  
  // Case insufficient stock
  failedProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    price: Number,
    quantity: Number,
    reason: String
  }]
});

ticketSchema.index({ code: 1 }, { unique: true });
ticketSchema.index({ purchaser: 1 });
ticketSchema.index({ purchase_datetime: -1 });

// Create the model
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
