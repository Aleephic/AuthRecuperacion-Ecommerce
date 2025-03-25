// Feedback Routes
// Defines endpoints for submitting and managing feedback and bug reports

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const feedbackController = require('../controllers/feedbackController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
const { handleScreenshotUpload } = require('../middlewares/fileUploadMiddleware');

// Validation rules for feedback creation
const feedbackValidation = [
  check('type', 'Type is required').isIn(['feedback', 'bug', 'feature', 'other']),
  check('title', 'Title is required and must be less than 100 characters')
    .not().isEmpty().trim().isLength({ max: 100 }),
  check('description', 'Description is required and must be less than 2000 characters')
    .not().isEmpty().trim().isLength({ max: 2000 }),
  check('rating', 'Rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 }),
  check('pageUrl', 'Page URL must be a valid URL').optional().isURL(),
  check('browserInfo', 'Browser info must be an object').optional()
];

// Validation rules for one-click feedback
const oneClickFeedbackValidation = [
  check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
  check('pageUrl', 'Page URL must be a valid URL').optional().isURL(),
  check('type', 'Type must be a valid feedback type')
    .optional().isIn(['feedback', 'bug', 'feature', 'other'])
];

// Validation rules for bug report submission
const bugReportValidation = [
  check('title', 'Title is required and must be less than 100 characters')
    .not().isEmpty().trim().isLength({ max: 100 }),
  check('description', 'Description is required and must be less than 2000 characters')
    .not().isEmpty().trim().isLength({ max: 2000 }),
  check('pageUrl', 'Page URL must be a valid URL').optional().isURL(),
  check('browserInfo', 'Browser info must be an object').optional()
];

// Validation rules for resolving feedback (admin only)
const resolveValidation = [
  check('adminResponse', 'Admin response is required').not().isEmpty().trim()
];

// Public routes (no authentication required)
router.post('/one-click', oneClickFeedbackValidation, feedbackController.submitOneClickFeedback);
router.post('/bug-report', handleScreenshotUpload, bugReportValidation, feedbackController.submitBugReport);
router.post('/', feedbackValidation, feedbackController.createFeedback);

// Protected routes (authentication required)
router.get('/', isAuthenticated, feedbackController.getAllFeedback);
router.get('/:id', isAuthenticated, feedbackController.getFeedbackById);
router.put('/:id', isAuthenticated, feedbackValidation, feedbackController.updateFeedback);
router.delete('/:id', isAuthenticated, feedbackController.deleteFeedback);

// Admin-only routes
router.get('/stats/overview', isAuthenticated, isAdmin, feedbackController.getFeedbackStatistics);
router.post('/:id/resolve', isAuthenticated, isAdmin, resolveValidation, feedbackController.resolveFeedback);

// Serve static uploaded files
router.use('/uploads', express.static('uploads'));

module.exports = router;
