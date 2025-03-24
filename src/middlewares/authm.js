// Authentication Middleware

const { verifyToken } = require('../utils');
const { ROLES } = require('../models/user.model');
const { log } = require('../utilities/logger');

// Verify JWT token and attach user info to req.user
async function isAuthenticated(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
      });
    }
    
    req.user = decodedToken;
    next();
  } catch (error) {
    log.error('Authentication error', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}

// Check if the authenticated user is an admin
async function isAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }
    
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    next();
  } catch (error) {
    log.error('Admin authorization error', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
}

// Verify that the authenticated user owns the cart
async function isCartOwner(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }
    
    const { cartId } = req.params;
    // Retrieve cart using the cart repository attached to app.locals
    const cart = await req.app.locals.cartRepository.getById(cartId);
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    if (cart.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this cart.'
      });
    }
    
    req.cart = cart;
    next();
  } catch (error) {
    log.error('Cart ownership verification error', error);
    res.status(500).json({
      success: false,
      message: 'Server error during cart verification'
    });
  }
}

module.exports = {
  isAuthenticated,
  isAdmin,
  isCartOwner
};
