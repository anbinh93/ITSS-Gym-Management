import mongoose from 'mongoose';
import { workoutModel } from '../../models/workoutModel.js';
import { userModel } from '../../models/userModel.js';

describe('Workout Model Tests', () => {
  let testUser, testTrainer;

  beforeEach(async () => {
    await workoutModel.deleteMany({});
    await userModel.deleteMany({});
    
    // Create test users
    testUser = await userModel.create({
      name: 'John Member',
      email: 'member@example.com',
      password: 'password123',
      role: 'member'
    });

    testTrainer = await userModel.create({
      name: 'Mike Trainer',
      email: 'trainer@example.com', 
      password: 'password123',
      role: 'trainer'
    });
  });

  afterAll(async () => {
    await workoutModel.deleteMany({});
    await userModel.deleteMany({});
  });

  describe('Schema Validation', () => {
    test('should create workout with valid data', async () => {
      const workoutData = {
        user: testUser._id,
        trainer: testTrainer._id,
        date: new Date('2024-01-15T18:00:00Z'),
        durationMinutes: 60,
        notes: 'Great workout session focusing on upper body strength'
      };

      const workout = new workoutModel(workoutData);
      const savedWorkout = await workout.save();

      expect(savedWorkout.user.toString()).toBe(testUser._id.toString());
      expect(savedWorkout.trainer.toString()).toBe(testTrainer._id.toString());
      expect(savedWorkout.date).toEqual(workoutData.date);
      expect(savedWorkout.durationMinutes).toBe(60);
      expect(savedWorkout.notes).toBe(workoutData.notes);
      expect(savedWorkout._id).toBeDefined();
      expect(savedWorkout.createdAt).toBeDefined();
      expect(savedWorkout.updatedAt).toBeDefined();
    });

    test('should create workout with minimal data', async () => {
      const workout = new workoutModel({
        user: testUser._id
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.user.toString()).toBe(testUser._id.toString());
      expect(savedWorkout.date).toBeDefined(); // default Date.now
      expect(savedWorkout.date instanceof Date).toBe(true);
      expect(savedWorkout._id).toBeDefined();
    });

    test('should create workout without user reference', async () => {
      const workout = new workoutModel({
        durationMinutes: 45,
        notes: 'Anonymous workout session'
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.durationMinutes).toBe(45);
      expect(savedWorkout.notes).toBe('Anonymous workout session');
      expect(savedWorkout.date).toBeDefined();
    });

    test('should create workout without trainer', async () => {
      const workout = new workoutModel({
        user: testUser._id,
        durationMinutes: 30,
        notes: 'Solo workout'
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.user.toString()).toBe(testUser._id.toString());
      expect(savedWorkout.trainer).toBeUndefined();
      expect(savedWorkout.durationMinutes).toBe(30);
    });
  });

  describe('Date Field Validation', () => {
    test('should use default date when not specified', async () => {
      const beforeCreate = Date.now();
      const workout = new workoutModel({
        user: testUser._id,
        durationMinutes: 30
      });

      const savedWorkout = await workout.save();
      const afterCreate = Date.now();

      expect(savedWorkout.date).toBeDefined();
      expect(savedWorkout.date instanceof Date).toBe(true);
      expect(savedWorkout.date.getTime()).toBeGreaterThanOrEqual(beforeCreate);
      expect(savedWorkout.date.getTime()).toBeLessThanOrEqual(afterCreate);
    });

    test('should accept custom date', async () => {
      const customDate = new Date('2024-01-01T10:00:00Z');
      const workout = new workoutModel({
        user: testUser._id,
        date: customDate
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.date).toEqual(customDate);
    });

    test('should handle past dates', async () => {
      const pastDate = new Date('2020-01-01T12:00:00Z');
      const workout = new workoutModel({
        user: testUser._id,
        date: pastDate
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.date).toEqual(pastDate);
    });

    test('should handle future dates', async () => {
      const futureDate = new Date('2030-12-31T23:59:59Z');
      const workout = new workoutModel({
        user: testUser._id,
        date: futureDate
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.date).toEqual(futureDate);
    });
  });

  describe('Duration Validation', () => {
    test('should handle positive duration values', async () => {
      const durations = [1, 30, 60, 120, 180];
      
      for (const duration of durations) {
        const workout = new workoutModel({
          user: testUser._id,
          durationMinutes: duration
        });
        
        const savedWorkout = await workout.save();
        expect(savedWorkout.durationMinutes).toBe(duration);
      }
    });

    test('should handle zero duration', async () => {
      const workout = new workoutModel({
        user: testUser._id,
        durationMinutes: 0
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.durationMinutes).toBe(0);
    });

    test('should handle negative duration', async () => {
      const workout = new workoutModel({
        user: testUser._id,
        durationMinutes: -30
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.durationMinutes).toBe(-30);
    });

    test('should handle decimal duration values', async () => {
      const workout = new workoutModel({
        user: testUser._id,
        durationMinutes: 45.5
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.durationMinutes).toBe(45.5);
    });

    test('should handle very large duration values', async () => {
      const workout = new workoutModel({
        user: testUser._id,
        durationMinutes: 999999
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.durationMinutes).toBe(999999);
    });
  });

  describe('User References', () => {
    test('should accept valid user ObjectId', async () => {
      const workout = new workoutModel({
        user: testUser._id,
        durationMinutes: 45
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.user.toString()).toBe(testUser._id.toString());
    });

    test('should accept valid trainer ObjectId', async () => {
      const workout = new workoutModel({
        user: testUser._id,
        trainer: testTrainer._id,
        durationMinutes: 60
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.trainer.toString()).toBe(testTrainer._id.toString());
    });

    test('should handle invalid ObjectId format', async () => {
      const workout = new workoutModel({
        user: 'invalid-object-id',
        durationMinutes: 30
      });

      await expect(workout.save()).rejects.toThrow();
    });

    test('should handle non-existent user reference', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const workout = new workoutModel({
        user: nonExistentId,
        durationMinutes: 30
      });

      // Should save successfully (referential integrity not enforced at schema level)
      const savedWorkout = await workout.save();
      expect(savedWorkout.user.toString()).toBe(nonExistentId.toString());
    });
  });

  describe('Population Tests', () => {
    test('should populate user information', async () => {
      const workout = await workoutModel.create({
        user: testUser._id,
        durationMinutes: 45,
        notes: 'User populated workout'
      });

      const populatedWorkout = await workoutModel
        .findById(workout._id)
        .populate('user', 'name email role');

      expect(populatedWorkout.user.name).toBe('John Member');
      expect(populatedWorkout.user.email).toBe('member@example.com');
      expect(populatedWorkout.user.role).toBe('member');
    });

    test('should populate trainer information', async () => {
      const workout = await workoutModel.create({
        user: testUser._id,
        trainer: testTrainer._id,
        durationMinutes: 60,
        notes: 'Trainer guided session'
      });

      const populatedWorkout = await workoutModel
        .findById(workout._id)
        .populate('trainer', 'name role');

      expect(populatedWorkout.trainer.name).toBe('Mike Trainer');
      expect(populatedWorkout.trainer.role).toBe('trainer');
    });

    test('should populate both user and trainer', async () => {
      const workout = await workoutModel.create({
        user: testUser._id,
        trainer: testTrainer._id,
        durationMinutes: 90,
        notes: 'Full session with trainer'
      });

      const populatedWorkout = await workoutModel
        .findById(workout._id)
        .populate('user', 'name')
        .populate('trainer', 'name');

      expect(populatedWorkout.user.name).toBe('John Member');
      expect(populatedWorkout.trainer.name).toBe('Mike Trainer');
    });
  });

  describe('CRUD Operations', () => {
    test('should create workout successfully', async () => {
      const workoutData = {
        user: testUser._id,
        trainer: testTrainer._id,
        durationMinutes: 75,
        notes: 'Strength training session'
      };

      const workout = await workoutModel.create(workoutData);
      expect(workout.durationMinutes).toBe(75);
      expect(workout.notes).toBe('Strength training session');
      expect(workout._id).toBeDefined();
    });

    test('should read workout by ID', async () => {
      const workout = await workoutModel.create({
        user: testUser._id,
        durationMinutes: 40,
        notes: 'Cardio session'
      });

      const foundWorkout = await workoutModel.findById(workout._id);
      expect(foundWorkout).toBeTruthy();
      expect(foundWorkout.durationMinutes).toBe(40);
      expect(foundWorkout.notes).toBe('Cardio session');
    });

    test('should update workout', async () => {
      const workout = await workoutModel.create({
        user: testUser._id,
        durationMinutes: 30,
        notes: 'Initial notes'
      });

      const updatedWorkout = await workoutModel.findByIdAndUpdate(
        workout._id,
        { 
          durationMinutes: 45,
          notes: 'Updated: Extended session'
        },
        { new: true }
      );

      expect(updatedWorkout.durationMinutes).toBe(45);
      expect(updatedWorkout.notes).toBe('Updated: Extended session');
    });

    test('should delete workout', async () => {
      const workout = await workoutModel.create({
        user: testUser._id,
        durationMinutes: 25,
        notes: 'Delete this workout'
      });

      await workoutModel.findByIdAndDelete(workout._id);
      const deletedWorkout = await workoutModel.findById(workout._id);
      expect(deletedWorkout).toBeNull();
    });
  });

  describe('Queries and Filtering', () => {
    beforeEach(async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      await workoutModel.insertMany([
        {
          user: testUser._id,
          trainer: testTrainer._id,
          date: today,
          durationMinutes: 60,
          notes: 'Today workout with trainer'
        },
        {
          user: testUser._id,
          date: yesterday,
          durationMinutes: 45,
          notes: 'Yesterday solo workout'
        },
        {
          user: testUser._id,
          date: lastWeek,
          durationMinutes: 90,
          notes: 'Last week long session'
        },
        {
          user: testUser._id,
          trainer: testTrainer._id,
          date: today,
          durationMinutes: 30,
          notes: 'Short session with trainer'
        }
      ]);
    });

    test('should find workouts by user', async () => {
      const userWorkouts = await workoutModel.find({ user: testUser._id });
      expect(userWorkouts).toHaveLength(4);
    });

    test('should find workouts by trainer', async () => {
      const trainerWorkouts = await workoutModel.find({ trainer: testTrainer._id });
      expect(trainerWorkouts).toHaveLength(2);
      
      const notes = trainerWorkouts.map(w => w.notes);
      expect(notes).toContain('Today workout with trainer');
      expect(notes).toContain('Short session with trainer');
    });

    test('should find workouts by duration range', async () => {
      const mediumWorkouts = await workoutModel.find({
        durationMinutes: { $gte: 45, $lte: 60 }
      });
      expect(mediumWorkouts).toHaveLength(2);
    });

    test('should find workouts by date range', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentWorkouts = await workoutModel.find({
        date: { $gte: yesterday }
      });
      expect(recentWorkouts).toHaveLength(3); // today and yesterday
    });

    test('should find workouts by notes content', async () => {
      const trainerWorkouts = await workoutModel.find({
        notes: { $regex: 'trainer', $options: 'i' }
      });
      expect(trainerWorkouts).toHaveLength(2);
    });

    test('should sort workouts by duration', async () => {
      const sortedWorkouts = await workoutModel
        .find({})
        .sort({ durationMinutes: -1 }); // descending
      
      expect(sortedWorkouts[0].durationMinutes).toBe(90);
      expect(sortedWorkouts[sortedWorkouts.length - 1].durationMinutes).toBe(30);
    });

    test('should sort workouts by date', async () => {
      const sortedWorkouts = await workoutModel
        .find({})
        .sort({ date: -1 }); // most recent first
      
      expect(sortedWorkouts[0].notes).toContain('Today');
    });

    test('should count workouts with trainer', async () => {
      const trainerWorkoutCount = await workoutModel.countDocuments({
        trainer: { $exists: true }
      });
      expect(trainerWorkoutCount).toBe(2);
    });

    test('should calculate total duration for user', async () => {
      const pipeline = [
        { $match: { user: testUser._id } },
        { $group: { _id: null, totalDuration: { $sum: '$durationMinutes' } } }
      ];

      const result = await workoutModel.aggregate(pipeline);
      expect(result[0].totalDuration).toBe(225); // 60+45+90+30
    });

    test('should calculate average duration', async () => {
      const pipeline = [
        { $group: { _id: null, avgDuration: { $avg: '$durationMinutes' } } }
      ];

      const result = await workoutModel.aggregate(pipeline);
      expect(result[0].avgDuration).toBe(56.25); // (60+45+90+30)/4
    });
  });

  describe('Timestamps', () => {
    test('should automatically set createdAt and updatedAt on create', async () => {
      const workout = await workoutModel.create({
        user: testUser._id,
        durationMinutes: 45
      });

      expect(workout.createdAt).toBeDefined();
      expect(workout.updatedAt).toBeDefined();
      expect(workout.createdAt instanceof Date).toBe(true);
      expect(workout.updatedAt instanceof Date).toBe(true);
    });

    test('should update updatedAt on document modification', async () => {
      const workout = await workoutModel.create({
        user: testUser._id,
        durationMinutes: 30,
        notes: 'Original notes'
      });
      
      const originalUpdatedAt = workout.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      workout.notes = 'Updated notes';
      await workout.save();
      
      expect(workout.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Edge Cases and Validation', () => {
    test('should handle very long notes', async () => {
      const longNotes = 'A'.repeat(5000);
      const workout = new workoutModel({
        user: testUser._id,
        durationMinutes: 60,
        notes: longNotes
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.notes).toBe(longNotes);
    });

    test('should handle empty notes', async () => {
      const workout = new workoutModel({
        user: testUser._id,
        durationMinutes: 45,
        notes: ''
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.notes).toBe('');
    });

    test('should handle special characters in notes', async () => {
      const specialNotes = 'Workout with weights: 50kg × 3 sets → great progress! 💪';
      const workout = new workoutModel({
        user: testUser._id,
        durationMinutes: 60,
        notes: specialNotes
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.notes).toBe(specialNotes);
    });

    test('should handle workout without notes', async () => {
      const workout = new workoutModel({
        user: testUser._id,
        durationMinutes: 30
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.notes).toBeUndefined();
      expect(savedWorkout.durationMinutes).toBe(30);
    });

    test('should handle workout without duration', async () => {
      const workout = new workoutModel({
        user: testUser._id,
        notes: 'Workout without duration tracking'
      });

      const savedWorkout = await workout.save();
      expect(savedWorkout.durationMinutes).toBeUndefined();
      expect(savedWorkout.notes).toBe('Workout without duration tracking');
    });
  });

  describe('Bulk Operations', () => {
    test('should handle bulk insert', async () => {
      const workoutList = [
        { user: testUser._id, durationMinutes: 30, notes: 'Workout 1' },
        { user: testUser._id, durationMinutes: 45, notes: 'Workout 2' },
        { user: testUser._id, durationMinutes: 60, notes: 'Workout 3' }
      ];

      const insertedWorkouts = await workoutModel.insertMany(workoutList);
      expect(insertedWorkouts).toHaveLength(3);
      
      const allWorkouts = await workoutModel.find({});
      expect(allWorkouts).toHaveLength(3);
    });

    test('should handle bulk update', async () => {
      await workoutModel.insertMany([
        { user: testUser._id, trainer: testTrainer._id, durationMinutes: 30 },
        { user: testUser._id, trainer: testTrainer._id, durationMinutes: 45 },
        { user: testUser._id, durationMinutes: 60 }
      ]);

      const result = await workoutModel.updateMany(
        { trainer: testTrainer._id },
        { notes: 'Trainer supervised session' }
      );

      expect(result.modifiedCount).toBe(2);
      
      const updatedWorkouts = await workoutModel.find({ 
        notes: 'Trainer supervised session' 
      });
      expect(updatedWorkouts).toHaveLength(2);
    });

    test('should handle bulk delete', async () => {
      await workoutModel.insertMany([
        { user: testUser._id, durationMinutes: 10, notes: 'Short workout' },
        { user: testUser._id, durationMinutes: 15, notes: 'Another short' },
        { user: testUser._id, durationMinutes: 60, notes: 'Long workout' }
      ]);

      const result = await workoutModel.deleteMany({ 
        durationMinutes: { $lt: 20 } 
      });
      expect(result.deletedCount).toBe(2);
      
      const remainingWorkouts = await workoutModel.find({});
      expect(remainingWorkouts).toHaveLength(1);
      expect(remainingWorkouts[0].durationMinutes).toBe(60);
    });
  });

  describe('Date-based Queries', () => {
    beforeEach(async () => {
      const dates = [
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-15T14:00:00Z'),
        new Date('2024-02-01T18:00:00Z'),
        new Date('2024-02-15T09:00:00Z')
      ];

      await workoutModel.insertMany(dates.map((date, index) => ({
        user: testUser._id,
        date: date,
        durationMinutes: (index + 1) * 30,
        notes: `Workout ${index + 1}`
      })));
    });

    test('should find workouts in specific month', async () => {
      const januaryStart = new Date('2024-01-01T00:00:00Z');
      const februaryStart = new Date('2024-02-01T00:00:00Z');
      
      const januaryWorkouts = await workoutModel.find({
        date: { $gte: januaryStart, $lt: februaryStart }
      });
      
      expect(januaryWorkouts).toHaveLength(2);
    });

    test('should find workouts in date range', async () => {
      const startDate = new Date('2024-01-10T00:00:00Z');
      const endDate = new Date('2024-02-10T23:59:59Z');
      
      const rangeWorkouts = await workoutModel.find({
        date: { $gte: startDate, $lte: endDate }
      });
      
      expect(rangeWorkouts).toHaveLength(2);
    });

    test('should group workouts by month', async () => {
      const pipeline = [
        {
          $group: {
            _id: { 
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            count: { $sum: 1 },
            totalDuration: { $sum: '$durationMinutes' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ];

      const result = await workoutModel.aggregate(pipeline);
      expect(result).toHaveLength(2);
      expect(result[0].count).toBe(2); // January
      expect(result[1].count).toBe(2); // February
    });
  });
});
