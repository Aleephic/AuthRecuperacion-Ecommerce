// Product Repository
// Business logic layer for product operations

const productDAO = require('../DAO/productDAO');
const ProductDTO = require('../DTO/product.dto');
const { log } = require('../utilities/logger');

class ProductRepository {
  // Get a product by its ID and return a Product DTO or null
  async getProductById(id) {
    try {
      const product = await productDAO.findById(id);
      return product ? ProductDTO.toDTO(product) : null;
    } catch (error) {
      log.error('Error in getProductById:', error);
      return null;
    }
  }
  
  // Get all products with given query options (pagination, sorting)
  async getAllProducts(options = {}) {
    try {
      const products = await productDAO.findAll({}, options);
      return ProductDTO.toDTOArray(products);
    } catch (error) {
      log.error('Error in getAllProducts:', error);
      return [];
    }
  }
  
  // Get products by category with query options
  async getProductsByCategory(category, options = {}) {
    try {
      const products = await productDAO.findByCategory(category, options);
      return ProductDTO.toDTOArray(products);
    } catch (error) {
      log.error('Error in getProductsByCategory:', error);
      return [];
    }
  }
  
  // Create a new product and return the created Product DTO
  async createProduct(productData) {
    try {
      const product = await productDAO.create(productData);
      return ProductDTO.toDTO(product);
    } catch (error) {
      log.error('Error in createProduct:', error);
      throw error;
    }
  }
  
  // Update an existing product and return the updated Product DTO, or null if not found
  async updateProduct(id, productData) {
    try {
      const product = await productDAO.update(id, productData);
      return product ? ProductDTO.toDTO(product) : null;
    } catch (error) {
      log.error('Error in updateProduct:', error);
      throw error;
    }
  }
  
  // Delete a product and return true if deletion was successful
  async deleteProduct(id) {
    try {
      const result = await productDAO.delete(id);
      return !!result;
    } catch (error) {
      log.error('Error in deleteProduct:', error);
      return false;
    }
  }
  
  // Update product stock by adding or subtracting a quantity and return the updated Product DTO
  async updateProductStock(id, quantity) {
    try {
      const product = await productDAO.updateStock(id, quantity);
      return product ? ProductDTO.toDTO(product) : null;
    } catch (error) {
      log.error('Error in updateProductStock:', error);
      return null;
    }
  }
  
  // Check if the product has enough stock for a given quantity
  async hasEnoughStock(id, quantity) {
    try {
      return await productDAO.hasStock(id, quantity);
    } catch (error) {
      log.error('Error in hasEnoughStock:', error);
      return false;
    }
  }
  
  // Search for products matching a query with given options
  async searchProducts(query, options = {}) {
    try {
      const products = await productDAO.search(query, options);
      return ProductDTO.toDTOArray(products);
    } catch (error) {
      log.error('Error in searchProducts:', error);
      return [];
    }
  }
  
  // Get featured products with query options
  async getFeaturedProducts(options = {}) {
    try {
      const products = await productDAO.findFeatured(options);
      return ProductDTO.toDTOArray(products);
    } catch (error) {
      log.error('Error in getFeaturedProducts:', error);
      return [];
    }
  }
}

module.exports = new ProductRepository();
