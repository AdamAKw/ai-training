import mongoose from 'mongoose';

// Define a variable to track connection status
let isConnected = false;

/**
 * Establishes a connection to MongoDB if not already connected
 */
export const connectToDatabase = async () => {
  // If already connected, return
  if (isConnected) {
    return;
  }

  // Exit if no MongoDB URI is found
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  try {
    // Set strict query mode to prepare for future mongoose versions
    mongoose.set('strictQuery', true);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    isConnected = true;
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Disconnects from the MongoDB database
 */
export const disconnectFromDatabase = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected.');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};
