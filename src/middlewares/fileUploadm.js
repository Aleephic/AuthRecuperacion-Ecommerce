// File Upload Middleware
// Handles file uploads for screenshots and other attachments

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { log } = require('../utilities/logger');

// Ensure upload directories exist
const createDirectories = () => {
  const uploadDir = path.join(__dirname, '../../uploads');
  const screenshotsDir = path.join(uploadDir, 'screenshots');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    log.info('Created uploads directory');
  }

  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    log.info('Created screenshots directory');
  }
};

// Create directories on server startup
createDirectories();

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store screenshots in the screenshots directory
    if (file.fieldname === 'screenshot') {
      cb(null, path.join(__dirname, '../../uploads/screenshots'));
    } else {
      // Store other attachments in the main uploads directory
      cb(null, path.join(__dirname, '../../uploads'));
    }
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using uuid and the original extension
    const uniqueId = uuidv4();
    const fileExt = path.extname(file.originalname);
    cb(null, `${uniqueId}${fileExt}`);
  }
});

// File filter to only allow images for screenshots
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'screenshot') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed for screenshots'), false);
    }
  } else {
    // Accept all other files (or add additional validation as needed)
    cb(null, true);
  }
};

// Create the multer upload instance with a 5MB file size limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middleware for handling single screenshot uploads
const uploadScreenshot = upload.single('screenshot');

// Wrapper middleware to handle multer errors
const handleScreenshotUpload = (req, res, next) => {
  uploadScreenshot(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // Handle multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File size exceeds the 5MB limit'
          });
        }
        return res.status(400).json({
          success: false,
          error: `Upload error: ${err.message}`
        });
      }
      // Handle other errors
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    // If file was uploaded, add the file path to the request body
    if (req.file) {
      req.body.screenshot = `/uploads/screenshots/${req.file.filename}`;
      log.info(`Screenshot uploaded: ${req.file.filename}`);
    }

    next();
  });
};

module.exports = {
  handleScreenshotUpload
};
