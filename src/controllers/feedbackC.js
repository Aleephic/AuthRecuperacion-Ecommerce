// Feedback Controller

const { validationResult } = require('express-validator');
const feedbackRepository = require('../repositories/feedbackRepository');
const { log } = require('../utilities/logger');

async function getAllFeedback(req, res, next) {
  try {
    // Extract query params and build filters
    const { page = 1, limit = 10, status, type, userId, sortBy = 'createdAt', sortOrder = -1 } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (userId) filters.userId = userId;

    // Non-admins see only their feedback
    if (!req.user.isAdmin && req.user.id) {
      filters.userId = req.user.id;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: parseInt(sortOrder)
    };

    const result = await feedbackRepository.getAllFeedback(filters, options);
    res.status(200).json(result);
  } catch (error) {
    log.error('Error in getAllFeedback controller', { error: error.message });
    next(error);
  }
}

async function getFeedbackById(req, res, next) {
  try {
    const { id } = req.params;
    const feedback = await feedbackRepository.getFeedbackById(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    // Allow only admin or owner to access feedback
    if (!req.user.isAdmin && feedback.userId !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.status(200).json(feedback);
  } catch (error) {
    log.error('Error in getFeedbackById controller', { id: req.params.id, error: error.message });
    next(error);
  }
}

async function createFeedback(req, res, next) {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Attach userId if authenticated
    const feedbackData = { ...req.body };
    if (req.isAuthenticated() && req.user.id) {
      feedbackData.userId = req.user.id;
    }

    const feedback = await feedbackRepository.createFeedback(feedbackData);
    res.status(201).json(feedback);
  } catch (error) {
    log.error('Error in createFeedback controller', { error: error.message });
    next(error);
  }
}

async function updateFeedback(req, res, next) {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const existingFeedback = await feedbackRepository.getFeedbackById(id);
    if (!existingFeedback) return res.status(404).json({ message: 'Feedback not found' });

    // Allow update for admin or owner only
    if (!req.user.isAdmin && existingFeedback.userId !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fields allowed to update
    const { title, description, type, rating } = req.body;
    const updateData = { title, description, type, rating };
    if (req.user.isAdmin && req.body.status) {
      updateData.status = req.body.status;
    }

    const feedback = await feedbackRepository.updateFeedback(id, updateData);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.status(200).json(feedback);
  } catch (error) {
    log.error('Error in updateFeedback controller', { id: req.params.id, error: error.message });
    next(error);
  }
}

async function deleteFeedback(req, res, next) {
  try {
    const { id } = req.params;
    const existingFeedback = await feedbackRepository.getFeedbackById(id);
    if (!existingFeedback) return res.status(404).json({ message: 'Feedback not found' });

    // Allow deletion for admin or owner only
    if (!req.user.isAdmin && existingFeedback.userId !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const success = await feedbackRepository.deleteFeedback(id);
    if (!success) return res.status(404).json({ message: 'Feedback not found' });
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    log.error('Error in deleteFeedback controller', { id: req.params.id, error: error.message });
    next(error);
  }
}

async function getFeedbackStatistics(req, res, next) {
  try {
    const stats = await feedbackRepository.getFeedbackStatistics();
    res.status(200).json(stats);
  } catch (error) {
    log.error('Error in getFeedbackStatistics controller', { error: error.message });
    next(error);
  }
}

async function resolveFeedback(req, res, next) {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { adminResponse } = req.body;
    const feedback = await feedbackRepository.resolveFeedback(id, adminResponse);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.status(200).json(feedback);
  } catch (error) {
    log.error('Error in resolveFeedback controller', { id: req.params.id, error: error.message });
    next(error);
  }
}

async function submitOneClickFeedback(req, res, next) {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { rating, pageUrl, type = 'feedback' } = req.body;
    const feedback = await feedbackRepository.createOneClickFeedback(parseInt(rating), pageUrl, type);
    res.status(201).json({ success: true, message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    log.error('Error in submitOneClickFeedback controller', { error: error.message });
    next(error);
  }
}

async function submitBugReport(req, res, next) {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, pageUrl, browserInfo, userEmail } = req.body;
    const bugData = {
      title,
      description,
      pageUrl,
      userEmail,
      browserInfo: typeof browserInfo === 'string' ? JSON.parse(browserInfo) : browserInfo
    };

    if (req.body.screenshot) {
      bugData.screenshot = req.body.screenshot;
    }

    if (req.isAuthenticated() && req.user) {
      bugData.userId = req.user.id;
    }

    const feedback = await feedbackRepository.createBugReport(bugData);
    res.status(201).json({ success: true, message: 'Bug report submitted successfully', feedback });
  } catch (error) {
    log.error('Error in submitBugReport controller', { error: error.message });
    next(error);
  }
}

module.exports = {
  getAllFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackStatistics,
  resolveFeedback,
  submitOneClickFeedback,
  submitBugReport
};
