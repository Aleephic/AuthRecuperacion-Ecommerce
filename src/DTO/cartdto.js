// Cart DTO - Transforms Cart data for client consumption

const ProductDTO = require('./product.dto');

class CartDTO {
  // Convert a Cart document to a DTO
  static toDTO(cart) {
    if (!cart) return null;
    const cartObj = cart.toObject ? cart.toObject() : cart;
    
    const items = cartObj.items.map(item => {
      const productDTO = typeof item.product === 'object' && item.product !== null
        ? ProductDTO.toDTO(item.product)
        : { id: item.product.toString() };
      
      return {
        id: item._id.toString(),
        product: productDTO,
        quantity: item.quantity,
        price: item.price
      };
    });
    
    return {
      id: cartObj._id.toString(),
      userId: cartObj.user.toString(),
      items,
      total: cartObj.total,
      status: cartObj.status,
      completedAt: cartObj.completedAt,
      createdAt: cartObj.createdAt,
      updatedAt: cartObj.updatedAt
    };
  }
  
  // Convert an array of Cart documents to DTOs
  static toDTOArray(carts) {
    if (!carts || !Array.isArray(carts)) return [];
    return carts.map(cart => CartDTO.toDTO(cart));
  }
}

module.exports = CartDTO;
