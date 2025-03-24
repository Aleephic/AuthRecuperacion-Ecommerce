// Feedback Data Access Object
// Handles database operations for the Feedback model

const { Feedback, FEEDBACK_STATUS, FEEDBACK_TYPES } = require('../models/feedback.model');
const { log } = require('../utilities/logger');

class FeedbackDAO {
  // Find a feedback item by its ID
  async findById(id) {
    try {
      return await Feedback.findById(id);
    } catch (error) {
      log.error('Error finding feedback by ID', { id, error: error.message });
      throw error;
    }
  }

  // Create a new feedback entry
  async create(feedbackData) {
    try {
      const feedback = new Feedback(feedbackData);
      return await feedback.save();
    } catch (error) {
      log.error('Error creating feedback', { error: error.message });
      throw error;
    }
  }

  // Update a feedback entry by ID
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

  // Delete a feedback entry by ID
  async delete(id) {
    try {
      return await Feedback.findByIdAndDelete(id);
    } catch (error) {
      log.error('Error deleting feedback', { id, error: error.message });
      throw error;
    }
  }

  // Get all feedback entries with optional filters and pagination
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

  // Count feedback entries with optional filters
  async count(filters = {}) {
    try {
      return await Feedback.countDocuments(filters);
    } catch (error) {
      log.error('Error counting feedback', { filters, error: error.message });
      throw error;
    }
  }

  // Get feedback entries by user ID
  async findByUserId(userId, options = {}) {
    try {
      return await this.findAll({ userId }, options);
    } catch (error) {
      log.error('Error finding feedback by user ID', { userId, error: error.message });
      throw error;
    }
  }

  // Get feedback entries by status
  async findByStatus(status, options = {}) {
    try {
      return await this.findAll({ status }, options);
    } catch (error) {
      log.error('Error finding feedback by status', { status, error: error.message });
      throw error;
    }
  }

  // Get feedback entries by type
  async findByType(type, options = {}) {
    try {
      return await this.findAll({ type }, options);
    } catch (error) {
      log.error('Error finding feedback by type', { type, error: error.message });
      throw error;
    }
  }

  // Get statistics about feedback entries
  async getStatistics() {
    try {
      const stats = {
        total: await this.count(),
        byStatus: {},
        byType: {},
        averageRating: 0
      };

      // Count feedback per status
      for (const status of Object.values(FEEDBACK_STATUS)) {
        stats.byStatus[status] = await this.count({ status });
      }

      // Count feedback per type
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

// Export a singleton instance of FeedbackDAO
module.exports = new FeedbackDAO();
