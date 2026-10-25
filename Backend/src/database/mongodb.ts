import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/printit';

const connectDB = async (): Promise<boolean> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB Connected (${MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost') ? 'Local VPS DB' : 'Remote DB'})`);
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

// Test MongoDB connection
export const testMongoDBConnection = async (): Promise<boolean> => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected!');
      return true;
    }
    
    const connected = await connectDB();
    if (connected) {
      console.log('✅ MongoDB connected successfully!');
    }
    return connected;
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

export default connectDB;
