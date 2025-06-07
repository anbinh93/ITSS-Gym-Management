import mongoose from "mongoose";
import dotenv from "dotenv";
import { progressModel } from "./models/progressModel.js";
import { userModel } from "./models/userModel.js";

dotenv.config();

const queryString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority&appName=ClusterFD`;

async function seedProgress() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(queryString);
    console.log("MongoDB connected!");

    // Lấy user có role là "user"
    console.log("Fetching users...");
    const users = await userModel.find({ role: "user" });
    console.log(`Found ${users.length} users with role 'user'`);
    
    if (users.length === 0) {
      console.log("Không tìm thấy user nào với role 'user'");
      return;
    }

    // Xóa progress cũ
    console.log("Deleting old progress data...");
    await progressModel.deleteMany({});
    console.log("Old progress data deleted");

    // Tạo progress data mẫu cho mỗi user
    for (const user of users) {
      console.log(`Creating progress for user: ${user.name} (${user._id})`);
      const progressData = {
        user: user._id,
        weightHeight: [
          { date: "2024-01-01", weight: 70, height: 170 },
          { date: "2024-02-01", weight: 72, height: 170 },
          { date: "2024-03-01", weight: 74, height: 170 },
          { date: "2024-04-01", weight: 73, height: 170 },
          { date: "2024-05-01", weight: 71, height: 170 }
        ],
        calories: [
          { date: "2024-01-01", goal: 2000, actual: 1800 },
          { date: "2024-02-01", goal: 2000, actual: 2100 },
          { date: "2024-03-01", goal: 2000, actual: 1950 },
          { date: "2024-04-01", goal: 2000, actual: 2050 },
          { date: "2024-05-01", goal: 2000, actual: 1900 }
        ],
        bodyFat: [
          { date: "2024-01-01", value: 15 },
          { date: "2024-02-01", value: 14.5 },
          { date: "2024-03-01", value: 14 },
          { date: "2024-04-01", value: 13.8 },
          { date: "2024-05-01", value: 13.5 }
        ]
      };

      await progressModel.create(progressData);
      console.log(`Đã tạo progress data cho user: ${user.name}`);
    }

    console.log("Seed progress data thành công!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Lỗi khi seed progress data:", error);
  }
}

seedProgress();
