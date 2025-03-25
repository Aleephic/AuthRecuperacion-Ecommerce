// Main application server

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { connectToMongo } = require('./utilities/db');
const { log, stream } = require('./utilities/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
// Import other routes as needed

async function startServer() {
  const app = express();

  // Connect to MongoDB
  await connectToMongo();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Log HTTP requests
  app.use(morgan('dev', { stream }));

  // Register API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/feedback', feedbackRoutes);
  // Other routes can be added here

  // Test route
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'E-commerce API is running',
      version: '1.0.0'
    });
  });

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    log.info(`Server running on port ${PORT}`);
  });

  return app;
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer().catch(error => {
    log.fatal('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = { startServer };
