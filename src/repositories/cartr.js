// Cart Repository
// Business logic layer for cart operations

const cartDAO = require('../DAO/cartDAO');
const productDAO = require('../DAO/productDAO');
const CartDTO = require('../DTO/cart.dto');
const ProductDTO = require('../DTO/product.dto');
const { log } = require('../utilities/logger');

class CartRepository {
  // Get cart by ID and convert it to a DTO
  async getCartById(id) {
    try {
      const cart = await cartDAO.findById(id);
      return cart ? CartDTO.toDTO(cart) : null;
    } catch (error) {
      log.error('Error in getCartById:', error);
      return null;
    }
  }
  
  // Get the user's active cart, or create one if it doesn't exist
  async getUserCart(userId) {
    try {
      let cart = await cartDAO.findByUserId(userId);
      if (!cart) {
        cart = await cartDAO.create(userId);
      }
      return CartDTO.toDTO(cart);
    } catch (error) {
      log.error('Error in getUserCart:', error);
      throw error;
    }
  }
  
  // Add an item to the cart after checking product availability and stock
  async addItemToCart(cartId, productId, quantity = 1) {
    try {
      const product = await productDAO.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      if (product.stock < quantity) {
        throw new Error('Not enough stock available');
      }
      
      const cart = await cartDAO.addItem(cartId, productId, quantity, product.price);
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      return CartDTO.toDTO(cart);
    } catch (error) {
      log.error('Error in addItemToCart:', error);
      throw error;
    }
  }
  
  // Update the quantity of an item in the cart; remove the item if quantity is zero or negative
  async updateCartItem(cartId, productId, quantity) {
    try {
      if (quantity <= 0) {
        return await this.removeCartItem(cartId, productId);
      }
      
      const product = await productDAO.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      if (product.stock < quantity) {
        throw new Error('Not enough stock available');
      }
      
      const cart = await cartDAO.updateItem(cartId, productId, quantity);
      if (!cart) {
        throw new Error('Cart or item not found');
      }
      
      return CartDTO.toDTO(cart);
    } catch (error) {
      log.error('Error in updateCartItem:', error);
      throw error;
    }
  }
  
  // Remove an item from the cart and return the updated cart as a DTO
  async removeCartItem(cartId, productId) {
    try {
      const cart = await cartDAO.removeItem(cartId, productId);
      if (!cart) {
        throw new Error('Cart or item not found');
      }
      return CartDTO.toDTO(cart);
    } catch (error) {
      log.error('Error in removeCartItem:', error);
      throw error;
    }
  }
  
  // Clear all items from the cart and return the updated cart as a DTO
  async clearCart(cartId) {
    try {
      const cart = await cartDAO.clearCart(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }
      return CartDTO.toDTO(cart);
    } catch (error) {
      log.error('Error in clearCart:', error);
      throw error;
    }
  }
  
  // Process checkout for the cart, updating product stock and removing successfully purchased items
  async checkout(cartId) {
    try {
      const cart = await cartDAO.findById(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      const successItems = [];
      const failedItems = [];
      
      // Process each item in the cart
      for (const item of cart.items) {
        try {
          const hasStock = await productDAO.hasStock(item.product._id, item.quantity);
          if (hasStock) {
            await productDAO.updateStock(item.product._id, -item.quantity);
            successItems.push({
              product: ProductDTO.toDTO(item.product),
              quantity: item.quantity,
              price: item.price
            });
          } else {
            failedItems.push({
              product: ProductDTO.toDTO(item.product),
              quantity: item.quantity,
              reason: 'Insufficient stock'
            });
          }
        } catch (error) {
          log.error(`Error processing cart item (${item.product._id}):`, error);
          failedItems.push({
            product: ProductDTO.toDTO(item.product),
            quantity: item.quantity,
            reason: error.message || 'Processing error'
          });
        }
      }
      
      // If all items were processed successfully, complete the cart
      if (failedItems.length === 0) {
        await cartDAO.completeCart(cartId);
      } else if (successItems.length > 0) {
        // For partial success, remove only successfully processed items from the cart
        for (const item of successItems) {
          await cartDAO.removeItem(cartId, item.product.id);
        }
      }
      
      return {
        success: failedItems.length === 0,
        cartId,
        successItems,
        failedItems,
        completedAt: failedItems.length === 0 ? new Date() : null
      };
    } catch (error) {
      log.error('Error in checkout:', error);
      throw error;
    }
  }
  
  // Get a user's purchase history as an array of Cart DTOs
  async getUserHistory(userId) {
    try {
      const carts = await cartDAO.getUserHistory(userId);
      return CartDTO.toDTOArray(carts);
    } catch (error) {
      log.error('Error in getUserHistory:', error);
      return [];
    }
  }
}

module.exports = new CartRepository();
