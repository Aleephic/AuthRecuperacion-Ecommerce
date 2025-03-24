// Product Data Access Object
// Handles database operations for the Product model

const Product = require('../models/product.model');
const { log } = require('../utilities/logger');

class ProductDAO {
  // Find a product by ID
  async findById(id) {
    try {
      return await Product.findById(id);
    } catch (error) {
      log.error('Error finding product by ID:', error);
      return null;
    }
  }

  // Create a new product
  async create(productData) {
    try {
      const product = new Product(productData);
      return await product.save();
    } catch (error) {
      log.error('Error creating product:', error);
      throw error;
    }
  }

  // Update a product by ID
  async update(id, productData) {
    try {
      return await Product.findByIdAndUpdate(
        id,
        { $set: productData },
        { new: true, runValidators: true }
      );
    } catch (error) {
      log.error('Error updating product:', error);
      return null;
    }
  }

  // Delete a product by ID
  async delete(id) {
    try {
      return await Product.findByIdAndDelete(id);
    } catch (error) {
      log.error('Error deleting product:', error);
      return null;
    }
  }

  // Get all products with optional filters and options (pagination and sort)
  async findAll(filters = {}, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
      return await Product.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      log.error('Error finding all products:', error);
      return [];
    }
  }

  // Find products by category with options (pagination and sort)
  async findByCategory(category, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
      return await Product.find({ category })
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      log.error('Error finding products by category:', error);
      return [];
    }
  }

  // Update product stock by incrementing or decrementing the stock
  async updateStock(id, quantity) {
    try {
      return await Product.findByIdAndUpdate(
        id,
        { $inc: { stock: quantity } },
        { new: true, runValidators: true }
      );
    } catch (error) {
      log.error('Error updating product stock:', error);
      return null;
    }
  }

  // Check if a product has sufficient stock
  async hasStock(id, quantity) {
    try {
      const product = await Product.findById(id);
      return product && product.stock >= quantity;
    } catch (error) {
      log.error('Error checking product stock:', error);
      return false;
    }
  }

  // Search products by text with options (pagination and sort)
  async search(query, options = {}) {
    try {
      const { limit = 10, skip = 0 } = options;
      return await Product.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      log.error('Error searching products:', error);
      return [];
    }
  }

  // Find featured products with options (pagination and sort)
  async findFeatured(options = {}) {
    try {
      const { limit = 10, skip = 0 } = options;
      return await Product.find({ featured: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      log.error('Error finding featured products:', error);
      return [];
    }
  }
}

module.exports = new ProductDAO();
