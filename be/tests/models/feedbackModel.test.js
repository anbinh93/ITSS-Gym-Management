import mongoose from 'mongoose';
import { feedbackModel } from '../../models/feedbackModel.js';
import { userModel } from '../../models/userModel.js';

describe('Feedback Model Tests', () => {
  let testUser1, testUser2, testTrainer;

  beforeEach(async () => {
    await feedbackModel.deleteMany({});
    await userModel.deleteMany({});
    
    // Create test users
    testUser1 = await userModel.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'member'
    });

    testUser2 = await userModel.create({
      name: 'Jane Smith',
      email: 'jane@example.com', 
      password: 'password123',
      role: 'member'
    });

    testTrainer = await userModel.create({
      name: 'Trainer Mike',
      email: 'trainer@example.com',
      password: 'password123',
      role: 'trainer'
    });
  });

  afterAll(async () => {
    await feedbackModel.deleteMany({});
    await userModel.deleteMany({});
  });

  describe('Schema Validation', () => {
    test('should create feedback with valid data', async () => {
      const feedbackData = {
        user: testUser1._id,
        rating: 5,
        message: 'Excellent gym facilities and staff!',
        target: 'GYM',
        relatedUser: testTrainer._id
      };

      const feedback = new feedbackModel(feedbackData);
      const savedFeedback = await feedback.save();

      expect(savedFeedback.user.toString()).toBe(testUser1._id.toString());
      expect(savedFeedback.rating).toBe(5);
      expect(savedFeedback.message).toBe(feedbackData.message);
      expect(savedFeedback.target).toBe('GYM');
      expect(savedFeedback.relatedUser.toString()).toBe(testTrainer._id.toString());
      expect(savedFeedback._id).toBeDefined();
      expect(savedFeedback.createdAt).toBeDefined();
      expect(savedFeedback.updatedAt).toBeDefined();
    });

    test('should create feedback with minimal data', async () => {
      const feedback = new feedbackModel({
        user: testUser1._id,
        rating: 3
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback.user.toString()).toBe(testUser1._id.toString());
      expect(savedFeedback.rating).toBe(3);
      expect(savedFeedback._id).toBeDefined();
    });

    test('should create feedback without user reference', async () => {
      const feedback = new feedbackModel({
        rating: 4,
        message: 'Good service',
        target: 'STAFF'
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback.rating).toBe(4);
      expect(savedFeedback.message).toBe('Good service');
      expect(savedFeedback.target).toBe('STAFF');
    });
  });

  describe('Rating Field Validation', () => {
    test('should accept valid rating values', async () => {
      const validRatings = [1, 2, 3, 4, 5];
      
      for (const rating of validRatings) {
        const feedback = new feedbackModel({
          user: testUser1._id,
          rating: rating,
          message: `Rating ${rating} feedback`
        });
        
        const savedFeedback = await feedback.save();
        expect(savedFeedback.rating).toBe(rating);
      }
    });

    test('should reject rating below minimum', async () => {
      const feedback = new feedbackModel({
        user: testUser1._id,
        rating: 0,
        message: 'Invalid rating'
      });

      await expect(feedback.save()).rejects.toThrow(/rating.*less than minimum/i);
    });

    test('should reject rating above maximum', async () => {
      const feedback = new feedbackModel({
        user: testUser1._id,
        rating: 6,
        message: 'Invalid rating'
      });

      await expect(feedback.save()).rejects.toThrow(/rating.*greater than maximum/i);
    });

    test('should reject negative ratings', async () => {
      const feedback = new feedbackModel({
        user: testUser1._id,
        rating: -1,
        message: 'Negative rating'
      });

      await expect(feedback.save()).rejects.toThrow();
    });

    test('should handle decimal ratings (rounded)', async () => {
      const feedback = new feedbackModel({
        user: testUser1._id,
        rating: 3.7,
        message: 'Decimal rating'
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback.rating).toBe(3.7);
    });
  });

  describe('Target Field Validation', () => {
    test('should accept valid target values', async () => {
      const validTargets = ['GYM', 'STAFF', 'TRAINER'];
      
      for (const target of validTargets) {
        const feedback = new feedbackModel({
          user: testUser1._id,
          rating: 4,
          target: target,
          message: `Feedback for ${target}`
        });
        
        const savedFeedback = await feedback.save();
        expect(savedFeedback.target).toBe(target);
      }
    });

    test('should reject invalid target values', async () => {
      const feedback = new feedbackModel({
        user: testUser1._id,
        rating: 4,
        target: 'INVALID_TARGET',
        message: 'Invalid target'
      });

      await expect(feedback.save()).rejects.toThrow();
    });

    test('should accept feedback without target', async () => {
      const feedback = new feedbackModel({
        user: testUser1._id,
        rating: 4,
        message: 'General feedback'
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback.target).toBeUndefined();
    });
  });

  describe('User References', () => {
    test('should accept valid user ObjectId', async () => {
      const feedback = new feedbackModel({
        user: testUser1._id,
        rating: 4,
        message: 'Good experience'
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback.user.toString()).toBe(testUser1._id.toString());
    });

    test('should accept valid relatedUser ObjectId', async () => {
      const feedback = new feedbackModel({
        user: testUser1._id,
        rating: 5,
        target: 'TRAINER',
        relatedUser: testTrainer._id,
        message: 'Excellent trainer'
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback.relatedUser.toString()).toBe(testTrainer._id.toString());
    });

    test('should handle invalid ObjectId format', async () => {
      const feedback = new feedbackModel({
        user: 'invalid-object-id',
        rating: 4,
        message: 'Invalid user ID'
      });

      await expect(feedback.save()).rejects.toThrow();
    });

    test('should handle non-existent user reference', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const feedback = new feedbackModel({
        user: nonExistentId,
        rating: 4,
        message: 'Non-existent user'
      });

      // Should save successfully (referential integrity not enforced at schema level)
      const savedFeedback = await feedback.save();
      expect(savedFeedback.user.toString()).toBe(nonExistentId.toString());
    });
  });

  describe('Population Tests', () => {
    test('should populate user information', async () => {
      const feedback = await feedbackModel.create({
        user: testUser1._id,
        rating: 5,
        message: 'Great gym!',
        target: 'GYM'
      });

      const populatedFeedback = await feedbackModel
        .findById(feedback._id)
        .populate('user', 'name email role');

      expect(populatedFeedback.user.name).toBe('John Doe');
      expect(populatedFeedback.user.email).toBe('john@example.com');
      expect(populatedFeedback.user.role).toBe('member');
    });

    test('should populate relatedUser information', async () => {
      const feedback = await feedbackModel.create({
        user: testUser1._id,
        rating: 5,
        target: 'TRAINER',
        relatedUser: testTrainer._id,
        message: 'Amazing trainer!'
      });

      const populatedFeedback = await feedbackModel
        .findById(feedback._id)
        .populate('relatedUser', 'name role');

      expect(populatedFeedback.relatedUser.name).toBe('Trainer Mike');
      expect(populatedFeedback.relatedUser.role).toBe('trainer');
    });

    test('should populate both user and relatedUser', async () => {
      const feedback = await feedbackModel.create({
        user: testUser1._id,
        rating: 4,
        target: 'STAFF',
        relatedUser: testUser2._id,
        message: 'Helpful staff member'
      });

      const populatedFeedback = await feedbackModel
        .findById(feedback._id)
        .populate('user', 'name')
        .populate('relatedUser', 'name');

      expect(populatedFeedback.user.name).toBe('John Doe');
      expect(populatedFeedback.relatedUser.name).toBe('Jane Smith');
    });
  });

  describe('CRUD Operations', () => {
    test('should create feedback successfully', async () => {
      const feedbackData = {
        user: testUser1._id,
        rating: 4,
        message: 'Good facilities',
        target: 'GYM'
      };

      const feedback = await feedbackModel.create(feedbackData);
      expect(feedback.rating).toBe(4);
      expect(feedback.message).toBe('Good facilities');
      expect(feedback._id).toBeDefined();
    });

    test('should read feedback by ID', async () => {
      const feedback = await feedbackModel.create({
        user: testUser1._id,
        rating: 3,
        message: 'Average experience'
      });

      const foundFeedback = await feedbackModel.findById(feedback._id);
      expect(foundFeedback).toBeTruthy();
      expect(foundFeedback.rating).toBe(3);
      expect(foundFeedback.message).toBe('Average experience');
    });

    test('should update feedback', async () => {
      const feedback = await feedbackModel.create({
        user: testUser1._id,
        rating: 3,
        message: 'Initial feedback'
      });

      const updatedFeedback = await feedbackModel.findByIdAndUpdate(
        feedback._id,
        { 
          rating: 5,
          message: 'Updated: Excellent service!'
        },
        { new: true }
      );

      expect(updatedFeedback.rating).toBe(5);
      expect(updatedFeedback.message).toBe('Updated: Excellent service!');
    });

    test('should delete feedback', async () => {
      const feedback = await feedbackModel.create({
        user: testUser1._id,
        rating: 2,
        message: 'Delete this feedback'
      });

      await feedbackModel.findByIdAndDelete(feedback._id);
      const deletedFeedback = await feedbackModel.findById(feedback._id);
      expect(deletedFeedback).toBeNull();
    });
  });

  describe('Queries and Filtering', () => {
    beforeEach(async () => {
      await feedbackModel.insertMany([
        { user: testUser1._id, rating: 5, message: 'Excellent gym', target: 'GYM' },
        { user: testUser1._id, rating: 4, message: 'Good trainer', target: 'TRAINER', relatedUser: testTrainer._id },
        { user: testUser2._id, rating: 3, message: 'Average staff', target: 'STAFF' },
        { user: testUser2._id, rating: 2, message: 'Poor facilities', target: 'GYM' },
        { user: testUser1._id, rating: 5, message: 'Great experience', target: 'GYM' }
      ]);
    });

    test('should find feedback by user', async () => {
      const user1Feedback = await feedbackModel.find({ user: testUser1._id });
      const user2Feedback = await feedbackModel.find({ user: testUser2._id });
      
      expect(user1Feedback).toHaveLength(3);
      expect(user2Feedback).toHaveLength(2);
    });

    test('should find feedback by rating', async () => {
      const highRatingFeedback = await feedbackModel.find({ rating: { $gte: 4 } });
      const lowRatingFeedback = await feedbackModel.find({ rating: { $lte: 2 } });
      
      expect(highRatingFeedback).toHaveLength(3);
      expect(lowRatingFeedback).toHaveLength(1);
    });

    test('should find feedback by target', async () => {
      const gymFeedback = await feedbackModel.find({ target: 'GYM' });
      const trainerFeedback = await feedbackModel.find({ target: 'TRAINER' });
      const staffFeedback = await feedbackModel.find({ target: 'STAFF' });
      
      expect(gymFeedback).toHaveLength(3);
      expect(trainerFeedback).toHaveLength(1);
      expect(staffFeedback).toHaveLength(1);
    });

    test('should find feedback by message content', async () => {
      const excellentFeedback = await feedbackModel.find({ 
        message: { $regex: 'excellent', $options: 'i' } 
      });
      
      expect(excellentFeedback).toHaveLength(2);
    });

    test('should calculate average rating', async () => {
      const pipeline = [
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ];
      
      const result = await feedbackModel.aggregate(pipeline);
      expect(result[0].avgRating).toBe(3.8); // (5+4+3+2+5)/5
    });

    test('should count feedback by target', async () => {
      const pipeline = [
        { $group: { _id: '$target', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ];
      
      const result = await feedbackModel.aggregate(pipeline);
      expect(result).toHaveLength(3);
      expect(result[0]._id).toBe('GYM');
      expect(result[0].count).toBe(3);
    });

    test('should find recent feedback', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentFeedback = await feedbackModel.find({
        createdAt: { $gte: yesterday }
      });
      
      expect(recentFeedback).toHaveLength(5); // All feedback is recent
    });
  });

  describe('Timestamps', () => {
    test('should automatically set createdAt and updatedAt on create', async () => {
      const feedback = await feedbackModel.create({
        user: testUser1._id,
        rating: 4,
        message: 'Timestamped feedback'
      });

      expect(feedback.createdAt).toBeDefined();
      expect(feedback.updatedAt).toBeDefined();
      expect(feedback.createdAt instanceof Date).toBe(true);
      expect(feedback.updatedAt instanceof Date).toBe(true);
    });

    test('should update updatedAt on document modification', async () => {
      const feedback = await feedbackModel.create({
        user: testUser1._id,
        rating: 3,
        message: 'Original message'
      });
      
      const originalUpdatedAt = feedback.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      feedback.message = 'Updated message';
      await feedback.save();
      
      expect(feedback.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Edge Cases and Validation', () => {
    test('should handle long messages', async () => {
      const longMessage = 'A'.repeat(2000);
      const feedback = new feedbackModel({
        user: testUser1._id,
        rating: 4,
        message: longMessage
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback.message).toBe(longMessage);
    });

    test('should handle empty message', async () => {
      const feedback = new feedbackModel({
        user: testUser1._id,
        rating: 4,
        message: ''
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback.message).toBe('');
    });

    test('should handle special characters in message', async () => {
      const specialMessage = 'Great gym! 👍 5/5 ⭐⭐⭐⭐⭐';
      const feedback = new feedbackModel({
        user: testUser1._id,
        rating: 5,
        message: specialMessage
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback.message).toBe(specialMessage);
    });

    test('should handle feedback without message', async () => {
      const feedback = new feedbackModel({
        user: testUser1._id,
        rating: 4,
        target: 'GYM'
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback.message).toBeUndefined();
      expect(savedFeedback.rating).toBe(4);
    });
  });

  describe('Bulk Operations', () => {
    test('should handle bulk insert', async () => {
      const feedbackList = [
        { user: testUser1._id, rating: 5, message: 'Feedback 1', target: 'GYM' },
        { user: testUser2._id, rating: 4, message: 'Feedback 2', target: 'STAFF' },
        { user: testUser1._id, rating: 3, message: 'Feedback 3', target: 'TRAINER' }
      ];

      const insertedFeedback = await feedbackModel.insertMany(feedbackList);
      expect(insertedFeedback).toHaveLength(3);
      
      const allFeedback = await feedbackModel.find({});
      expect(allFeedback).toHaveLength(3);
    });

    test('should handle bulk update', async () => {
      await feedbackModel.insertMany([
        { user: testUser1._id, rating: 3, target: 'GYM' },
        { user: testUser2._id, rating: 3, target: 'GYM' },
        { user: testUser1._id, rating: 5, target: 'TRAINER' }
      ]);

      const result = await feedbackModel.updateMany(
        { rating: 3 },
        { message: 'Updated feedback message' }
      );

      expect(result.modifiedCount).toBe(2);
      
      const updatedFeedback = await feedbackModel.find({ 
        message: 'Updated feedback message' 
      });
      expect(updatedFeedback).toHaveLength(2);
    });

    test('should handle bulk delete', async () => {
      await feedbackModel.insertMany([
        { user: testUser1._id, rating: 2, target: 'GYM' },
        { user: testUser2._id, rating: 1, target: 'STAFF' },
        { user: testUser1._id, rating: 5, target: 'TRAINER' }
      ]);

      const result = await feedbackModel.deleteMany({ rating: { $lte: 2 } });
      expect(result.deletedCount).toBe(2);
      
      const remainingFeedback = await feedbackModel.find({});
      expect(remainingFeedback).toHaveLength(1);
      expect(remainingFeedback[0].rating).toBe(5);
    });
  });
});
