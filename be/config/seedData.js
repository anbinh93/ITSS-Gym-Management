export const DEMO_USERS = [
  {
    name: "Admin User",
    email: "admin@gym.com",
    password: "admin123456",
    role: "admin",
    gender: "Male",
    phone: "0123456789",
    birthYear: 1990,
    username: "admin"
  },
  {
    name: "Staff Member",
    email: "staff@gym.com",
    password: "staff123456",
    role: "staff",
    gender: "Female",
    phone: "0123456790",
    birthYear: 1992,
    username: "staff"
  },
  {
    name: "Personal Trainer",
    email: "coach@gym.com",
    password: "coach123456",
    role: "coach",
    gender: "Male",
    phone: "0123456791",
    birthYear: 1993,
    username: "coach"
  },
  {
    name: "John Doe",
    email: "user@gym.com",
    password: "user123456",
    role: "user",
    gender: "Male",
    phone: "0123456792",
    birthYear: 1995,
    username: "user"
  }
];

export const MEMBER_USERS = [
  {
    name: "Alice Johnson",
    email: "alice@gmail.com",
    password: "Member@123",
    role: "member",
    gender: "Female",
    phone: "0987654321",
    birthYear: 1995,
    username: "alice"
  },
  {
    name: "Bob Smith",
    email: "bob@gmail.com",
    password: "Member@123",
    role: "member",
    gender: "Male",
    phone: "0987654322",
    birthYear: 1990,
    username: "bob"
  },
  {
    name: "Carol Davis",
    email: "carol@gmail.com",
    password: "Member@123",
    role: "member",
    gender: "Female",
    phone: "0987654323",
    birthYear: 1992,
    username: "carol"
  },
  {
    name: "David Wilson",
    email: "david@gmail.com",
    password: "Member@123",
    role: "member",
    gender: "Male",
    phone: "0987654324",
    birthYear: 1988,
    username: "david"
  },
  {
    name: "Eva Brown",
    email: "eva@gmail.com",
    password: "Member@123",
    role: "member",
    gender: "Female",
    phone: "0987654325",
    birthYear: 1994,
    username: "eva"
  }
];

export const SAMPLE_EXERCISES = [
  'Push-ups', 'Pull-ups', 'Squats', 'Deadlifts', 'Bench Press',
  'Cardio', 'Leg Press', 'Shoulder Press', 'Bicep Curls', 'Tricep Dips',
  'Running', 'Cycling', 'Rowing', 'Lat Pulldowns', 'Chest Fly'
];

export const WORKOUT_STATUSES = ['completed', 'checked_in', 'scheduled'];

export const SAMPLE_WORKOUTS = [
  {
    userEmail: "user@gym.com",
    workouts: [
      {
        durationMinutes: 45,
        notes: "Cardio workout - treadmill and cycling",
        daysAgo: 2
      },
      {
        durationMinutes: 60,
        notes: "Upper body strength training",
        daysAgo: 5
      },
      {
        durationMinutes: 40,
        notes: "Leg day workout - squats and deadlifts",
        daysAgo: 7
      },
      {
        durationMinutes: 35,
        notes: "HIIT training session",
        daysAgo: 10
      },
      {
        durationMinutes: 50,
        notes: "Full body workout with trainer",
        daysAgo: 14
      }
    ]
  }
];

export const EQUIPMENT_DATA = [
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

export const PACKAGE_DATA = [
  {
    name: "Basic Package",
    price: 300000,
    durationInDays: 30,
    sessionLimit: 10,
    description: "Gói cơ bản cho người mới bắt đầu",
    withTrainer: false
  },
  {
    name: "Standard Package", 
    price: 500000,
    durationInDays: 30,
    sessionLimit: 20,
    description: "Gói tiêu chuẩn với nhiều tính năng",
    withTrainer: false
  },
  {
    name: "Premium Package",
    price: 800000,
    durationInDays: 30,
    sessionLimit: 30,
    description: "Gói cao cấp với huấn luyện viên cá nhân",
    withTrainer: true
  }
];
