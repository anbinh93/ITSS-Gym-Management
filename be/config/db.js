import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const queryString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority&appName=ClusterFD`;

// Connecting to the database
export const connectDB = async () => {
    mongoose.connect(queryString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log('MongoDB connected!'))
        .catch(err => console.log('MongoDB connection error:', err.message));
};