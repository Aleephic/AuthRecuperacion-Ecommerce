// Feedback Model
// Handles feedback and bug reports from users

const mongoose = require('mongoose');

// Enum for feedback status tracking
const FEEDBACK_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

// Enum for feedback types
const FEEDBACK_TYPES = {
  FEEDBACK: 'feedback',
  BUG: 'bug',
  FEATURE: 'feature',
  OTHER: 'other'
};

const feedbackSchema = new mongoose.Schema({
  // Basic feedback details
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  type: {
    type: String,
    required: [true, 'Feedback type is required'],
    enum: {
      values: Object.values(FEEDBACK_TYPES),
      message: 'Invalid feedback type'
    },
    default: FEEDBACK_TYPES.FEEDBACK
  },
  // Optional rating (only required for feedback type)
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    validate: {
      validator: function(value) {
        // Rating is required only when type is not feedback
        return this.type !== FEEDBACK_TYPES.FEEDBACK || value !== undefined;
      },
      message: 'Rating is required for feedback type'
    }
  },
  // Status tracking
  status: {
    type: String,
    enum: {
      values: Object.values(FEEDBACK_STATUS),
      message: 'Invalid status'
    },
    default: FEEDBACK_STATUS.OPEN
  },
  // User association (optional for anonymous feedback)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  // Email for anonymous feedback
  userEmail: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address`
    }
  },
  // Additional info for bug reports
  pageUrl: {
    type: String,
    trim: true
  },
  browserInfo: {
    type: mongoose.Schema.Types.Mixed
  },
  // Screenshot file path for bug reports
  screenshot: {
    type: String,
    trim: true
  },
  // Admin response for resolved feedback
  adminResponse: {
    type: String,
    trim: true,
    maxlength: [2000, 'Admin response cannot be more than 2000 characters']
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  }
});

// Update updatedAt on save; set resolvedAt when feedback is marked as resolved
feedbackSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isModified('status') && this.status === FEEDBACK_STATUS.RESOLVED && !this.resolvedAt) {
    this.resolvedAt = Date.now();
  }
  next();
});

// Indexes for improved query performance
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ type: 1 });
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = {
  Feedback,
  FEEDBACK_STATUS,
  FEEDBACK_TYPES
};
