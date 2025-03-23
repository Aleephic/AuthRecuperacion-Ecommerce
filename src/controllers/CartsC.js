// Cart Controller

const cartRepository = require('../repositories/cartRepository');
const { log } = require('../utilities/logger');

exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartRepository.getUserCart(userId);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    log.error('Error in getUserCart controller:', error);
    res.status(500).json({ success: false, message: 'Error fetching cart', error: error.message });
  }
};

exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const userCart = await cartRepository.getUserCart(userId);
    const updatedCart = await cartRepository.addItemToCart(userCart.id, productId, parseInt(quantity));

    res.status(200).json({ success: true, message: 'Item added to cart', cart: updatedCart });
  } catch (error) {
    log.error('Error in addItemToCart controller:', error);
    if (error.message.includes('Product not found')) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (error.message.includes('stock')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Error adding item to cart', error: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
    }

    const userCart = await cartRepository.getUserCart(userId);
    const updatedCart = await cartRepository.updateCartItem(userCart.id, productId, parseInt(quantity));

    res.status(200).json({ success: true, message: 'Cart item updated', cart: updatedCart });
  } catch (error) {
    log.error('Error in updateCartItem controller:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes('stock')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Error updating cart item', error: error.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const userCart = await cartRepository.getUserCart(userId);
    const updatedCart = await cartRepository.removeCartItem(userCart.id, productId);

    res.status(200).json({ success: true, message: 'Item removed from cart', cart: updatedCart });
  } catch (error) {
    log.error('Error in removeCartItem controller:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Error removing item from cart', error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const userCart = await cartRepository.getUserCart(userId);
    const updatedCart = await cartRepository.clearCart(userCart.id);
    res.status(200).json({ success: true, message: 'Cart cleared', cart: updatedCart });
  } catch (error) {
    log.error('Error in clearCart controller:', error);
    res.status(500).json({ success: false, message: 'Error clearing cart', error: error.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const userCart = await cartRepository.getUserCart(userId);
    
    if (!userCart.items || userCart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    
    const result = await cartRepository.checkout(userCart.id);
    
    if (result.failedItems.length === 0) {
      res.status(200).json({ success: true, message: 'Checkout successful', result });
    } else if (result.successItems.length === 0) {
      res.status(400).json({ success: false, message: 'Checkout failed - all items could not be processed', result });
    } else {
      res.status(207).json({ success: true, message: 'Partial checkout - some items could not be processed', result });
    }
  } catch (error) {
    log.error('Error in checkout controller:', error);
    res.status(500).json({ success: false, message: 'Error processing checkout', error: error.message });
  }
};

exports.getPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await cartRepository.getUserHistory(userId);
    res.status(200).json({ success: true, count: history.length, history });
  } catch (error) {
    log.error('Error in getPurchaseHistory controller:', error);
    res.status(500).json({ success: false, message: 'Error fetching purchase history', error: error.message });
  }
};
