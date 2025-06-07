import mongoose from 'mongoose';
import { workoutScheduleModel } from '../../models/workoutScheduleModel.js';
import { userModel } from '../../models/userModel.js';

describe('WorkoutSchedule Model Tests', () => {
  let testUser, testCoach, testStaff;

  beforeEach(async () => {
    await workoutScheduleModel.deleteMany({});
    await userModel.deleteMany({});
    
    // Create test users
    testUser = await userModel.create({
      name: 'John Member',
      email: 'member@example.com',
      password: 'password123',
      role: 'member'
    });

    testCoach = await userModel.create({
      name: 'Mike Coach',
      email: 'coach@example.com', 
      password: 'password123',
      role: 'coach'
    });

    testStaff = await userModel.create({
      name: 'Admin Staff',
      email: 'staff@example.com',
      password: 'password123',
      role: 'staff'
    });
  });

  afterAll(async () => {
    await workoutScheduleModel.deleteMany({});
    await userModel.deleteMany({});
  });

  describe('Schema Validation', () => {
    test('should create workout schedule with valid data', async () => {
      const scheduleData = {
        user: testUser._id,
        coach: testCoach._id,
        createdBy: testStaff._id,
        schedule: [
          {
            dayOfWeek: 'Monday',
            exercises: ['Push-ups', 'Squats', 'Deadlifts'],
            time: '18:00-19:00'
          },
          {
            dayOfWeek: 'Wednesday',
            exercises: ['Bench Press', 'Pull-ups'],
            time: '17:30-18:30'
          }
        ],
        note: 'Beginner level workout plan',
        attendance: [testUser._id]
      };

      const workoutSchedule = new workoutScheduleModel(scheduleData);
      const saved = await workoutSchedule.save();

      expect(saved.user.toString()).toBe(testUser._id.toString());
      expect(saved.coach.toString()).toBe(testCoach._id.toString());
      expect(saved.createdBy.toString()).toBe(testStaff._id.toString());
      expect(saved.schedule).toHaveLength(2);
      expect(saved.schedule[0].dayOfWeek).toBe('Monday');
      expect(saved.schedule[0].exercises).toEqual(['Push-ups', 'Squats', 'Deadlifts']);
      expect(saved.schedule[0].time).toBe('18:00-19:00');
      expect(saved.note).toBe('Beginner level workout plan');
      expect(saved.attendance).toHaveLength(1);
      expect(saved._id).toBeDefined();
      expect(saved.createdAt).toBeDefined();
    });

    test('should create workout schedule with minimal required data', async () => {
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id
      });

      const saved = await workoutSchedule.save();
      expect(saved.user.toString()).toBe(testUser._id.toString());
      expect(saved.schedule).toEqual([]);
      expect(saved.attendance).toEqual([]);
      expect(saved.createdAt).toBeDefined();
    });

    test('should fail validation when user is missing', async () => {
      const workoutSchedule = new workoutScheduleModel({
        schedule: [{ dayOfWeek: 'Monday', exercises: ['Push-ups'] }]
      });

      await expect(workoutSchedule.save()).rejects.toThrow(/user.*required/i);
    });

    test('should fail validation with invalid user ObjectId', async () => {
      const workoutSchedule = new workoutScheduleModel({
        user: 'invalid-object-id'
      });

      await expect(workoutSchedule.save()).rejects.toThrow();
    });
  });

  describe('Schedule Array Validation', () => {
    test('should handle single schedule entry', async () => {
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        schedule: [
          {
            dayOfWeek: 'Friday',
            exercises: ['Cardio', 'Abs'],
            time: '19:00-20:00'
          }
        ]
      });

      const saved = await workoutSchedule.save();
      expect(saved.schedule).toHaveLength(1);
      expect(saved.schedule[0].dayOfWeek).toBe('Friday');
      expect(saved.schedule[0].exercises).toEqual(['Cardio', 'Abs']);
      expect(saved.schedule[0].time).toBe('19:00-20:00');
    });

    test('should handle multiple schedule entries for different days', async () => {
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        schedule: [
          { dayOfWeek: 'Monday', exercises: ['Upper Body'], time: '18:00-19:00' },
          { dayOfWeek: 'Wednesday', exercises: ['Lower Body'], time: '18:00-19:00' },
          { dayOfWeek: 'Friday', exercises: ['Full Body'], time: '17:00-18:00' }
        ]
      });

      const saved = await workoutSchedule.save();
      expect(saved.schedule).toHaveLength(3);
      
      const days = saved.schedule.map(s => s.dayOfWeek);
      expect(days).toContain('Monday');
      expect(days).toContain('Wednesday');
      expect(days).toContain('Friday');
    });

    test('should handle empty exercises array', async () => {
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        schedule: [
          {
            dayOfWeek: 'Tuesday',
            exercises: [],
            time: '18:00-19:00'
          }
        ]
      });

      const saved = await workoutSchedule.save();
      expect(saved.schedule[0].exercises).toEqual([]);
    });

    test('should handle schedule entry without time', async () => {
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        schedule: [
          {
            dayOfWeek: 'Saturday',
            exercises: ['Yoga']
          }
        ]
      });

      const saved = await workoutSchedule.save();
      expect(saved.schedule[0].time).toBeUndefined();
    });
  });

  describe('DayOfWeek Enum Validation', () => {
    test('should accept valid dayOfWeek values', async () => {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      for (const day of validDays) {
        const workoutSchedule = new workoutScheduleModel({
          user: testUser._id,
          schedule: [
            {
              dayOfWeek: day,
              exercises: [`${day} workout`]
            }
          ]
        });
        
        const saved = await workoutSchedule.save();
        expect(saved.schedule[0].dayOfWeek).toBe(day);
      }
    });

    test('should reject invalid dayOfWeek values', async () => {
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        schedule: [
          {
            dayOfWeek: 'InvalidDay',
            exercises: ['Exercise']
          }
        ]
      });

      await expect(workoutSchedule.save()).rejects.toThrow();
    });

    test('should handle case sensitivity for dayOfWeek', async () => {
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        schedule: [
          {
            dayOfWeek: 'monday', // lowercase
            exercises: ['Exercise']
          }
        ]
      });

      await expect(workoutSchedule.save()).rejects.toThrow();
    });

    test('should handle schedule entry without dayOfWeek', async () => {
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        schedule: [
          {
            exercises: ['Exercise'],
            time: '18:00-19:00'
          }
        ]
      });

      const saved = await workoutSchedule.save();
      expect(saved.schedule[0].dayOfWeek).toBeUndefined();
    });
  });

  describe('User References', () => {
    test('should handle coach reference', async () => {
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        coach: testCoach._id,
        schedule: [{ dayOfWeek: 'Monday', exercises: ['Coaching session'] }]
      });

      const saved = await workoutSchedule.save();
      expect(saved.coach.toString()).toBe(testCoach._id.toString());
    });

    test('should handle createdBy reference', async () => {
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        createdBy: testStaff._id,
        schedule: [{ dayOfWeek: 'Monday', exercises: ['Staff created workout'] }]
      });

      const saved = await workoutSchedule.save();
      expect(saved.createdBy.toString()).toBe(testStaff._id.toString());
    });

    test('should handle attendance array with multiple users', async () => {
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        attendance: [testUser._id, testCoach._id]
      });

      const saved = await workoutSchedule.save();
      expect(saved.attendance).toHaveLength(2);
      expect(saved.attendance.map(a => a.toString())).toContain(testUser._id.toString());
      expect(saved.attendance.map(a => a.toString())).toContain(testCoach._id.toString());
    });

    test('should handle non-existent user references', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        coach: nonExistentId,
        createdBy: nonExistentId
      });

      const saved = await workoutSchedule.save();
      expect(saved.coach.toString()).toBe(nonExistentId.toString());
      expect(saved.createdBy.toString()).toBe(nonExistentId.toString());
    });
  });

  describe('Population Tests', () => {
    test('should populate user information', async () => {
      const workoutSchedule = await workoutScheduleModel.create({
        user: testUser._id,
        schedule: [{ dayOfWeek: 'Monday', exercises: ['Test'] }]
      });

      const populated = await workoutScheduleModel
        .findById(workoutSchedule._id)
        .populate('user', 'name email role');

      expect(populated.user.name).toBe('John Member');
      expect(populated.user.email).toBe('member@example.com');
      expect(populated.user.role).toBe('member');
    });

    test('should populate coach information', async () => {
      const workoutSchedule = await workoutScheduleModel.create({
        user: testUser._id,
        coach: testCoach._id,
        schedule: [{ dayOfWeek: 'Monday', exercises: ['Coached session'] }]
      });

      const populated = await workoutScheduleModel
        .findById(workoutSchedule._id)
        .populate('coach', 'name role');

      expect(populated.coach.name).toBe('Mike Coach');
      expect(populated.coach.role).toBe('coach');
    });

    test('should populate multiple references', async () => {
      const workoutSchedule = await workoutScheduleModel.create({
        user: testUser._id,
        coach: testCoach._id,
        createdBy: testStaff._id,
        attendance: [testUser._id]
      });

      const populated = await workoutScheduleModel
        .findById(workoutSchedule._id)
        .populate('user', 'name')
        .populate('coach', 'name')
        .populate('createdBy', 'name')
        .populate('attendance', 'name');

      expect(populated.user.name).toBe('John Member');
      expect(populated.coach.name).toBe('Mike Coach');
      expect(populated.createdBy.name).toBe('Admin Staff');
      expect(populated.attendance[0].name).toBe('John Member');
    });
  });

  describe('CRUD Operations', () => {
    test('should create workout schedule successfully', async () => {
      const scheduleData = {
        user: testUser._id,
        schedule: [
          { dayOfWeek: 'Monday', exercises: ['Push-ups', 'Squats'], time: '18:00-19:00' }
        ],
        note: 'Weekly workout plan'
      };

      const workoutSchedule = await workoutScheduleModel.create(scheduleData);
      expect(workoutSchedule.schedule).toHaveLength(1);
      expect(workoutSchedule.note).toBe('Weekly workout plan');
      expect(workoutSchedule._id).toBeDefined();
    });

    test('should read workout schedule by ID', async () => {
      const workoutSchedule = await workoutScheduleModel.create({
        user: testUser._id,
        schedule: [{ dayOfWeek: 'Tuesday', exercises: ['Cardio'] }]
      });

      const found = await workoutScheduleModel.findById(workoutSchedule._id);
      expect(found).toBeTruthy();
      expect(found.schedule[0].dayOfWeek).toBe('Tuesday');
      expect(found.schedule[0].exercises).toContain('Cardio');
    });

    test('should update workout schedule', async () => {
      const workoutSchedule = await workoutScheduleModel.create({
        user: testUser._id,
        schedule: [{ dayOfWeek: 'Monday', exercises: ['Original'] }]
      });

      const updated = await workoutScheduleModel.findByIdAndUpdate(
        workoutSchedule._id,
        { 
          note: 'Updated plan',
          $push: { 
            schedule: { dayOfWeek: 'Friday', exercises: ['New Exercise'] }
          }
        },
        { new: true }
      );

      expect(updated.note).toBe('Updated plan');
      expect(updated.schedule).toHaveLength(2);
      expect(updated.schedule[1].dayOfWeek).toBe('Friday');
    });

    test('should delete workout schedule', async () => {
      const workoutSchedule = await workoutScheduleModel.create({
        user: testUser._id,
        schedule: [{ dayOfWeek: 'Monday', exercises: ['Delete test'] }]
      });

      await workoutScheduleModel.findByIdAndDelete(workoutSchedule._id);
      const deleted = await workoutScheduleModel.findById(workoutSchedule._id);
      expect(deleted).toBeNull();
    });
  });

  describe('Queries and Filtering', () => {
    beforeEach(async () => {
      await workoutScheduleModel.insertMany([
        {
          user: testUser._id,
          coach: testCoach._id,
          schedule: [
            { dayOfWeek: 'Monday', exercises: ['Upper Body'], time: '18:00-19:00' },
            { dayOfWeek: 'Wednesday', exercises: ['Lower Body'], time: '18:00-19:00' }
          ],
          note: 'Strength training'
        },
        {
          user: testUser._id,
          createdBy: testStaff._id,
          schedule: [
            { dayOfWeek: 'Tuesday', exercises: ['Cardio'], time: '17:00-18:00' }
          ],
          note: 'Cardio plan'
        }
      ]);
    });

    test('should find schedules by user', async () => {
      const userSchedules = await workoutScheduleModel.find({ user: testUser._id });
      expect(userSchedules).toHaveLength(2);
    });

    test('should find schedules by coach', async () => {
      const coachSchedules = await workoutScheduleModel.find({ coach: testCoach._id });
      expect(coachSchedules).toHaveLength(1);
      expect(coachSchedules[0].note).toBe('Strength training');
    });

    test('should find schedules by createdBy', async () => {
      const staffSchedules = await workoutScheduleModel.find({ createdBy: testStaff._id });
      expect(staffSchedules).toHaveLength(1);
      expect(staffSchedules[0].note).toBe('Cardio plan');
    });

    test('should find schedules containing specific day', async () => {
      const mondaySchedules = await workoutScheduleModel.find({
        'schedule.dayOfWeek': 'Monday'
      });
      expect(mondaySchedules).toHaveLength(1);
      expect(mondaySchedules[0].note).toBe('Strength training');
    });

    test('should find schedules containing specific exercise', async () => {
      const cardioSchedules = await workoutScheduleModel.find({
        'schedule.exercises': 'Cardio'
      });
      expect(cardioSchedules).toHaveLength(1);
      expect(cardioSchedules[0].note).toBe('Cardio plan');
    });

    test('should find schedules by time range', async () => {
      const eveningSchedules = await workoutScheduleModel.find({
        'schedule.time': { $regex: '18:00', $options: 'i' }
      });
      expect(eveningSchedules).toHaveLength(1);
    });

    test('should find schedules by note content', async () => {
      const strengthSchedules = await workoutScheduleModel.find({
        note: { $regex: 'strength', $options: 'i' }
      });
      expect(strengthSchedules).toHaveLength(1);
    });
  });

  describe('CreatedAt Field', () => {
    test('should automatically set createdAt on create', async () => {
      const workoutSchedule = await workoutScheduleModel.create({
        user: testUser._id,
        schedule: [{ dayOfWeek: 'Monday', exercises: ['Test'] }]
      });

      expect(workoutSchedule.createdAt).toBeDefined();
      expect(workoutSchedule.createdAt instanceof Date).toBe(true);
      expect(workoutSchedule.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    test('should not change createdAt on update', async () => {
      const workoutSchedule = await workoutScheduleModel.create({
        user: testUser._id,
        schedule: [{ dayOfWeek: 'Monday', exercises: ['Original'] }]
      });

      const originalCreatedAt = workoutSchedule.createdAt;
      
      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await workoutScheduleModel.findByIdAndUpdate(
        workoutSchedule._id,
        { note: 'Updated' }
      );

      const updated = await workoutScheduleModel.findById(workoutSchedule._id);
      expect(updated.createdAt.getTime()).toBe(originalCreatedAt.getTime());
    });
  });

  describe('Array Operations', () => {
    test('should add new schedule entry using $push', async () => {
      const workoutSchedule = await workoutScheduleModel.create({
        user: testUser._id,
        schedule: [{ dayOfWeek: 'Monday', exercises: ['Original'] }]
      });

      await workoutScheduleModel.findByIdAndUpdate(
        workoutSchedule._id,
        { 
          $push: { 
            schedule: { dayOfWeek: 'Friday', exercises: ['New Exercise'], time: '19:00-20:00' }
          }
        }
      );

      const updated = await workoutScheduleModel.findById(workoutSchedule._id);
      expect(updated.schedule).toHaveLength(2);
      expect(updated.schedule[1].dayOfWeek).toBe('Friday');
    });

    test('should add user to attendance using $push', async () => {
      const workoutSchedule = await workoutScheduleModel.create({
        user: testUser._id,
        attendance: []
      });

      await workoutScheduleModel.findByIdAndUpdate(
        workoutSchedule._id,
        { $push: { attendance: testUser._id } }
      );

      const updated = await workoutScheduleModel.findById(workoutSchedule._id);
      expect(updated.attendance).toHaveLength(1);
      expect(updated.attendance[0].toString()).toBe(testUser._id.toString());
    });

    test('should remove schedule entry using $pull', async () => {
      const workoutSchedule = await workoutScheduleModel.create({
        user: testUser._id,
        schedule: [
          { dayOfWeek: 'Monday', exercises: ['Keep this'] },
          { dayOfWeek: 'Tuesday', exercises: ['Remove this'] }
        ]
      });

      await workoutScheduleModel.findByIdAndUpdate(
        workoutSchedule._id,
        { $pull: { schedule: { dayOfWeek: 'Tuesday' } } }
      );

      const updated = await workoutScheduleModel.findById(workoutSchedule._id);
      expect(updated.schedule).toHaveLength(1);
      expect(updated.schedule[0].dayOfWeek).toBe('Monday');
    });

    test('should update specific exercise in schedule', async () => {
      const workoutSchedule = await workoutScheduleModel.create({
        user: testUser._id,
        schedule: [
          { dayOfWeek: 'Monday', exercises: ['Old Exercise'] }
        ]
      });

      await workoutScheduleModel.findByIdAndUpdate(
        workoutSchedule._id,
        { $set: { 'schedule.0.exercises.0': 'New Exercise' } }
      );

      const updated = await workoutScheduleModel.findById(workoutSchedule._id);
      expect(updated.schedule[0].exercises[0]).toBe('New Exercise');
    });
  });

  describe('Edge Cases and Validation', () => {
    test('should handle very long exercise names', async () => {
      const longExerciseName = 'A'.repeat(500);
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        schedule: [
          { dayOfWeek: 'Monday', exercises: [longExerciseName] }
        ]
      });

      const saved = await workoutSchedule.save();
      expect(saved.schedule[0].exercises[0]).toBe(longExerciseName);
    });

    test('should handle many exercises in one day', async () => {
      const manyExercises = Array.from({ length: 50 }, (_, i) => `Exercise ${i + 1}`);
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        schedule: [
          { dayOfWeek: 'Monday', exercises: manyExercises }
        ]
      });

      const saved = await workoutSchedule.save();
      expect(saved.schedule[0].exercises).toHaveLength(50);
    });

    test('should handle special characters in exercises', async () => {
      const specialExercises = ['Push-ups (3x10)', 'Squats @ 50kg', 'Run 5km/h'];
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        schedule: [
          { dayOfWeek: 'Monday', exercises: specialExercises }
        ]
      });

      const saved = await workoutSchedule.save();
      expect(saved.schedule[0].exercises).toEqual(specialExercises);
    });

    test('should handle unicode characters in exercises', async () => {
      const unicodeExercises = ['Chạy bộ', 'Yoga 🧘‍♀️', 'Tập tạ 💪'];
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        schedule: [
          { dayOfWeek: 'Monday', exercises: unicodeExercises }
        ]
      });

      const saved = await workoutSchedule.save();
      expect(saved.schedule[0].exercises).toEqual(unicodeExercises);
    });

    test('should handle long notes', async () => {
      const longNote = 'N'.repeat(2000);
      const workoutSchedule = new workoutScheduleModel({
        user: testUser._id,
        note: longNote
      });

      const saved = await workoutSchedule.save();
      expect(saved.note).toBe(longNote);
    });
  });

  describe('Bulk Operations', () => {
    test('should handle bulk insert', async () => {
      const scheduleList = [
        {
          user: testUser._id,
          schedule: [{ dayOfWeek: 'Monday', exercises: ['Bulk 1'] }]
        },
        {
          user: testUser._id,
          schedule: [{ dayOfWeek: 'Tuesday', exercises: ['Bulk 2'] }]
        }
      ];

      const inserted = await workoutScheduleModel.insertMany(scheduleList);
      expect(inserted).toHaveLength(2);
      
      const all = await workoutScheduleModel.find({});
      expect(all).toHaveLength(2);
    });

    test('should handle bulk update', async () => {
      await workoutScheduleModel.insertMany([
        { user: testUser._id, coach: testCoach._id },
        { user: testUser._id, coach: testCoach._id },
        { user: testUser._id }
      ]);

      const result = await workoutScheduleModel.updateMany(
        { coach: testCoach._id },
        { note: 'Updated by coach' }
      );

      expect(result.modifiedCount).toBe(2);
      
      const updated = await workoutScheduleModel.find({ 
        note: 'Updated by coach' 
      });
      expect(updated).toHaveLength(2);
    });

    test('should handle bulk delete', async () => {
      await workoutScheduleModel.insertMany([
        { user: testUser._id, note: 'delete me' },
        { user: testUser._id, note: 'delete me' },
        { user: testUser._id, note: 'keep me' }
      ]);

      const result = await workoutScheduleModel.deleteMany({ 
        note: 'delete me' 
      });
      expect(result.deletedCount).toBe(2);
      
      const remaining = await workoutScheduleModel.find({});
      expect(remaining).toHaveLength(1);
      expect(remaining[0].note).toBe('keep me');
    });
  });
});
