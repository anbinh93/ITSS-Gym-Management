import mongoose from "mongoose";
import dotenv from "dotenv";
import { userModel } from "./models/userModel.js";
import { packageModel } from "./models/packageModel.js";
import { membershipModel } from "./models/membershipModel.js";
import { workoutSessionModel } from "./models/workoutSessionModel.js";
import bcrypt from "bcrypt";

dotenv.config();

const queryString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority&appName=ClusterFD`;

async function seedMembers() {
  await mongoose.connect(queryString);

  // Get existing packages
  const packages = await packageModel.find({});
  console.log('Found packages:', packages.length);

  // Create member users
  const memberUsers = [
    {
      name: "Alice Johnson",
      email: "alice@gmail.com",
      password: await bcrypt.hash("Member@123", 10),
      role: "member",
      gender: "Female",
      phone: "0987654321",
      birthYear: 1995,
      username: "alice"
    },
    {
      name: "Bob Smith",
      email: "bob@gmail.com", 
      password: await bcrypt.hash("Member@123", 10),
      role: "member",
      gender: "Male",
      phone: "0987654322",
      birthYear: 1990,
      username: "bob"
    },
    {
      name: "Carol Davis",
      email: "carol@gmail.com",
      password: await bcrypt.hash("Member@123", 10),
      role: "member", 
      gender: "Female",
      phone: "0987654323",
      birthYear: 1992,
      username: "carol"
    },
    {
      name: "David Wilson",
      email: "david@gmail.com",
      password: await bcrypt.hash("Member@123", 10),
      role: "member",
      gender: "Male", 
      phone: "0987654324",
      birthYear: 1988,
      username: "david"
    },
    {
      name: "Eva Brown",
      email: "eva@gmail.com",
      password: await bcrypt.hash("Member@123", 10),
      role: "member",
      gender: "Female",
      phone: "0987654325", 
      birthYear: 1994,
      username: "eva"
    }
  ];

  const createdMembers = await userModel.create(memberUsers);
  console.log('Created members:', createdMembers.length);

  // Create memberships for each member
  if (packages.length > 0) {
    const memberships = createdMembers.map((member, index) => ({
      user: member._id,
      package: packages[index % packages.length]._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentMethod: index % 2 === 0 ? "CASH" : "BANK_TRANSFER",
      status: "ACTIVE"
    }));

    await membershipModel.create(memberships);
    console.log('Created memberships:', memberships.length);
  }

  // Create workout sessions for each member
  const exercises = [
    'Push-ups', 'Pull-ups', 'Squats', 'Deadlifts', 'Bench Press', 
    'Cardio', 'Leg Press', 'Shoulder Press', 'Bicep Curls', 'Tricep Dips',
    'Running', 'Cycling', 'Rowing', 'Lat Pulldowns', 'Chest Fly'
  ];

  const statuses = ['completed', 'checked_in', 'scheduled'];

  for (const member of createdMembers) {
    const workoutSessions = [];
    
    // Create 15 sessions per member over the last 2 months
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 60); // Random day in last 60 days
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() - daysAgo);
      
      const session = {
        user: member._id,
        exerciseName: exercises[Math.floor(Math.random() * exercises.length)],
        scheduledDate: scheduledDate,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        duration: Math.floor(Math.random() * 90) + 30, // 30-120 minutes
        notes: `Training session ${i + 1} for ${member.name}`,
        createdAt: scheduledDate,
        updatedAt: scheduledDate
      };

      // Add check-in/out times for completed sessions
      if (session.status === 'completed') {
        session.checkInTime = new Date(scheduledDate.getTime() + Math.random() * 30 * 60000); // Random within 30 mins
        session.checkOutTime = new Date(session.checkInTime.getTime() + session.duration * 60000);
      } else if (session.status === 'checked_in') {
        session.checkInTime = new Date(scheduledDate.getTime() + Math.random() * 30 * 60000);
      }

      workoutSessions.push(session);
    }

    await workoutSessionModel.create(workoutSessions);
    console.log(`Created ${workoutSessions.length} workout sessions for ${member.name}`);
  }

  console.log('✅ Member seeding completed successfully!');
  mongoose.disconnect();
}

seedMembers().catch(console.error);
