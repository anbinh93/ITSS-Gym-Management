import mongoose from 'mongoose';
import { workoutSessionModel } from '../models/workoutSessionModel.js';
import { userModel } from '../models/userModel.js';
import { membershipModel } from '../models/membershipModel.js';
import { packageModel } from '../models/packageModel.js';

describe('WorkoutSession Model Test Suite', () => {
  
  let testUser, testCoach, testPackage, testMembership;

  beforeEach(async () => {
    // Create test user
    testUser = new userModel({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'user'
    });
    await testUser.save();

    // Create test coach
    testCoach = new userModel({
      name: 'Test Coach',
      email: 'testcoach@example.com',
      password: 'password123',
      role: 'coach'
    });
    await testCoach.save();

    // Create test package
    testPackage = new packageModel({
      name: 'Test Package',
      durationInDays: 30,
      sessionLimit: 15,
      price: 400000
    });
    await testPackage.save();

    // Create test membership
    testMembership = new membershipModel({
      user: testUser._id,
      coach: testCoach._id,
      package: testPackage._id,
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
      sessionsRemaining: 15
    });
    await testMembership.save();
  });

  describe('WorkoutSession Schema Validation', () => {
    test('should create a valid workout session with required fields', async () => {
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        coach: testCoach._id,
        workoutDate: new Date('2023-01-15'),
        startTime: '08:00',
        endTime: '09:00',
        exerciseName: 'Upper Body Workout'
      };

      const session = new workoutSessionModel(sessionData);
      const savedSession = await session.save();

      expect(savedSession._id).toBeDefined();
      expect(savedSession.user.toString()).toBe(testUser._id.toString());
      expect(savedSession.membership.toString()).toBe(testMembership._id.toString());
      expect(savedSession.coach.toString()).toBe(testCoach._id.toString());
      expect(savedSession.workoutDate).toEqual(sessionData.workoutDate);
      expect(savedSession.startTime).toBe('08:00');
      expect(savedSession.endTime).toBe('09:00');
      expect(savedSession.exerciseName).toBe('Upper Body Workout');
      expect(savedSession.isConfirmed).toBe(false); // Default value
      expect(savedSession.status).toBe('scheduled'); // Default value
    });

    test('should fail to create session without required fields', async () => {
      const invalidSessionData = {
        coach: testCoach._id,
        startTime: '08:00',
        endTime: '09:00'
        // Missing user, membership, workoutDate, exerciseName
      };

      const session = new workoutSessionModel(invalidSessionData);
      await expect(session.save()).rejects.toThrow();
    });

    test('should create session without coach (self-training)', async () => {
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        workoutDate: new Date('2023-01-15'),
        startTime: '08:00',
        endTime: '09:00',
        exerciseName: 'Cardio Workout'
      };

      const session = new workoutSessionModel(sessionData);
      const savedSession = await session.save();

      expect(savedSession.coach).toBeUndefined();
      expect(savedSession.user.toString()).toBe(testUser._id.toString());
    });
  });

  describe('WorkoutSession Status Validation', () => {
    test('should accept valid statuses', async () => {
      const statuses = ['scheduled', 'checked_in', 'completed', 'cancelled'];
      
      for (let i = 0; i < statuses.length; i++) {
        const sessionData = {
          user: testUser._id,
          membership: testMembership._id,
          workoutDate: new Date(`2023-01-${15 + i}`),
          startTime: '08:00',
          endTime: '09:00',
          exerciseName: `Workout ${i + 1}`,
          status: statuses[i]
        };

        const session = new workoutSessionModel(sessionData);
        const savedSession = await session.save();
        expect(savedSession.status).toBe(statuses[i]);
      }
    });

    test('should reject invalid status', async () => {
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        workoutDate: new Date('2023-01-15'),
        startTime: '08:00',
        endTime: '09:00',
        exerciseName: 'Test Workout',
        status: 'invalid_status'
      };

      const session = new workoutSessionModel(sessionData);
      await expect(session.save()).rejects.toThrow();
    });
  });

  describe('WorkoutSession Check-in/Check-out Flow', () => {
    test('should handle check-in process', async () => {
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        coach: testCoach._id,
        workoutDate: new Date('2023-01-15'),
        startTime: '08:00',
        endTime: '09:00',
        exerciseName: 'Check-in Test Workout'
      };

      const session = new workoutSessionModel(sessionData);
      const savedSession = await session.save();

      // Simulate check-in
      savedSession.status = 'checked_in';
      savedSession.checkedInAt = new Date();
      savedSession.checkedInBy = testUser._id;
      
      const checkedInSession = await savedSession.save();

      expect(checkedInSession.status).toBe('checked_in');
      expect(checkedInSession.checkedInAt).toBeDefined();
      expect(checkedInSession.checkedInBy.toString()).toBe(testUser._id.toString());
    });

    test('should handle check-out process', async () => {
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        coach: testCoach._id,
        workoutDate: new Date('2023-01-15'),
        startTime: '08:00',
        endTime: '09:00',
        exerciseName: 'Check-out Test Workout',
        status: 'checked_in',
        checkedInAt: new Date(),
        checkedInBy: testUser._id
      };

      const session = new workoutSessionModel(sessionData);
      const savedSession = await session.save();

      // Simulate check-out by coach
      savedSession.status = 'completed';
      savedSession.checkedOutAt = new Date();
      savedSession.checkedOutBy = testCoach._id;
      savedSession.notes = 'Great workout session!';
      
      const checkedOutSession = await savedSession.save();

      expect(checkedOutSession.status).toBe('completed');
      expect(checkedOutSession.checkedOutAt).toBeDefined();
      expect(checkedOutSession.checkedOutBy.toString()).toBe(testCoach._id.toString());
      expect(checkedOutSession.notes).toBe('Great workout session!');
    });

    test('should handle session confirmation', async () => {
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        coach: testCoach._id,
        workoutDate: new Date('2023-01-15'),
        startTime: '08:00',
        endTime: '09:00',
        exerciseName: 'Confirmation Test Workout'
      };

      const session = new workoutSessionModel(sessionData);
      const savedSession = await session.save();

      // Simulate confirmation by coach
      savedSession.isConfirmed = true;
      savedSession.confirmedBy = testCoach._id;
      savedSession.confirmedAt = new Date();
      
      const confirmedSession = await savedSession.save();

      expect(confirmedSession.isConfirmed).toBe(true);
      expect(confirmedSession.confirmedBy.toString()).toBe(testCoach._id.toString());
      expect(confirmedSession.confirmedAt).toBeDefined();
    });
  });

  describe('WorkoutSession Time Handling', () => {
    test('should handle time strings correctly', async () => {
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        workoutDate: new Date('2023-01-15'),
        startTime: '14:30',
        endTime: '15:45',
        exerciseName: 'Afternoon Workout'
      };

      const session = new workoutSessionModel(sessionData);
      const savedSession = await session.save();

      expect(savedSession.startTime).toBe('14:30');
      expect(savedSession.endTime).toBe('15:45');
    });

    test('should handle workout date correctly', async () => {
      const workoutDate = new Date('2023-06-15');
      
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        workoutDate: workoutDate,
        startTime: '10:00',
        endTime: '11:00',
        exerciseName: 'Date Test Workout'
      };

      const session = new workoutSessionModel(sessionData);
      const savedSession = await session.save();

      expect(savedSession.workoutDate).toEqual(workoutDate);
    });
  });

  describe('WorkoutSession Relationships', () => {
    test('should populate user information', async () => {
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        coach: testCoach._id,
        workoutDate: new Date('2023-01-15'),
        startTime: '08:00',
        endTime: '09:00',
        exerciseName: 'Populate User Test'
      };

      const session = new workoutSessionModel(sessionData);
      const savedSession = await session.save();

      const sessionWithUser = await workoutSessionModel
        .findById(savedSession._id)
        .populate('user');

      expect(sessionWithUser.user.name).toBe('Test User');
      expect(sessionWithUser.user.email).toBe('testuser@example.com');
    });

    test('should populate coach information', async () => {
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        coach: testCoach._id,
        workoutDate: new Date('2023-01-15'),
        startTime: '08:00',
        endTime: '09:00',
        exerciseName: 'Populate Coach Test'
      };

      const session = new workoutSessionModel(sessionData);
      const savedSession = await session.save();

      const sessionWithCoach = await workoutSessionModel
        .findById(savedSession._id)
        .populate('coach');

      expect(sessionWithCoach.coach.name).toBe('Test Coach');
      expect(sessionWithCoach.coach.role).toBe('coach');
    });

    test('should populate membership information', async () => {
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        workoutDate: new Date('2023-01-15'),
        startTime: '08:00',
        endTime: '09:00',
        exerciseName: 'Populate Membership Test'
      };

      const session = new workoutSessionModel(sessionData);
      const savedSession = await session.save();

      const sessionWithMembership = await workoutSessionModel
        .findById(savedSession._id)
        .populate({
          path: 'membership',
          populate: { path: 'package' }
        });

      expect(sessionWithMembership.membership.package.name).toBe('Test Package');
    });
  });

  describe('WorkoutSession Queries', () => {
    beforeEach(async () => {
      // Create multiple sessions for testing
      const sessionsData = [
        {
          user: testUser._id,
          membership: testMembership._id,
          coach: testCoach._id,
          workoutDate: new Date('2023-01-15'),
          startTime: '08:00',
          endTime: '09:00',
          exerciseName: 'Morning Workout',
          status: 'scheduled'
        },
        {
          user: testUser._id,
          membership: testMembership._id,
          coach: testCoach._id,
          workoutDate: new Date('2023-01-16'),
          startTime: '10:00',
          endTime: '11:00',
          exerciseName: 'Afternoon Workout',
          status: 'checked_in'
        },
        {
          user: testUser._id,
          membership: testMembership._id,
          coach: testCoach._id,
          workoutDate: new Date('2023-01-17'),
          startTime: '14:00',
          endTime: '15:00',
          exerciseName: 'Evening Workout',
          status: 'completed'
        }
      ];

      for (const data of sessionsData) {
        const session = new workoutSessionModel(data);
        await session.save();
      }
    });

    test('should find sessions by user', async () => {
      const userSessions = await workoutSessionModel.find({ user: testUser._id });
      expect(userSessions.length).toBe(3);
    });

    test('should find sessions by status', async () => {
      const scheduledSessions = await workoutSessionModel.find({ status: 'scheduled' });
      expect(scheduledSessions.length).toBe(1);
      
      const completedSessions = await workoutSessionModel.find({ status: 'completed' });
      expect(completedSessions.length).toBe(1);
    });

    test('should find sessions by date range', async () => {
      const startDate = new Date('2023-01-15');
      const endDate = new Date('2023-01-16');
      
      const sessionsInRange = await workoutSessionModel.find({
        workoutDate: { $gte: startDate, $lte: endDate }
      });
      
      expect(sessionsInRange.length).toBe(2);
    });

    test('should find sessions by coach', async () => {
      const coachSessions = await workoutSessionModel.find({ coach: testCoach._id });
      expect(coachSessions.length).toBe(3);
    });

    test('should sort sessions by date', async () => {
      const sortedSessions = await workoutSessionModel
        .find({ user: testUser._id })
        .sort({ workoutDate: 1 });
      
      expect(sortedSessions.length).toBe(3);
      expect(sortedSessions[0].workoutDate.getTime())
        .toBeLessThanOrEqual(sortedSessions[1].workoutDate.getTime());
      expect(sortedSessions[1].workoutDate.getTime())
        .toBeLessThanOrEqual(sortedSessions[2].workoutDate.getTime());
    });
  });

  describe('WorkoutSession CRUD Operations', () => {
    test('should update session status', async () => {
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        workoutDate: new Date('2023-01-15'),
        startTime: '08:00',
        endTime: '09:00',
        exerciseName: 'Update Status Test'
      };

      const session = new workoutSessionModel(sessionData);
      const savedSession = await session.save();

      savedSession.status = 'checked_in';
      const updatedSession = await savedSession.save();

      expect(updatedSession.status).toBe('checked_in');
    });

    test('should delete session', async () => {
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        workoutDate: new Date('2023-01-15'),
        startTime: '08:00',
        endTime: '09:00',
        exerciseName: 'Delete Test'
      };

      const session = new workoutSessionModel(sessionData);
      const savedSession = await session.save();
      const sessionId = savedSession._id;

      await workoutSessionModel.findByIdAndDelete(sessionId);
      
      const deletedSession = await workoutSessionModel.findById(sessionId);
      expect(deletedSession).toBeNull();
    });
  });

  describe('WorkoutSession Timestamps', () => {
    test('should automatically add createdAt and updatedAt timestamps', async () => {
      const sessionData = {
        user: testUser._id,
        membership: testMembership._id,
        workoutDate: new Date('2023-01-15'),
        startTime: '08:00',
        endTime: '09:00',
        exerciseName: 'Timestamp Test'
      };

      const session = new workoutSessionModel(sessionData);
      const savedSession = await session.save();

      expect(savedSession.createdAt).toBeDefined();
      expect(savedSession.updatedAt).toBeDefined();
      expect(savedSession.createdAt).toBeInstanceOf(Date);
      expect(savedSession.updatedAt).toBeInstanceOf(Date);
    });
  });
});
