/*
 * MongoDB Database connection utility
 */
const mongoose = require('mongoose');
const { log } = require('./logger');

async function connectToMongo() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    
    // Configure 
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    };
    
    // Connect
    await mongoose.connect(mongoURI, options);
    
    log.info('MongoDB connection established successfully');
    
    mongoose.connection.on('error', (err) => {
      log.error('MongoDB connection error', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      log.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      log.info('MongoDB reconnected');
    });
    
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        log.info('MongoDB connection closed due to app termination');
        process.exit(0);
      } catch (error) {
        log.error('Error during MongoDB connection closure', error);
        process.exit(1);
      }
    });
    
    return mongoose.connection;
  } catch (error) {
    log.fatal('Failed to connect to MongoDB', error);
    throw error;
  }
}

module.exports = {
  connectToMongo
};
