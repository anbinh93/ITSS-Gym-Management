import mongoose from 'mongoose';
import { membershipModel } from '../models/membershipModel.js';
import { userModel } from '../models/userModel.js';
import { packageModel } from '../models/packageModel.js';

describe('Membership Model Test Suite', () => {
  
  let testUser, testCoach, testPackage;

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
      price: 400000,
      withTrainer: true
    });
    await testPackage.save();
  });

  describe('Membership Schema Validation', () => {
    test('should create a valid membership with all fields', async () => {
      const membershipData = {
        user: testUser._id,
        coach: testCoach._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15,
        isActive: true,
        paymentStatus: 'paid',
        status: 'active'
      };

      const membership = new membershipModel(membershipData);
      const savedMembership = await membership.save();

      expect(savedMembership._id).toBeDefined();
      expect(savedMembership.user.toString()).toBe(testUser._id.toString());
      expect(savedMembership.coach.toString()).toBe(testCoach._id.toString());
      expect(savedMembership.package.toString()).toBe(testPackage._id.toString());
      expect(savedMembership.sessionsRemaining).toBe(15);
      expect(savedMembership.isActive).toBe(true);
      expect(savedMembership.paymentStatus).toBe('paid');
      expect(savedMembership.status).toBe('active');
    });

    test('should create membership with default values', async () => {
      const membershipData = {
        user: testUser._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15
      };

      const membership = new membershipModel(membershipData);
      const savedMembership = await membership.save();

      expect(savedMembership.paymentStatus).toBe('unpaid'); // Default value
      expect(savedMembership.status).toBe('active'); // Default value
    });

    test('should create membership without coach (self-training)', async () => {
      const membershipData = {
        user: testUser._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15,
        isActive: true
      };

      const membership = new membershipModel(membershipData);
      const savedMembership = await membership.save();

      expect(savedMembership.coach).toBeUndefined();
      expect(savedMembership.user.toString()).toBe(testUser._id.toString());
    });
  });

  describe('Membership Payment Status Validation', () => {
    test('should accept valid payment statuses', async () => {
      const paymentStatuses = ['paid', 'unpaid'];
      
      for (let i = 0; i < paymentStatuses.length; i++) {
        const membershipData = {
          user: testUser._id,
          package: testPackage._id,
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-01-31'),
          sessionsRemaining: 15,
          paymentStatus: paymentStatuses[i]
        };

        const membership = new membershipModel(membershipData);
        const savedMembership = await membership.save();
        expect(savedMembership.paymentStatus).toBe(paymentStatuses[i]);
      }
    });

    test('should reject invalid payment status', async () => {
      const membershipData = {
        user: testUser._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15,
        paymentStatus: 'invalid_status'
      };

      const membership = new membershipModel(membershipData);
      await expect(membership.save()).rejects.toThrow();
    });
  });

  describe('Membership Status Validation', () => {
    test('should accept valid membership statuses', async () => {
      const statuses = ['active', 'inactive'];
      
      for (let i = 0; i < statuses.length; i++) {
        const membershipData = {
          user: testUser._id,
          package: testPackage._id,
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-01-31'),
          sessionsRemaining: 15,
          status: statuses[i]
        };

        const membership = new membershipModel(membershipData);
        const savedMembership = await membership.save();
        expect(savedMembership.status).toBe(statuses[i]);
      }
    });

    test('should reject invalid membership status', async () => {
      const membershipData = {
        user: testUser._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15,
        status: 'invalid_status'
      };

      const membership = new membershipModel(membershipData);
      await expect(membership.save()).rejects.toThrow();
    });
  });

  describe('Membership Relationships', () => {
    test('should populate user information', async () => {
      const membershipData = {
        user: testUser._id,
        coach: testCoach._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15
      };

      const membership = new membershipModel(membershipData);
      const savedMembership = await membership.save();

      const membershipWithUser = await membershipModel
        .findById(savedMembership._id)
        .populate('user');

      expect(membershipWithUser.user.name).toBe('Test User');
      expect(membershipWithUser.user.email).toBe('testuser@example.com');
    });

    test('should populate coach information', async () => {
      const membershipData = {
        user: testUser._id,
        coach: testCoach._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15
      };

      const membership = new membershipModel(membershipData);
      const savedMembership = await membership.save();

      const membershipWithCoach = await membershipModel
        .findById(savedMembership._id)
        .populate('coach');

      expect(membershipWithCoach.coach.name).toBe('Test Coach');
      expect(membershipWithCoach.coach.role).toBe('coach');
    });

    test('should populate package information', async () => {
      const membershipData = {
        user: testUser._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15
      };

      const membership = new membershipModel(membershipData);
      const savedMembership = await membership.save();

      const membershipWithPackage = await membershipModel
        .findById(savedMembership._id)
        .populate('package');

      expect(membershipWithPackage.package.name).toBe('Test Package');
      expect(membershipWithPackage.package.durationInDays).toBe(30);
    });

    test('should populate all relationships', async () => {
      const membershipData = {
        user: testUser._id,
        coach: testCoach._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15
      };

      const membership = new membershipModel(membershipData);
      const savedMembership = await membership.save();

      const fullMembership = await membershipModel
        .findById(savedMembership._id)
        .populate('user coach package');

      expect(fullMembership.user.name).toBe('Test User');
      expect(fullMembership.coach.name).toBe('Test Coach');
      expect(fullMembership.package.name).toBe('Test Package');
    });
  });

  describe('Membership CRUD Operations', () => {
    test('should find memberships by user', async () => {
      const membershipData = {
        user: testUser._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15
      };

      const membership = new membershipModel(membershipData);
      await membership.save();

      const userMemberships = await membershipModel.find({ user: testUser._id });
      expect(userMemberships.length).toBe(1);
      expect(userMemberships[0].user.toString()).toBe(testUser._id.toString());
    });

    test('should find memberships by coach', async () => {
      const membershipData = {
        user: testUser._id,
        coach: testCoach._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15
      };

      const membership = new membershipModel(membershipData);
      await membership.save();

      const coachMemberships = await membershipModel.find({ coach: testCoach._id });
      expect(coachMemberships.length).toBe(1);
      expect(coachMemberships[0].coach.toString()).toBe(testCoach._id.toString());
    });

    test('should update membership sessions remaining', async () => {
      const membershipData = {
        user: testUser._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15
      };

      const membership = new membershipModel(membershipData);
      const savedMembership = await membership.save();

      // Simulate using a session
      savedMembership.sessionsRemaining -= 1;
      const updatedMembership = await savedMembership.save();

      expect(updatedMembership.sessionsRemaining).toBe(14);
    });

    test('should update membership status', async () => {
      const membershipData = {
        user: testUser._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15,
        status: 'active'
      };

      const membership = new membershipModel(membershipData);
      const savedMembership = await membership.save();

      savedMembership.status = 'inactive';
      savedMembership.isActive = false;
      const updatedMembership = await savedMembership.save();

      expect(updatedMembership.status).toBe('inactive');
      expect(updatedMembership.isActive).toBe(false);
    });

    test('should delete membership', async () => {
      const membershipData = {
        user: testUser._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15
      };

      const membership = new membershipModel(membershipData);
      const savedMembership = await membership.save();
      const membershipId = savedMembership._id;

      await membershipModel.findByIdAndDelete(membershipId);
      
      const deletedMembership = await membershipModel.findById(membershipId);
      expect(deletedMembership).toBeNull();
    });
  });

  describe('Membership Date Handling', () => {
    test('should handle date fields correctly', async () => {
      const startDate = new Date('2023-06-01');
      const endDate = new Date('2023-06-30');

      const membershipData = {
        user: testUser._id,
        package: testPackage._id,
        startDate: startDate,
        endDate: endDate,
        sessionsRemaining: 15
      };

      const membership = new membershipModel(membershipData);
      const savedMembership = await membership.save();

      expect(savedMembership.startDate).toEqual(startDate);
      expect(savedMembership.endDate).toEqual(endDate);
    });

    test('should find active memberships by date range', async () => {
      const today = new Date();
      const future = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      const membershipData = {
        user: testUser._id,
        package: testPackage._id,
        startDate: today,
        endDate: future,
        sessionsRemaining: 15,
        status: 'active'
      };

      const membership = new membershipModel(membershipData);
      await membership.save();

      const activeMemberships = await membershipModel.find({
        startDate: { $lte: today },
        endDate: { $gte: today },
        status: 'active'
      });

      expect(activeMemberships.length).toBe(1);
    });
  });

  describe('Membership Timestamps', () => {
    test('should automatically add createdAt and updatedAt timestamps', async () => {
      const membershipData = {
        user: testUser._id,
        package: testPackage._id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        sessionsRemaining: 15
      };

      const membership = new membershipModel(membershipData);
      const savedMembership = await membership.save();

      expect(savedMembership.createdAt).toBeDefined();
      expect(savedMembership.updatedAt).toBeDefined();
      expect(savedMembership.createdAt).toBeInstanceOf(Date);
      expect(savedMembership.updatedAt).toBeInstanceOf(Date);
    });
  });
});
