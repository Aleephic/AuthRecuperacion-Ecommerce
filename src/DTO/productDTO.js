// Product DTO - Transforms product data for client use

class ProductDTO {
  // Convert a product document to a DTO
  static toDTO(product) {
    if (!product) return null;
    const productObj = product.toObject ? product.toObject() : product;
    
    return {
      id: productObj._id.toString(),
      name: productObj.name,
      description: productObj.description,
      price: productObj.price,
      category: productObj.category,
      stock: productObj.stock,
      imageUrl: productObj.imageUrl,
      featured: productObj.featured,
      createdAt: productObj.createdAt,
      updatedAt: productObj.updatedAt
    };
  }
  
  // Convert an array of product documents to DTOs
  static toDTOArray(products) {
    if (!products || !Array.isArray(products)) return [];
    return products.map(product => ProductDTO.toDTO(product));
  }
}

module.exports = ProductDTO;

