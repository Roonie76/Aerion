import mongoose from 'mongoose';

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    // eslint-disable-next-line no-console
    console.warn('MONGODB_URI is not configured. Running without database connection.');
    return false;
  }

  try {
    await mongoose.connect(mongoUri);
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`MongoDB connection failed: ${error.message}`);
    return false;
  }
}
