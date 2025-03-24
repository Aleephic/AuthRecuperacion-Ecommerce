// Feedback Repository
// Business logic layer for feedback operations

const feedbackDAO = require('../DAO/feedbackDAO');
const FeedbackDTO = require('../DTO/feedback.dto');
const { FEEDBACK_STATUS } = require('../models/feedback.model');
const { log } = require('../utilities/logger');

class FeedbackRepository {
  // Get a feedback item by its ID and convert it to a DTO
  async getFeedbackById(id) {
    try {
      const feedback = await feedbackDAO.findById(id);
      return FeedbackDTO.toDTO(feedback);
    } catch (error) {
      log.error('Repository error getting feedback by ID', { id, error: error.message });
      throw error;
    }
  }

  // Create new feedback with default status and timestamps
  async createFeedback(feedbackData) {
    try {
      const newFeedback = {
        ...feedbackData,
        status: FEEDBACK_STATUS.OPEN,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const feedback = await feedbackDAO.create(newFeedback);
      return FeedbackDTO.toDTO(feedback);
    } catch (error) {
      log.error('Repository error creating feedback', { error: error.message });
      throw error;
    }
  }

  // Update an existing feedback item with new data and update timestamp
  async updateFeedback(id, feedbackData) {
    try {
      const existingFeedback = await feedbackDAO.findById(id);
      if (!existingFeedback) return null;
      
      const updatedData = {
        ...feedbackData,
        updatedAt: new Date()
      };
      
      const feedback = await feedbackDAO.update(id, updatedData);
      return FeedbackDTO.toDTO(feedback);
    } catch (error) {
      log.error('Repository error updating feedback', { id, error: error.message });
      throw error;
    }
  }

  // Delete a feedback item by its ID
  async deleteFeedback(id) {
    try {
      const result = await feedbackDAO.delete(id);
      return result !== null;
    } catch (error) {
      log.error('Repository error deleting feedback', { id, error: error.message });
      throw error;
    }
  }

  // Get all feedback items with pagination and filtering options
  async getAllFeedback(filters = {}, options = {}) {
    try {
      const feedbacks = await feedbackDAO.findAll(filters, options);
      const total = await feedbackDAO.count(filters);
      const { page = 1, limit = 10 } = options;
      
      return {
        items: FeedbackDTO.toDTOArray(feedbacks),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      log.error('Repository error getting all feedback', { filters, options, error: error.message });
      throw error;
    }
  }

  // Get feedback items for a specific user with options
  async getFeedbackByUserId(userId, options = {}) {
    try {
      const feedbacks = await feedbackDAO.findByUserId(userId, options);
      return FeedbackDTO.toDTOArray(feedbacks);
    } catch (error) {
      log.error('Repository error getting feedback by user ID', { userId, error: error.message });
      throw error;
    }
  }

  // Get feedback items filtered by status
  async getFeedbackByStatus(status, options = {}) {
    try {
      const feedbacks = await feedbackDAO.findByStatus(status, options);
      return FeedbackDTO.toDTOArray(feedbacks);
    } catch (error) {
      log.error('Repository error getting feedback by status', { status, error: error.message });
      throw error;
    }
  }

  // Get feedback items filtered by type
  async getFeedbackByType(type, options = {}) {
    try {
      const feedbacks = await feedbackDAO.findByType(type, options);
      return FeedbackDTO.toDTOArray(feedbacks);
    } catch (error) {
      log.error('Repository error getting feedback by type', { type, error: error.message });
      throw error;
    }
  }

  // Get aggregated feedback statistics and convert them to a DTO
  async getFeedbackStatistics() {
    try {
      const stats = await feedbackDAO.getStatistics();
      return FeedbackDTO.statisticsToDTO(stats);
    } catch (error) {
      log.error('Repository error getting feedback statistics', { error: error.message });
      throw error;
    }
  }

  // Resolve feedback by updating its status, admin response, and timestamps
  async resolveFeedback(id, adminResponse) {
    try {
      const existingFeedback = await feedbackDAO.findById(id);
      if (!existingFeedback) return null;
      
      const updatedData = {
        status: FEEDBACK_STATUS.RESOLVED,
        adminResponse,
        resolvedAt: new Date(),
        updatedAt: new Date()
      };
      
      const feedback = await feedbackDAO.update(id, updatedData);
      return FeedbackDTO.toDTO(feedback);
    } catch (error) {
      log.error('Repository error resolving feedback', { id, error: error.message });
      throw error;
    }
  }
  
  // Create one-click feedback using a simple rating and page URL
  async createOneClickFeedback(rating, pageUrl, type = 'feedback') {
    try {
      const feedbackData = {
        title: `${type === 'feedback' ? 'Rating' : 'Quick'} Feedback: ${rating}/5`,
        description: `User submitted a ${rating}-star rating for ${pageUrl || 'the application'}`,
        type,
        rating,
        pageUrl,
        status: FEEDBACK_STATUS.OPEN
      };
      return await this.createFeedback(feedbackData);
    } catch (error) {
      log.error('Repository error creating one-click feedback', { rating, pageUrl, error: error.message });
      throw error;
    }
  }
  
  // Create a bug report with screenshot and additional info
  async createBugReport(bugData) {
    try {
      const feedbackData = {
        title: bugData.title,
        description: bugData.description,
        type: 'bug',
        pageUrl: bugData.pageUrl,
        browserInfo: bugData.browserInfo,
        screenshot: bugData.screenshot,
        status: FEEDBACK_STATUS.OPEN
      };
      
      if (bugData.userEmail) {
        feedbackData.userEmail = bugData.userEmail;
      }
      
      if (bugData.userId) {
        feedbackData.userId = bugData.userId;
      }
      
      return await this.createFeedback(feedbackData);
    } catch (error) {
      log.error('Repository error creating bug report', { error: error.message });
      throw error;
    }
  }
}

module.exports = new FeedbackRepository();
