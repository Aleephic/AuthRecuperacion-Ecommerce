// Product Controller

const productRepository = require('../repositories/productRepository');
const { log } = require('../utilities/logger');

exports.getAllProducts = async (req, res) => {
  try {
    // Parse pagination and sorting query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    const options = {
      skip: (page - 1) * limit,
      limit,
      sort: { [sortBy]: sortOrder }
    };

    const products = await productRepository.getAllProducts(options);
    
    res.status(200).json({
      success: true,
      count: products.length,
      page,
      limit,
      products
    });
  } catch (error) {
    log.error('Error in getAllProducts controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching products',
      error: error.message
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productRepository.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    log.error('Error in getProductById controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching product',
      error: error.message
    });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Parse pagination and sorting query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    const options = {
      skip: (page - 1) * limit,
      limit,
      sort: { [sortBy]: sortOrder }
    };

    const products = await productRepository.getProductsByCategory(category, options);
    
    res.status(200).json({
      success: true,
      count: products.length,
      page,
      limit,
      category,
      products
    });
  } catch (error) {
    log.error('Error in getProductsByCategory controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching products by category',
      error: error.message
