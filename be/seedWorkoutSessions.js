import mongoose from "mongoose";
import dotenv from "dotenv";
import { workoutSessionModel } from "./models/workoutSessionModel.js";
import { userModel } from "./models/userModel.js";
import { membershipModel } from "./models/membershipModel.js";

dotenv.config();

const queryString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority&appName=ClusterFD`;

async function seedWorkoutSessions() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(queryString);
    console.log("MongoDB connected!");

    // Get users and memberships
    const users = await userModel.find({ role: "user" });
    const memberships = await membershipModel.find({});
    
    console.log(`Found ${users.length} users and ${memberships.length} memberships`);
    
    if (users.length === 0) {
      console.log("No users found. Please seed users first.");
      return;
    }

    // Clear existing workout sessions
    console.log("Deleting old workout session data...");
    await workoutSessionModel.deleteMany({});
    console.log("Old workout session data deleted");

    // Create sample workout sessions
    const workoutSessions = [];
    const exercises = [
      'Push Day', 'Pull Day', 'Leg Day', 'Cardio', 'Full Body',
      'Chest & Triceps', 'Back & Biceps', 'Shoulders', 'Arms', 'Core'
    ];
    
    const statuses = ['completed', 'completed', 'completed', 'checked_in', 'scheduled'];
    
    for (let user of users) {
      // Find membership for this user
      const userMembership = memberships.find(m => m.user?.toString() === user._id.toString());
      
      // Create 15-20 workout sessions per user over the last 3 months
      for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // Random date in last 90 days
        
        const startTime = new Date(date);
        startTime.setHours(8 + Math.floor(Math.random() * 12)); // 8 AM to 8 PM
        startTime.setMinutes([0, 15, 30, 45][Math.floor(Math.random() * 4)]);
        
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 1 + Math.floor(Math.random() * 2)); // 1-3 hour sessions
        
        const session = {
          user: user._id,
          membership: userMembership?._id || null,
          workoutDate: date.toISOString().split('T')[0],
          startTime: startTime.toTimeString().split(' ')[0].slice(0, 5),
          endTime: endTime.toTimeString().split(' ')[0].slice(0, 5),
          exerciseName: exercises[Math.floor(Math.random() * exercises.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          notes: i % 3 === 0 ? `Great workout session #${i + 1}` : '',
          actualStartTime: startTime,
          actualEndTime: endTime,
          createdAt: date,
          updatedAt: date
        };
        
        workoutSessions.push(session);
      }
    }

    console.log(`Creating ${workoutSessions.length} workout sessions...`);
    await workoutSessionModel.insertMany(workoutSessions);
    
    console.log("Workout session seed data created successfully!");
    
    // Print summary
    const sessionStats = await workoutSessionModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log("\n=== WORKOUT SESSION SUMMARY ===");
    sessionStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}`);
    });
    
  } catch (error) {
    console.error("Error seeding workout sessions:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedWorkoutSessions();
