import mongoose from 'mongoose';
import { progressModel } from '../../models/progressModel.js';
import { userModel } from '../../models/userModel.js';

describe('Progress Model Tests', () => {
  let testUser1, testUser2;

  beforeEach(async () => {
    await progressModel.deleteMany({});
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
  });

  afterAll(async () => {
    await progressModel.deleteMany({});
    await userModel.deleteMany({});
  });

  describe('Schema Validation', () => {
    test('should create progress with valid data', async () => {
      const progressData = {
        user: testUser1._id,
        weightHeight: [
          { date: '2024-01-01', weight: 70.5, height: 175 },
          { date: '2024-01-15', weight: 69.8, height: 175 }
        ],
        calories: [
          { date: '2024-01-01', goal: 2000, actual: 1850 },
          { date: '2024-01-02', goal: 2000, actual: 2100 }
        ],
        bodyFat: [
          { date: '2024-01-01', value: 15.5 },
          { date: '2024-01-15', value: 14.8 }
        ]
      };

      const progress = new progressModel(progressData);
      const savedProgress = await progress.save();

      expect(savedProgress.user.toString()).toBe(testUser1._id.toString());
      expect(savedProgress.weightHeight).toHaveLength(2);
      expect(savedProgress.calories).toHaveLength(2);
      expect(savedProgress.bodyFat).toHaveLength(2);
      expect(savedProgress._id).toBeDefined();
    });

    test('should create progress with minimal required data', async () => {
      const progress = new progressModel({
        user: testUser1._id
      });

      const savedProgress = await progress.save();
      expect(savedProgress.user.toString()).toBe(testUser1._id.toString());
      expect(savedProgress.weightHeight).toEqual([]);
      expect(savedProgress.calories).toEqual([]);
      expect(savedProgress.bodyFat).toEqual([]);
    });

    test('should fail validation when user is missing', async () => {
      const progress = new progressModel({
        weightHeight: [{ date: '2024-01-01', weight: 70, height: 175 }]
      });

      await expect(progress.save()).rejects.toThrow(/user.*required/i);
    });

    test('should fail validation with invalid user ObjectId', async () => {
      const progress = new progressModel({
        user: 'invalid-object-id'
      });

      await expect(progress.save()).rejects.toThrow();
    });
  });

  describe('WeightHeight Array Validation', () => {
    test('should handle single weight/height entry', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        weightHeight: [
          { date: '2024-01-01', weight: 75.0, height: 180 }
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.weightHeight).toHaveLength(1);
      expect(savedProgress.weightHeight[0].date).toBe('2024-01-01');
      expect(savedProgress.weightHeight[0].weight).toBe(75.0);
      expect(savedProgress.weightHeight[0].height).toBe(180);
    });

    test('should handle multiple weight/height entries', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        weightHeight: [
          { date: '2024-01-01', weight: 75.0, height: 180 },
          { date: '2024-01-15', weight: 74.5, height: 180 },
          { date: '2024-02-01', weight: 74.0, height: 180 }
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.weightHeight).toHaveLength(3);
      
      // Check progression
      expect(savedProgress.weightHeight[0].weight).toBe(75.0);
      expect(savedProgress.weightHeight[1].weight).toBe(74.5);
      expect(savedProgress.weightHeight[2].weight).toBe(74.0);
    });

    test('should handle decimal weight values', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        weightHeight: [
          { date: '2024-01-01', weight: 72.75, height: 175.5 }
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.weightHeight[0].weight).toBe(72.75);
      expect(savedProgress.weightHeight[0].height).toBe(175.5);
    });

    test('should handle missing weight or height in entry', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        weightHeight: [
          { date: '2024-01-01', weight: 70 }, // missing height
          { date: '2024-01-02', height: 175 }, // missing weight
          { date: '2024-01-03' } // missing both
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.weightHeight).toHaveLength(3);
      expect(savedProgress.weightHeight[0].height).toBeUndefined();
      expect(savedProgress.weightHeight[1].weight).toBeUndefined();
    });

    test('should handle negative weight values', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        weightHeight: [
          { date: '2024-01-01', weight: -70, height: 175 }
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.weightHeight[0].weight).toBe(-70);
    });
  });

  describe('Calories Array Validation', () => {
    test('should handle single calorie entry', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        calories: [
          { date: '2024-01-01', goal: 2000, actual: 1850 }
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.calories).toHaveLength(1);
      expect(savedProgress.calories[0].date).toBe('2024-01-01');
      expect(savedProgress.calories[0].goal).toBe(2000);
      expect(savedProgress.calories[0].actual).toBe(1850);
    });

    test('should handle multiple calorie entries', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        calories: [
          { date: '2024-01-01', goal: 2000, actual: 1850 },
          { date: '2024-01-02', goal: 2000, actual: 2100 },
          { date: '2024-01-03', goal: 2200, actual: 2050 }
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.calories).toHaveLength(3);
      
      // Check different goal/actual combinations
      expect(savedProgress.calories[0].actual).toBeLessThan(savedProgress.calories[0].goal);
      expect(savedProgress.calories[1].actual).toBeGreaterThan(savedProgress.calories[1].goal);
    });

    test('should handle missing goal or actual values', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        calories: [
          { date: '2024-01-01', goal: 2000 }, // missing actual
          { date: '2024-01-02', actual: 1800 }, // missing goal
          { date: '2024-01-03' } // missing both
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.calories).toHaveLength(3);
      expect(savedProgress.calories[0].actual).toBeUndefined();
      expect(savedProgress.calories[1].goal).toBeUndefined();
    });

    test('should handle zero calorie values', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        calories: [
          { date: '2024-01-01', goal: 0, actual: 0 }
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.calories[0].goal).toBe(0);
      expect(savedProgress.calories[0].actual).toBe(0);
    });

    test('should handle negative calorie values', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        calories: [
          { date: '2024-01-01', goal: -2000, actual: -1800 }
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.calories[0].goal).toBe(-2000);
      expect(savedProgress.calories[0].actual).toBe(-1800);
    });
  });

  describe('BodyFat Array Validation', () => {
    test('should handle single body fat entry', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        bodyFat: [
          { date: '2024-01-01', value: 15.5 }
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.bodyFat).toHaveLength(1);
      expect(savedProgress.bodyFat[0].date).toBe('2024-01-01');
      expect(savedProgress.bodyFat[0].value).toBe(15.5);
    });

    test('should handle multiple body fat entries', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        bodyFat: [
          { date: '2024-01-01', value: 18.0 },
          { date: '2024-01-15', value: 17.5 },
          { date: '2024-02-01', value: 16.8 }
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.bodyFat).toHaveLength(3);
      
      // Check progression (decreasing body fat)
      expect(savedProgress.bodyFat[0].value).toBe(18.0);
      expect(savedProgress.bodyFat[1].value).toBe(17.5);
      expect(savedProgress.bodyFat[2].value).toBe(16.8);
    });

    test('should handle decimal body fat values', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        bodyFat: [
          { date: '2024-01-01', value: 12.75 }
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.bodyFat[0].value).toBe(12.75);
    });

    test('should handle missing body fat value', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        bodyFat: [
          { date: '2024-01-01' } // missing value
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.bodyFat).toHaveLength(1);
      expect(savedProgress.bodyFat[0].value).toBeUndefined();
    });

    test('should handle zero body fat value', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        bodyFat: [
          { date: '2024-01-01', value: 0 }
        ]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.bodyFat[0].value).toBe(0);
    });
  });

  describe('User Population', () => {
    test('should populate user information', async () => {
      const progress = await progressModel.create({
        user: testUser1._id,
        weightHeight: [{ date: '2024-01-01', weight: 70, height: 175 }]
      });

      const populatedProgress = await progressModel
        .findById(progress._id)
        .populate('user', 'name email role');

      expect(populatedProgress.user.name).toBe('John Doe');
      expect(populatedProgress.user.email).toBe('john@example.com');
      expect(populatedProgress.user.role).toBe('member');
    });

    test('should handle non-existent user reference', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const progress = new progressModel({
        user: nonExistentId,
        weightHeight: [{ date: '2024-01-01', weight: 70, height: 175 }]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.user.toString()).toBe(nonExistentId.toString());
    });
  });

  describe('CRUD Operations', () => {
    test('should create progress successfully', async () => {
      const progressData = {
        user: testUser1._id,
        weightHeight: [{ date: '2024-01-01', weight: 75, height: 180 }],
        calories: [{ date: '2024-01-01', goal: 2000, actual: 1900 }]
      };

      const progress = await progressModel.create(progressData);
      expect(progress.weightHeight).toHaveLength(1);
      expect(progress.calories).toHaveLength(1);
      expect(progress._id).toBeDefined();
    });

    test('should read progress by ID', async () => {
      const progress = await progressModel.create({
        user: testUser1._id,
        bodyFat: [{ date: '2024-01-01', value: 15.0 }]
      });

      const foundProgress = await progressModel.findById(progress._id);
      expect(foundProgress).toBeTruthy();
      expect(foundProgress.bodyFat).toHaveLength(1);
      expect(foundProgress.bodyFat[0].value).toBe(15.0);
    });

    test('should update progress by adding new entries', async () => {
      const progress = await progressModel.create({
        user: testUser1._id,
        weightHeight: [{ date: '2024-01-01', weight: 75, height: 180 }]
      });

      const updatedProgress = await progressModel.findByIdAndUpdate(
        progress._id,
        { 
          $push: { 
            weightHeight: { date: '2024-01-15', weight: 74.5, height: 180 },
            calories: { date: '2024-01-15', goal: 2000, actual: 1950 }
          }
        },
        { new: true }
      );

      expect(updatedProgress.weightHeight).toHaveLength(2);
      expect(updatedProgress.calories).toHaveLength(1);
      expect(updatedProgress.weightHeight[1].weight).toBe(74.5);
    });

    test('should delete progress', async () => {
      const progress = await progressModel.create({
        user: testUser1._id,
        weightHeight: [{ date: '2024-01-01', weight: 70, height: 175 }]
      });

      await progressModel.findByIdAndDelete(progress._id);
      const deletedProgress = await progressModel.findById(progress._id);
      expect(deletedProgress).toBeNull();
    });
  });

  describe('Queries and Filtering', () => {
    beforeEach(async () => {
      await progressModel.insertMany([
        {
          user: testUser1._id,
          weightHeight: [
            { date: '2024-01-01', weight: 75, height: 180 },
            { date: '2024-01-15', weight: 74.5, height: 180 }
          ],
          calories: [{ date: '2024-01-01', goal: 2000, actual: 1900 }]
        },
        {
          user: testUser2._id,
          weightHeight: [{ date: '2024-01-01', weight: 65, height: 165 }],
          bodyFat: [{ date: '2024-01-01', value: 20.0 }]
        }
      ]);
    });

    test('should find progress by user', async () => {
      const user1Progress = await progressModel.find({ user: testUser1._id });
      const user2Progress = await progressModel.find({ user: testUser2._id });
      
      expect(user1Progress).toHaveLength(1);
      expect(user2Progress).toHaveLength(1);
      expect(user1Progress[0].weightHeight).toHaveLength(2);
      expect(user2Progress[0].bodyFat).toHaveLength(1);
    });

    test('should find progress with weight data', async () => {
      const progressWithWeight = await progressModel.find({
        'weightHeight.0': { $exists: true }
      });
      
      expect(progressWithWeight).toHaveLength(2);
    });

    test('should find progress with calories data', async () => {
      const progressWithCalories = await progressModel.find({
        'calories.0': { $exists: true }
      });
      
      expect(progressWithCalories).toHaveLength(1);
    });

    test('should find progress with body fat data', async () => {
      const progressWithBodyFat = await progressModel.find({
        'bodyFat.0': { $exists: true }
      });
      
      expect(progressWithBodyFat).toHaveLength(1);
    });

    test('should find progress by weight range', async () => {
      const progressInWeightRange = await progressModel.find({
        'weightHeight.weight': { $gte: 70, $lte: 80 }
      });
      
      expect(progressInWeightRange).toHaveLength(1);
      expect(progressInWeightRange[0].user.toString()).toBe(testUser1._id.toString());
    });

    test('should find progress by date', async () => {
      const progressOnDate = await progressModel.find({
        $or: [
          { 'weightHeight.date': '2024-01-01' },
          { 'calories.date': '2024-01-01' },
          { 'bodyFat.date': '2024-01-01' }
        ]
      });
      
      expect(progressOnDate).toHaveLength(2);
    });
  });

  describe('Array Operations', () => {
    test('should add new weight entry using $push', async () => {
      const progress = await progressModel.create({
        user: testUser1._id,
        weightHeight: [{ date: '2024-01-01', weight: 75, height: 180 }]
      });

      await progressModel.findByIdAndUpdate(
        progress._id,
        { $push: { weightHeight: { date: '2024-01-15', weight: 74, height: 180 } } }
      );

      const updatedProgress = await progressModel.findById(progress._id);
      expect(updatedProgress.weightHeight).toHaveLength(2);
      expect(updatedProgress.weightHeight[1].weight).toBe(74);
    });

    test('should remove weight entry using $pull', async () => {
      const progress = await progressModel.create({
        user: testUser1._id,
        weightHeight: [
          { date: '2024-01-01', weight: 75, height: 180 },
          { date: '2024-01-15', weight: 74, height: 180 }
        ]
      });

      await progressModel.findByIdAndUpdate(
        progress._id,
        { $pull: { weightHeight: { date: '2024-01-01' } } }
      );

      const updatedProgress = await progressModel.findById(progress._id);
      expect(updatedProgress.weightHeight).toHaveLength(1);
      expect(updatedProgress.weightHeight[0].date).toBe('2024-01-15');
    });

    test('should update specific array element', async () => {
      const progress = await progressModel.create({
        user: testUser1._id,
        calories: [
          { date: '2024-01-01', goal: 2000, actual: 1800 }
        ]
      });

      await progressModel.findByIdAndUpdate(
        progress._id,
        { $set: { 'calories.0.actual': 1900 } }
      );

      const updatedProgress = await progressModel.findById(progress._id);
      expect(updatedProgress.calories[0].actual).toBe(1900);
    });
  });

  describe('Edge Cases and Validation', () => {
    test('should handle empty arrays', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        weightHeight: [],
        calories: [],
        bodyFat: []
      });

      const savedProgress = await progress.save();
      expect(savedProgress.weightHeight).toEqual([]);
      expect(savedProgress.calories).toEqual([]);
      expect(savedProgress.bodyFat).toEqual([]);
    });

    test('should handle arrays with only date entries', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        weightHeight: [{ date: '2024-01-01' }],
        calories: [{ date: '2024-01-01' }],
        bodyFat: [{ date: '2024-01-01' }]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.weightHeight[0].date).toBe('2024-01-01');
      expect(savedProgress.weightHeight[0].weight).toBeUndefined();
      expect(savedProgress.weightHeight[0].height).toBeUndefined();
    });

    test('should handle large numbers', async () => {
      const progress = new progressModel({
        user: testUser1._id,
        calories: [{ date: '2024-01-01', goal: 999999, actual: 888888 }]
      });

      const savedProgress = await progress.save();
      expect(savedProgress.calories[0].goal).toBe(999999);
      expect(savedProgress.calories[0].actual).toBe(888888);
    });

    test('should handle many array entries', async () => {
      const manyEntries = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        weight: 70 + i * 0.1,
        height: 175
      }));

      const progress = new progressModel({
        user: testUser1._id,
        weightHeight: manyEntries
      });

      const savedProgress = await progress.save();
      expect(savedProgress.weightHeight).toHaveLength(100);
      expect(savedProgress.weightHeight[99].weight).toBe(79.9);
    });
  });

  describe('Aggregation Operations', () => {
    beforeEach(async () => {
      await progressModel.create({
        user: testUser1._id,
        weightHeight: [
          { date: '2024-01-01', weight: 75, height: 180 },
          { date: '2024-01-15', weight: 74.5, height: 180 },
          { date: '2024-02-01', weight: 74, height: 180 }
        ],
        calories: [
          { date: '2024-01-01', goal: 2000, actual: 1900 },
          { date: '2024-01-02', goal: 2000, actual: 2100 }
        ]
      });
    });

    test('should calculate weight loss', async () => {
      const pipeline = [
        { $match: { user: testUser1._id } },
        { $unwind: '$weightHeight' },
        { $sort: { 'weightHeight.date': 1 } },
        {
          $group: {
            _id: '$user',
            firstWeight: { $first: '$weightHeight.weight' },
            lastWeight: { $last: '$weightHeight.weight' }
          }
        },
        {
          $project: {
            weightLoss: { $subtract: ['$firstWeight', '$lastWeight'] }
          }
        }
      ];

      const result = await progressModel.aggregate(pipeline);
      expect(result[0].weightLoss).toBe(1); // 75 - 74 = 1
    });

    test('should calculate average daily calories', async () => {
      const pipeline = [
        { $match: { user: testUser1._id } },
        { $unwind: '$calories' },
        {
          $group: {
            _id: '$user',
            avgGoal: { $avg: '$calories.goal' },
            avgActual: { $avg: '$calories.actual' }
          }
        }
      ];

      const result = await progressModel.aggregate(pipeline);
      expect(result[0].avgGoal).toBe(2000);
      expect(result[0].avgActual).toBe(2000); // (1900 + 2100) / 2
    });
  });
});
