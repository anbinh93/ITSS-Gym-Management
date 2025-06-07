import mongoose from "mongoose";
import dotenv from "dotenv";
import { workoutScheduleModel } from "./models/workoutScheduleModel.js";
import { userModel } from "./models/userModel.js";

dotenv.config();

const queryString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority&appName=ClusterFD`;

async function seedSchedules() {
  try {
    await mongoose.connect(queryString);
    console.log("Connected to MongoDB");

    // Tìm user và coach từ database
    const user = await userModel.findOne({ role: 'user' });
    const coach = await userModel.findOne({ role: 'coach' });
    
    console.log("User found:", user?.name);
    console.log("Coach found:", coach?.name);

    if (!user || !coach) {
      console.log("Không tìm thấy user hoặc coach. Vui lòng chạy seed.js trước.");
      process.exit(1);
    }

  // Xóa schedule cũ
  await workoutScheduleModel.deleteMany({});

  // Tạo schedule cho 7 ngày tới
  const today = new Date();
  const schedules = [];

  for (let i = 0; i < 7; i++) {
    const scheduleDate = new Date(today);
    scheduleDate.setDate(today.getDate() + i);
    
    const dateString = scheduleDate.toISOString().split('T')[0];
    
    schedules.push({
      user: user._id,
      coach: coach._id,
      createdBy: coach._id,
      schedule: [
        {
          dayOfWeek: scheduleDate.toLocaleDateString('en-US', { weekday: 'long' }),
          exercises: i % 2 === 0 ? ["Push-ups", "Bench Press", "Shoulder Press"] : ["Pull-ups", "Lat Pulldown", "Rowing"],
          time: `${dateString}`,
          startTime: "08:00",
          endTime: "09:30"
        }
      ],
      note: `Lịch tập ngày ${scheduleDate.toLocaleDateString('vi-VN')} - ${i % 2 === 0 ? 'Push Day' : 'Pull Day'}`
    });
  }

  await workoutScheduleModel.insertMany(schedules);

  console.log("Seed workout schedules thành công!");
  console.log(`Đã tạo ${schedules.length} lịch tập cho user: ${user.name}`);
  
  process.exit();
} catch (error) {
  console.error("Error seeding schedules:", error);
  process.exit(1);
}
}

seedSchedules();
