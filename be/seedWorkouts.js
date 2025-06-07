import { connectDB } from "./config/db.js";
import { userModel } from "./models/userModel.js";
import { workoutModel } from "./models/workoutModel.js";

// Sample workout data
const sampleWorkouts = [
    {
        userEmail: "user@gym.com",
        workouts: [
            {
                durationMinutes: 45,
                notes: "Cardio workout - treadmill and cycling",
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
                durationMinutes: 60,
                notes: "Upper body strength training",
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            },
            {
                durationMinutes: 40,
                notes: "Leg day workout - squats and deadlifts",
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
            },
            {
                durationMinutes: 35,
                notes: "HIIT training session",
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
            },
            {
                durationMinutes: 50,
                notes: "Full body workout with trainer",
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 2 weeks ago
            }
        ]
    }
];

async function seedWorkouts() {
    try {
        console.log('Connecting to database...');
        await connectDB();

        for (const userData of sampleWorkouts) {
            // Find user by email
            const user = await userModel.findOne({ email: userData.userEmail });
            if (!user) {
                console.log(`User with email ${userData.userEmail} not found, skipping...`);
                continue;
            }

            console.log(`Seeding workouts for user: ${user.name} (${user.email}) - ID: ${user._id}`);

            // Delete existing workouts for this user
            await workoutModel.deleteMany({ user: user._id });

            // Create new workouts
            for (const workoutData of userData.workouts) {
                const workout = await workoutModel.create({
                    user: user._id,
                    durationMinutes: workoutData.durationMinutes,
                    notes: workoutData.notes,
                    date: workoutData.date
                });
                console.log(`Created workout: ${workout.notes} (${workout.durationMinutes} mins)`);
            }
        }

        console.log('Workout seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding workouts:', error);
        process.exit(1);
    }
}

seedWorkouts();
