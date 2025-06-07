import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

export const connectDatabase = async () => {
  const queryString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority&appName=ClusterFD`;
  
  try {
    await mongoose.connect(queryString);
    console.log('✅ Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
  }
};

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const clearCollection = async (model, name) => {
  try {
    await model.deleteMany({});
    console.log(`✅ Cleared ${name} collection`);
  } catch (error) {
    console.error(`❌ Error clearing ${name} collection:`, error.message);
  }
};

export const createRandomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

export const generateRandomDuration = (min = 30, max = 120) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};
