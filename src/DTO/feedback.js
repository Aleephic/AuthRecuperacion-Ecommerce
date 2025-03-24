// Feedback DTO - Transforms feedback data for client consumption

class FeedbackDTO {
  // Convert a feedback document to a DTO
  static toDTO(feedback) {
    if (!feedback) return null;
    // Convert to plain object if needed
    const feedbackObj = feedback.toObject ? feedback.toObject() : feedback;
    
    return {
      id: feedbackObj._id.toString(),
      title: feedbackObj.title,
      description: feedbackObj.description,
      type: feedbackObj.type,
      status: feedbackObj.status,
      rating: feedbackObj.rating,
      // User info
      userId: feedbackObj.userId ? feedbackObj.userId.toString() : null,
      userEmail: feedbackObj.userEmail || null,
      // Include page URL if available
      pageUrl: feedbackObj.pageUrl || null,
      // Include screenshot path if available
      screenshot: feedbackObj.screenshot || null,
      // Admin response if feedback is resolved
      adminResponse: feedbackObj.adminResponse || null,
      // Timestamps as ISO strings
      createdAt: feedbackObj.createdAt ? feedbackObj.createdAt.toISOString() : null,
      updatedAt: feedbackObj.updatedAt ? feedbackObj.updatedAt.toISOString() : null,
      resolvedAt: feedbackObj.resolvedAt ? feedbackObj.resolvedAt.toISOString() : null
    };
  }

  // Convert an array of feedback documents to DTOs
  static toDTOArray(feedbacks) {
    if (!feedbacks || !Array.isArray(feedbacks)) return [];
    return feedbacks.map(feedback => this.toDTO(feedback));
  }

  // Convert statistics data to a DTO
  static statisticsToDTO(stats) {
    if (!stats) return null;
    return {
      total: stats.total,
      byStatus: stats.byStatus || {},
      byType: stats.byType || {},
      averageRating: stats.averageRating || 0,
      // Timestamp for caching purposes
      timestamp: new Date().toISOString()
    };
  }
  
  // Create a public-safe DTO with limited information
  static toPublicDTO(feedback) {
    if (!feedback) return null;
    const dto = this.toDTO(feedback);
    // Remove sensitive info for public views
    delete dto.userId;
    delete dto.userEmail;
    delete dto.pageUrl;
    delete dto.browserInfo;
    // Remove screenshot if not a bug report
    if (dto.type !== 'bug') {
      delete dto.screenshot;
    }
    return dto;
  }
  
  // Create an admin-view DTO with full details
  static toAdminDTO(feedback) {
    if (!feedback) return null;
    const dto = this.toDTO(feedback);
    const feedbackObj = feedback.toObject ? feedback.toObject() : feedback;
    dto.browserInfo = feedbackObj.browserInfo || null;
    return dto;
  }
}

module.exports = FeedbackDTO;
