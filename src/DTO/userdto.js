// User DTO - Transforms user data for client consumption

class UserDTO {
  // Convert a User document to a DTO (excluding sensitive data)
  static toDTO(user) {
    if (!user) return null;
    // Convert Mongoose document to plain object if needed
    const userObj = user.toObject ? user.toObject() : user;
    return {
      id: userObj._id.toString(),
      username: userObj.username,
      email: userObj.email,
      role: userObj.role,
      createdAt: userObj.createdAt,
      lastLogin: userObj.lastLogin
      // Exclude password, reset tokens, etc.
    };
  }

  // Convert an array of User documents to DTOs
  static toDTOArray(users) {
    if (!users || !Array.isArray(users)) return [];
    return users.map(user => UserDTO.toDTO(user));
  }
}

module.exports = UserDTO;
