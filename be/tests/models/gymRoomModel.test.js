import mongoose from 'mongoose';
import { gymRoomModel } from '../../models/gymRoomModel.js';

describe('GymRoom Model Tests', () => {
  beforeEach(async () => {
    await gymRoomModel.deleteMany({});
  });

  afterAll(async () => {
    await gymRoomModel.deleteMany({});
  });

  describe('Schema Validation', () => {
    test('should create gym room with valid data', async () => {
      const roomData = {
        name: 'Main Workout Room',
        location: 'Ground Floor - East Wing',
        capacity: 50,
        description: 'Large room with cardio and strength equipment',
        status: 'available'
      };

      const room = new gymRoomModel(roomData);
      const savedRoom = await room.save();

      expect(savedRoom.name).toBe(roomData.name);
      expect(savedRoom.location).toBe(roomData.location);
      expect(savedRoom.capacity).toBe(roomData.capacity);
      expect(savedRoom.description).toBe(roomData.description);
      expect(savedRoom.status).toBe(roomData.status);
      expect(savedRoom._id).toBeDefined();
      expect(savedRoom.createdAt).toBeDefined();
      expect(savedRoom.updatedAt).toBeDefined();
    });

    test('should create gym room with only required fields', async () => {
      const room = new gymRoomModel({
        name: 'Yoga Studio'
      });

      const savedRoom = await room.save();
      expect(savedRoom.name).toBe('Yoga Studio');
      expect(savedRoom.status).toBe('available'); // default value
      expect(savedRoom._id).toBeDefined();
    });

    test('should fail validation when name is missing', async () => {
      const room = new gymRoomModel({
        location: 'Second Floor',
        capacity: 30
      });

      await expect(room.save()).rejects.toThrow(/name.*required/i);
    });

    test('should fail validation when name is empty string', async () => {
      const room = new gymRoomModel({
        name: ''
      });

      await expect(room.save()).rejects.toThrow();
    });
  });

  describe('Unique Name Constraint', () => {
    test('should enforce unique name constraint', async () => {
      await gymRoomModel.create({
        name: 'Cardio Room'
      });

      const duplicateRoom = new gymRoomModel({
        name: 'Cardio Room'
      });

      await expect(duplicateRoom.save()).rejects.toThrow(/duplicate key/i);
    });

    test('should allow same name after deletion', async () => {
      const room1 = await gymRoomModel.create({
        name: 'Temporary Room'
      });

      await gymRoomModel.findByIdAndDelete(room1._id);

      const room2 = new gymRoomModel({
        name: 'Temporary Room'
      });

      const savedRoom = await room2.save();
      expect(savedRoom.name).toBe('Temporary Room');
    });

    test('should be case sensitive for names', async () => {
      await gymRoomModel.create({
        name: 'cardio room'
      });

      const room = new gymRoomModel({
        name: 'Cardio Room'
      });

      const savedRoom = await room.save();
      expect(savedRoom.name).toBe('Cardio Room');
    });
  });

  describe('Status Field Validation', () => {
    test('should accept valid status values', async () => {
      const validStatuses = ['available', 'unavailable'];
      
      for (const status of validStatuses) {
        const room = new gymRoomModel({
          name: `Room ${status}`,
          status: status
        });
        
        const savedRoom = await room.save();
        expect(savedRoom.status).toBe(status);
      }
    });

    test('should use default status when not specified', async () => {
      const room = new gymRoomModel({
        name: 'Default Status Room'
      });
      
      const savedRoom = await room.save();
      expect(savedRoom.status).toBe('available');
    });

    test('should reject invalid status values', async () => {
      const room = new gymRoomModel({
        name: 'Invalid Status Room',
        status: 'closed'
      });

      await expect(room.save()).rejects.toThrow();
    });

    test('should reject empty string status', async () => {
      const room = new gymRoomModel({
        name: 'Empty Status Room',
        status: ''
      });

      await expect(room.save()).rejects.toThrow();
    });
  });

  describe('Data Types Validation', () => {
    test('should handle string fields correctly', async () => {
      const room = new gymRoomModel({
        name: 'String Test Room',
        location: 'Test Location',
        description: 'Test Description'
      });

      const savedRoom = await room.save();
      expect(typeof savedRoom.name).toBe('string');
      expect(typeof savedRoom.location).toBe('string');
      expect(typeof savedRoom.description).toBe('string');
    });

    test('should handle number fields correctly', async () => {
      const room = new gymRoomModel({
        name: 'Number Test Room',
        capacity: 100
      });

      const savedRoom = await room.save();
      expect(typeof savedRoom.capacity).toBe('number');
      expect(savedRoom.capacity).toBe(100);
    });

    test('should handle zero capacity', async () => {
      const room = new gymRoomModel({
        name: 'Zero Capacity Room',
        capacity: 0
      });

      const savedRoom = await room.save();
      expect(savedRoom.capacity).toBe(0);
    });

    test('should handle negative capacity', async () => {
      const room = new gymRoomModel({
        name: 'Negative Capacity Room',
        capacity: -10
      });

      const savedRoom = await room.save();
      expect(savedRoom.capacity).toBe(-10);
    });

    test('should handle decimal capacity', async () => {
      const room = new gymRoomModel({
        name: 'Decimal Capacity Room',
        capacity: 25.5
      });

      const savedRoom = await room.save();
      expect(savedRoom.capacity).toBe(25.5);
    });
  });

  describe('CRUD Operations', () => {
    test('should create gym room successfully', async () => {
      const roomData = {
        name: 'CrossFit Box',
        location: 'Basement Level',
        capacity: 20,
        description: 'High-intensity functional fitness area'
      };

      const room = await gymRoomModel.create(roomData);
      expect(room.name).toBe(roomData.name);
      expect(room.capacity).toBe(roomData.capacity);
      expect(room._id).toBeDefined();
    });

    test('should read gym room by ID', async () => {
      const room = await gymRoomModel.create({
        name: 'Reading Test Room',
        capacity: 15
      });

      const foundRoom = await gymRoomModel.findById(room._id);
      expect(foundRoom).toBeTruthy();
      expect(foundRoom.name).toBe('Reading Test Room');
      expect(foundRoom.capacity).toBe(15);
    });

    test('should update gym room', async () => {
      const room = await gymRoomModel.create({
        name: 'Update Test Room',
        capacity: 25,
        status: 'available'
      });

      const updatedRoom = await gymRoomModel.findByIdAndUpdate(
        room._id,
        { 
          status: 'unavailable',
          description: 'Under maintenance'
        },
        { new: true }
      );

      expect(updatedRoom.status).toBe('unavailable');
      expect(updatedRoom.description).toBe('Under maintenance');
      expect(updatedRoom.name).toBe('Update Test Room'); // unchanged
    });

    test('should delete gym room', async () => {
      const room = await gymRoomModel.create({
        name: 'Delete Test Room'
      });

      await gymRoomModel.findByIdAndDelete(room._id);
      const deletedRoom = await gymRoomModel.findById(room._id);
      expect(deletedRoom).toBeNull();
    });
  });

  describe('Queries and Filtering', () => {
    beforeEach(async () => {
      await gymRoomModel.insertMany([
        { name: 'Cardio Room', location: 'Floor 1', capacity: 30, status: 'available' },
        { name: 'Weight Room', location: 'Floor 1', capacity: 40, status: 'available' },
        { name: 'Yoga Studio', location: 'Floor 2', capacity: 20, status: 'unavailable' },
        { name: 'Boxing Ring', location: 'Floor 2', capacity: 15, status: 'available' },
        { name: 'Pool Area', location: 'Basement', capacity: 50, status: 'unavailable' }
      ]);
    });

    test('should find rooms by status', async () => {
      const availableRooms = await gymRoomModel.find({ status: 'available' });
      const unavailableRooms = await gymRoomModel.find({ status: 'unavailable' });
      
      expect(availableRooms).toHaveLength(3);
      expect(unavailableRooms).toHaveLength(2);
      
      const availableNames = availableRooms.map(r => r.name);
      expect(availableNames).toContain('Cardio Room');
      expect(availableNames).toContain('Weight Room');
      expect(availableNames).toContain('Boxing Ring');
    });

    test('should find rooms by location', async () => {
      const floor1Rooms = await gymRoomModel.find({ location: 'Floor 1' });
      const floor2Rooms = await gymRoomModel.find({ location: 'Floor 2' });
      
      expect(floor1Rooms).toHaveLength(2);
      expect(floor2Rooms).toHaveLength(2);
      
      expect(floor1Rooms.map(r => r.name)).toContain('Cardio Room');
      expect(floor1Rooms.map(r => r.name)).toContain('Weight Room');
    });

    test('should find rooms by capacity range', async () => {
      const smallRooms = await gymRoomModel.find({ capacity: { $lt: 25 } });
      const largeRooms = await gymRoomModel.find({ capacity: { $gte: 40 } });
      
      expect(smallRooms).toHaveLength(2);
      expect(largeRooms).toHaveLength(2);
      
      expect(smallRooms.map(r => r.name)).toContain('Yoga Studio');
      expect(smallRooms.map(r => r.name)).toContain('Boxing Ring');
    });

    test('should find rooms by name pattern', async () => {
      const roomsWithRoom = await gymRoomModel.find({ 
        name: { $regex: 'Room', $options: 'i' } 
      });
      
      expect(roomsWithRoom).toHaveLength(2);
      expect(roomsWithRoom.map(r => r.name)).toContain('Cardio Room');
      expect(roomsWithRoom.map(r => r.name)).toContain('Weight Room');
    });

    test('should count rooms by status', async () => {
      const availableCount = await gymRoomModel.countDocuments({ status: 'available' });
      const unavailableCount = await gymRoomModel.countDocuments({ status: 'unavailable' });
      
      expect(availableCount).toBe(3);
      expect(unavailableCount).toBe(2);
    });

    test('should sort rooms by capacity', async () => {
      const sortedRooms = await gymRoomModel
        .find({})
        .sort({ capacity: -1 }); // descending
      
      expect(sortedRooms[0].name).toBe('Pool Area');
      expect(sortedRooms[0].capacity).toBe(50);
      expect(sortedRooms[sortedRooms.length - 1].capacity).toBe(15);
    });

    test('should find available rooms with minimum capacity', async () => {
      const availableRoomsMinCapacity = await gymRoomModel.find({
        status: 'available',
        capacity: { $gte: 25 }
      });
      
      expect(availableRoomsMinCapacity).toHaveLength(2);
      expect(availableRoomsMinCapacity.map(r => r.name)).toContain('Cardio Room');
      expect(availableRoomsMinCapacity.map(r => r.name)).toContain('Weight Room');
    });
  });

  describe('Timestamps', () => {
    test('should automatically set createdAt and updatedAt on create', async () => {
      const room = await gymRoomModel.create({
        name: 'Timestamped Room'
      });

      expect(room.createdAt).toBeDefined();
      expect(room.updatedAt).toBeDefined();
      expect(room.createdAt instanceof Date).toBe(true);
      expect(room.updatedAt instanceof Date).toBe(true);
    });

    test('should update updatedAt on document modification', async () => {
      const room = await gymRoomModel.create({
        name: 'Room to Update'
      });
      
      const originalUpdatedAt = room.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      room.status = 'unavailable';
      await room.save();
      
      expect(room.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Edge Cases and Validation', () => {
    test('should handle long room names', async () => {
      const longName = 'A'.repeat(200);
      const room = new gymRoomModel({
        name: longName
      });

      const savedRoom = await room.save();
      expect(savedRoom.name).toBe(longName);
    });

    test('should handle long descriptions', async () => {
      const longDescription = 'B'.repeat(1000);
      const room = new gymRoomModel({
        name: 'Room with long description',
        description: longDescription
      });

      const savedRoom = await room.save();
      expect(savedRoom.description).toBe(longDescription);
    });

    test('should handle special characters in name', async () => {
      const specialName = 'Room #1 - A&B (Main Floor)';
      const room = new gymRoomModel({
        name: specialName
      });

      const savedRoom = await room.save();
      expect(savedRoom.name).toBe(specialName);
    });

    test('should handle unicode characters in location', async () => {
      const unicodeLocation = 'Tầng 1 - Khu vực chính';
      const room = new gymRoomModel({
        name: 'Unicode Location Room',
        location: unicodeLocation
      });

      const savedRoom = await room.save();
      expect(savedRoom.location).toBe(unicodeLocation);
    });
  });

  describe('Bulk Operations', () => {
    test('should handle bulk insert', async () => {
      const roomList = [
        { name: 'Room 1', capacity: 10, status: 'available' },
        { name: 'Room 2', capacity: 20, status: 'unavailable' },
        { name: 'Room 3', capacity: 30, status: 'available' }
      ];

      const insertedRooms = await gymRoomModel.insertMany(roomList);
      expect(insertedRooms).toHaveLength(3);
      
      const allRooms = await gymRoomModel.find({});
      expect(allRooms).toHaveLength(3);
    });

    test('should handle bulk update', async () => {
      await gymRoomModel.insertMany([
        { name: 'Room A', status: 'available' },
        { name: 'Room B', status: 'available' },
        { name: 'Room C', status: 'unavailable' }
      ]);

      const result = await gymRoomModel.updateMany(
        { status: 'available' },
        { description: 'Updated available room' }
      );

      expect(result.modifiedCount).toBe(2);
      
      const updatedRooms = await gymRoomModel.find({ 
        description: 'Updated available room' 
      });
      expect(updatedRooms).toHaveLength(2);
    });

    test('should handle bulk delete', async () => {
      await gymRoomModel.insertMany([
        { name: 'Room 1', status: 'unavailable' },
        { name: 'Room 2', status: 'unavailable' },
        { name: 'Room 3', status: 'available' }
      ]);

      const result = await gymRoomModel.deleteMany({ status: 'unavailable' });
      expect(result.deletedCount).toBe(2);
      
      const remainingRooms = await gymRoomModel.find({});
      expect(remainingRooms).toHaveLength(1);
      expect(remainingRooms[0].status).toBe('available');
    });

    test('should fail bulk insert with duplicate names', async () => {
      const roomList = [
        { name: 'Duplicate Room', capacity: 10 },
        { name: 'Duplicate Room', capacity: 20 }
      ];

      await expect(gymRoomModel.insertMany(roomList)).rejects.toThrow();
    });
  });
});
