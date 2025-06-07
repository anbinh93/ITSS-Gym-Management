import mongoose from 'mongoose';
import { userModel } from '../models/userModel.js';

describe('User Model Test Suite', () => {
  
  describe('User Schema Validation', () => {
    test('should create a valid user with required fields', async () => {
      const validUser = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '0123456789',
        gender: 'Male',
        role: 'user'
      };

      const user = new userModel(validUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(validUser.name);
      expect(savedUser.email).toBe(validUser.email);
      expect(savedUser.role).toBe('user');
      expect(savedUser.isActive).toBe(true); // Default value
      expect(savedUser.membershipType).toBe('basic'); // Default value
    });

    test('should fail to create user without required email field', async () => {
      const invalidUser = {
        name: 'John Doe',
        password: 'password123'
      };

      const user = new userModel(invalidUser);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should fail to create user with duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      const user1 = new userModel(userData);
      await user1.save();

      const user2 = new userModel(userData);
      await expect(user2.save()).rejects.toThrow();
    });

    test('should fail to create user with duplicate username', async () => {
      const userData1 = {
        name: 'John Doe',
        email: 'john1@example.com',
        username: 'johndoe',
        password: 'password123'
      };

      const userData2 = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        username: 'johndoe', // Same username
        password: 'password123'
      };

      const user1 = new userModel(userData1);
      await user1.save();

      const user2 = new userModel(userData2);
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('User Role Validation', () => {
    test('should accept valid roles', async () => {
      const roles = ['admin', 'staff', 'coach', 'user'];
      
      for (const role of roles) {
        const userData = {
          name: `${role} User`,
          email: `${role}@example.com`,
          password: 'password123',
          role: role
        };

        const user = new userModel(userData);
        const savedUser = await user.save();
        expect(savedUser.role).toBe(role);
      }
    });

    test('should reject invalid role', async () => {
      const userData = {
        name: 'Invalid Role User',
        email: 'invalid@example.com',
        password: 'password123',
        role: 'invalid_role'
      };

      const user = new userModel(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('User Gender Validation', () => {
    test('should accept valid genders', async () => {
      const genders = ['Male', 'Female', 'Other', 'male', 'female', 'other'];
      
      for (let i = 0; i < genders.length; i++) {
        const userData = {
          name: `Gender Test User ${i}`,
          email: `gender${i}@example.com`,
          password: 'password123',
          gender: genders[i]
        };

        const user = new userModel(userData);
        const savedUser = await user.save();
        expect(savedUser.gender).toBe(genders[i]);
      }
    });

    test('should reject invalid gender', async () => {
      const userData = {
        name: 'Invalid Gender User',
        email: 'invalidgender@example.com',
        password: 'password123',
        gender: 'invalid_gender'
      };

      const user = new userModel(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('User Membership Type Validation', () => {
    test('should accept valid membership types', async () => {
      const membershipTypes = ['basic', 'standard', 'premium'];
      
      for (let i = 0; i < membershipTypes.length; i++) {
        const userData = {
          name: `Membership Test User ${i}`,
          email: `membership${i}@example.com`,
          password: 'password123',
          membershipType: membershipTypes[i]
        };

        const user = new userModel(userData);
        const savedUser = await user.save();
        expect(savedUser.membershipType).toBe(membershipTypes[i]);
      }
    });

    test('should default to basic membership type', async () => {
      const userData = {
        name: 'Default Membership User',
        email: 'default@example.com',
        password: 'password123'
      };

      const user = new userModel(userData);
      const savedUser = await user.save();
      expect(savedUser.membershipType).toBe('basic');
    });
  });

  describe('User Date Fields', () => {
    test('should handle date fields correctly', async () => {
      const startDate = new Date('2023-01-01');
      const expiryDate = new Date('2024-01-01');
      const dob = new Date('1990-05-15');

      const userData = {
        name: 'Date Test User',
        email: 'datetest@example.com',
        password: 'password123',
        startDate: startDate,
        expiryDate: expiryDate,
        dob: dob,
        birthYear: 1990
      };

      const user = new userModel(userData);
      const savedUser = await user.save();

      expect(savedUser.startDate).toEqual(startDate);
      expect(savedUser.expiryDate).toEqual(expiryDate);
      expect(savedUser.dob).toEqual(dob);
      expect(savedUser.birthYear).toBe(1990);
    });
  });

  describe('User CRUD Operations', () => {
    test('should find user by email', async () => {
      const userData = {
        name: 'Find Test User',
        email: 'findtest@example.com',
        password: 'password123'
      };

      const user = new userModel(userData);
      await user.save();

      const foundUser = await userModel.findOne({ email: 'findtest@example.com' });
      expect(foundUser).toBeTruthy();
      expect(foundUser.name).toBe('Find Test User');
    });

    test('should update user information', async () => {
      const userData = {
        name: 'Update Test User',
        email: 'updatetest@example.com',
        password: 'password123'
      };

      const user = new userModel(userData);
      const savedUser = await user.save();

      savedUser.name = 'Updated Name';
      savedUser.phone = '0987654321';
      const updatedUser = await savedUser.save();

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.phone).toBe('0987654321');
    });

    test('should delete user', async () => {
      const userData = {
        name: 'Delete Test User',
        email: 'deletetest@example.com',
        password: 'password123'
      };

      const user = new userModel(userData);
      const savedUser = await user.save();
      const userId = savedUser._id;

      await userModel.findByIdAndDelete(userId);
      
      const deletedUser = await userModel.findById(userId);
      expect(deletedUser).toBeNull();
    });

    test('should get all users with pagination', async () => {
      // Create multiple users
      const users = [];
      for (let i = 1; i <= 5; i++) {
        const userData = {
          name: `Pagination User ${i}`,
          email: `pagination${i}@example.com`,
          password: 'password123'
        };
        users.push(new userModel(userData));
      }

      await Promise.all(users.map(user => user.save()));

      const allUsers = await userModel.find();
      expect(allUsers.length).toBe(5);

      // Test pagination
      const paginatedUsers = await userModel.find().limit(3).skip(1);
      expect(paginatedUsers.length).toBe(3);
    });
  });

  describe('User Timestamps', () => {
    test('should automatically add createdAt and updatedAt timestamps', async () => {
      const userData = {
        name: 'Timestamp Test User',
        email: 'timestamp@example.com',
        password: 'password123'
      };

      const user = new userModel(userData);
      const savedUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    test('should update updatedAt when user is modified', async () => {
      const userData = {
        name: 'Update Timestamp User',
        email: 'updatetimestamp@example.com',
        password: 'password123'
      };

      const user = new userModel(userData);
      const savedUser = await user.save();
      const originalUpdatedAt = savedUser.updatedAt;

      // Wait a moment to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedUser.name = 'Modified Name';
      const updatedUser = await savedUser.save();

      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
