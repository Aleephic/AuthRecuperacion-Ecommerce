/**
 * Feedback Data Access Object
 * Handles all database operations for Feedback model
 */
const { Feedback, FEEDBACK_STATUS, FEEDBACK_TYPES } = require('../models/feedback.model');
const { log } = require('../utilities/logger');

class FeedbackDAO {
  /**
   * Find a feedback item by ID
   * @param {string} id - Feedback ID
   * @returns {Promise<Object|null>} Feedback document or null
   */
  async findById(id) {
    try {
      return await Feedback.findById(id);
    } catch (error) {
      log.error('Error finding feedback by ID', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Create a new feedback entry
   * @param {Object} feedbackData - Feedback data
   * @returns {Promise<Object>} Created feedback document
   */
  async create(feedbackData) {
    try {
      const feedback = new Feedback(feedbackData);
      return await feedback.save();
    } catch (error) {
      log.error('Error creating feedback', { error: error.message });
      throw error;
    }
  }

  /**
   * Update a feedback entry
   * @param {string} id - Feedback ID
   * @param {Object} feedbackData - Feedback data to update
   * @returns {Promise<Object|null>} Updated feedback document or null
   */
  async update(id, feedbackData) {
    try {
      return await Feedback.findByIdAndUpdate(
        id,
        feedbackData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      log.error('Error updating feedback', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Delete a feedback entry
   * @param {string} id - Feedback ID
   * @returns {Promise<Object|null>} Deleted feedback document or null
   */
  async delete(id) {
    try {
      return await Feedback.findByIdAndDelete(id);
    } catch (error) {
      log.error('Error deleting feedback', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Get all feedback entries with optional filtering
   * @param {Object} filters - Optional query filters
   * @param {Object} options - Query options (pagination, sort)
   * @returns {Promise<Array>} Array of feedback documents
   */
  async findAll(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
      
      const query = Feedback.find(filters)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);
        
      return await query.exec();
    } catch (error) {
      log.error('Error finding all feedback', { filters, options, error: error.message });
      throw error;
    }
  }

  /**
   * Count feedback entries with optional filtering
   * @param {Object} filters - Optional query filters
   * @returns {Promise<number>} Count of feedback entries
   */
  async count(filters = {}) {
    try {
      return await Feedback.countDocuments(filters);
    } catch (error) {
      log.error('Error counting feedback', { filters, error: error.message });
      throw error;
    }
  }

  /**
   * Get feedback by user ID
   * @param {string} userId - User ID
   * @param {Object} options - Query options (pagination, sort)
   * @returns {Promise<Array>} Array of feedback documents
   */
  async findByUserId(userId, options = {}) {
    try {
      return await this.findAll({ userId }, options);
    } catch (error) {
      log.error('Error finding feedback by user ID', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get feedback by status
   * @param {string} status - Feedback status
   * @param {Object} options - Query options (pagination, sort)
   * @returns {Promise<Array>} Array of feedback documents
   */
  async findByStatus(status, options = {}) {
    try {
      return await this.findAll({ status }, options);
    } catch (error) {
      log.error('Error finding feedback by status', { status, error: error.message });
      throw error;
    }
  }

  /**
   * Get feedback by type
   * @param {string} type - Feedback type
   * @param {Object} options - Query options (pagination, sort)
   * @returns {Promise<Array>} Array of feedback documents
   */
  async findByType(type, options = {}) {
    try {
      return await this.findAll({ type }, options);
    } catch (error) {
      log.error('Error finding feedback by type', { type, error: error.message });
      throw error;
    }
  }

  /**
   * Get feedback statistics
   * @returns {Promise<Object>} Feedback statistics
   */
  async getStatistics() {
    try {
      const stats = {
        total: await this.count(),
        byStatus: {},
        byType: {},
        averageRating: 0
      };
      
      // Count by status
      for (const status of Object.values(FEEDBACK_STATUS)) {
        stats.byStatus[status] = await this.count({ status });
      }
      
      // Count by type
      for (const type of Object.values(FEEDBACK_TYPES)) {
        stats.byType[type] = await this.count({ type });
      }
      
      // Calculate average rating
      const ratingAgg = await Feedback.aggregate([
        { $match: { rating: { $exists: true, $ne: null } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);
      
      if (ratingAgg.length > 0) {
        stats.averageRating = parseFloat(ratingAgg[0].avgRating.toFixed(1));
      }
      
      return stats;
    } catch (error) {
      log.error('Error getting feedback statistics', { error: error.message });
      throw error;
    }
  }
}

// Export a singleton instance
module.exports = new FeedbackDAO();
