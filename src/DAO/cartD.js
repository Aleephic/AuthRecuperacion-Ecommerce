// Cart Data Access Object
// Handles database operations for the Cart model

const Cart = require('../models/cart.model');
const { log } = require('../utilities/logger');

class CartDAO {
  // Find a cart by its ID and populate product details
  async findById(id) {
    try {
      return await Cart.findById(id).populate({
        path: 'items.product',
        model: 'Product'
      });
    } catch (error) {
      log.error('Error finding cart by ID:', error);
      return null;
    }
  }

  // Find an active cart by user ID
  async findByUserId(userId) {
    try {
      return await Cart.findOne({ 
        user: userId,
        status: 'active'
      }).populate({
        path: 'items.product',
        model: 'Product'
      });
    } catch (error) {
      log.error('Error finding cart by user ID:', error);
      return null;
    }
  }

  // Create a new cart for a user
  async create(userId) {
    try {
      const cart = new Cart({
        user: userId,
        items: [],
        total: 0
      });
      return await cart.save();
    } catch (error) {
      log.error('Error creating cart:', error);
      throw error;
    }
  }

  // Add an item to the cart or update its quantity if it exists
  async addItem(cartId, productId, quantity = 1, price) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) return null;
      
      const index = cart.items.findIndex(item => item.product.toString() === productId);
      if (index > -1) {
        cart.items[index].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity, price });
      }
      
      return await cart.save();
    } catch (error) {
      log.error('Error adding item to cart:', error);
      return null;
    }
  }

  // Update the quantity of an item in the cart; remove if quantity <= 0
  async updateItem(cartId, productId, quantity) {
    try {
      if (quantity <= 0) {
        return await this.removeItem(cartId, productId);
      }
      
      const cart = await Cart.findOneAndUpdate(
        { _id: cartId, 'items.product': productId },
        { $set: { 'items.$.quantity': quantity } },
        { new: true }
      ).populate({
        path: 'items.product',
        model: 'Product'
      });
      
      return cart;
    } catch (error) {
      log.error('Error updating cart item:', error);
      return null;
    }
  }

  // Remove an item from the cart
  async removeItem(cartId, productId) {
    try {
      const cart = await Cart.findByIdAndUpdate(
        cartId,
        { $pull: { items: { product: productId } } },
        { new: true }
      ).populate({
        path: 'items.product',
        model: 'Product'
      });
      return cart;
    } catch (error) {
      log.error('Error removing cart item:', error);
      return null;
    }
  }

  // Clear all items and reset total in the cart
  async clearCart(cartId) {
    try {
      const cart = await Cart.findByIdAndUpdate(
        cartId,
        { $set: { items: [], total: 0 } },
        { new: true }
      );
      return cart;
    } catch (error) {
      log.error('Error clearing cart:', error);
      return null;
    }
  }

  // Mark the cart as completed (checkout)
  async completeCart(cartId) {
    try {
      const cart = await Cart.findByIdAndUpdate(
        cartId,
        { $set: { status: 'completed', completedAt: new Date() } },
        { new: true }
      ).populate({
        path: 'items.product',
        model: 'Product'
      });
      return cart;
    } catch (error) {
      log.error('Error completing cart:', error);
      return null;
    }
  }

  // Retrieve a user's completed cart history
  async getUserHistory(userId) {
    try {
      return await Cart.find({ user: userId, status: 'completed' })
        .sort({ completedAt: -1 })
        .populate({
          path: 'items.product',
          model: 'Product'
        });
    } catch (error) {
      log.error('Error getting user cart history:', error);
      return [];
    }
  }
}

module.exports = new CartDAO();
