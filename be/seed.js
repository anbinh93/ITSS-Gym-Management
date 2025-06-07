import mongoose from "mongoose";
import dotenv from "dotenv";
import { equipmentModel } from "./models/equipmentModel.js";
import { userModel } from "./models/userModel.js";
import { packageModel } from "./models/packageModel.js";
import { membershipModel } from "./models/membershipModel.js";
import bcrypt from "bcrypt";

dotenv.config();

const queryString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority&appName=ClusterFD`;

async function seed() {
  await mongoose.connect(queryString);

  // Xoá dữ liệu cũ (nếu có)
  await equipmentModel.deleteMany({});
  await userModel.deleteMany({});
  await packageModel.deleteMany({});
  await membershipModel.deleteMany({});

  // Seed user
  const users = [
    {
      name: "Admin User",
      email: "admin@gym.com",
      password: await bcrypt.hash("admin123456", 10),
      role: "admin",
      gender: "Male",
      phone: "0123456789",
      birthYear: 1990,
      username: "admin"
    },
    {
      name: "Staff Member",
      email: "staff@gym.com",
      password: await bcrypt.hash("staff123456", 10),
      role: "staff",
      gender: "Female",
      phone: "0123456790",
      birthYear: 1992,
      username: "staff"
    },
    {
      name: "Personal Trainer",
      email: "coach@gym.com",
      password: await bcrypt.hash("coach123456", 10),
      role: "coach",
      gender: "Male",
      phone: "0123456791",
      birthYear: 1993,
      username: "coach"
    },
    {
      name: "John Doe",
      email: "user@gym.com",
      password: await bcrypt.hash("user123456", 10),
      role: "user",
      gender: "Male",
      phone: "0123456792",
      birthYear: 1995,
      username: "user"
    }
  ];
  const createdUsers = await userModel.create(users);

  // Seed equipment
  const equipmentData = [
    {
      name: "Máy chạy bộ",
      quantity: 8,
      condition: "Good",
      purchaseDate: new Date("2023-01-15"),
      warrantyExpiry: new Date("2025-01-15"),
      notes: "Thiết bị cardio chính"
    },
    {
      name: "Tạ tay 10kg",
      quantity: 20,
      condition: "Good", 
      purchaseDate: new Date("2022-06-10"),
      warrantyExpiry: new Date("2024-06-10"),
      notes: "Tạ tay cho tập luyện sức mạnh"
    },
    {
      name: "Xe đạp tập",
      quantity: 6,
      condition: "Needs Maintenance",
      purchaseDate: new Date("2021-11-20"),
      warrantyExpiry: new Date("2023-11-20"),
      notes: "Cần bảo trì định kỳ"
    },
    {
      name: "Xà kép",
      quantity: 4,
      condition: "Good",
      purchaseDate: new Date("2023-03-01"),
      warrantyExpiry: new Date("2025-03-01"),
      notes: "Thiết bị tập ngực và tay"
    },
    {
      name: "Máy kéo tạ",
      quantity: 2,
      condition: "Broken",
      purchaseDate: new Date("2020-08-15"),
      warrantyExpiry: new Date("2022-08-15"),
      notes: "Cần sửa chữa khẩn cấp"
    },
    {
      name: "Thảm tập yoga",
      quantity: 25,
      condition: "Good",
      purchaseDate: new Date("2023-05-10"),
      warrantyExpiry: new Date("2024-05-10"),
      notes: "Thảm cho lớp yoga và stretching"
    }
  ];

  await equipmentModel.insertMany(equipmentData);

  // Seed package
  const pkg = await packageModel.create({
    name: "Gói tập cơ bản",
    durationInDays: 30,
    sessionLimit: 20,
    price: 500000,
    withTrainer: false
  });

  // Tìm user và coach
  const user = createdUsers.find(u => u.role === 'user');
  const coach = createdUsers.find(u => u.role === 'coach');
  await membershipModel.create({
    user: user._id,
    coach: coach._id,
    package: pkg._id,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30*24*60*60*1000),
    sessionsRemaining: 20,
    isActive: true,
    paymentStatus: 'paid',
    status: 'active'
  });

  console.log("Seed dữ liệu mẫu thành công!");
  process.exit();
}

seed(); 