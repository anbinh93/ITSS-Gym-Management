import mongoose from 'mongoose';
import { equipmentModel } from '../../models/equipmentModel.js';

describe('Equipment Model Tests', () => {
  beforeEach(async () => {
    await equipmentModel.deleteMany({});
  });

  afterAll(async () => {
    await equipmentModel.deleteMany({});
  });

  describe('Schema Validation', () => {
    test('should create equipment with valid data', async () => {
      const equipmentData = {
        name: 'Treadmill',
        quantity: 5,
        condition: 'Good',
        purchaseDate: new Date('2024-01-15'),
        warrantyExpiry: new Date('2026-01-15'),
        notes: 'High-end commercial treadmill'
      };

      const equipment = new equipmentModel(equipmentData);
      const savedEquipment = await equipment.save();

      expect(savedEquipment.name).toBe(equipmentData.name);
      expect(savedEquipment.quantity).toBe(equipmentData.quantity);
      expect(savedEquipment.condition).toBe(equipmentData.condition);
      expect(savedEquipment.notes).toBe(equipmentData.notes);
      expect(savedEquipment.purchaseDate).toEqual(equipmentData.purchaseDate);
      expect(savedEquipment.warrantyExpiry).toEqual(equipmentData.warrantyExpiry);
      expect(savedEquipment._id).toBeDefined();
      expect(savedEquipment.createdAt).toBeDefined();
      expect(savedEquipment.updatedAt).toBeDefined();
    });

    test('should create equipment with minimal required data', async () => {
      const equipment = new equipmentModel({
        name: 'Dumbbells'
      });

      const savedEquipment = await equipment.save();
      expect(savedEquipment.name).toBe('Dumbbells');
      expect(savedEquipment.condition).toBe('Good'); // default value
    });

    test('should accept empty equipment object', async () => {
      const equipment = new equipmentModel({});
      const savedEquipment = await equipment.save();
      
      expect(savedEquipment.condition).toBe('Good'); // default value
      expect(savedEquipment._id).toBeDefined();
    });
  });

  describe('Condition Field Validation', () => {
    test('should accept valid condition values', async () => {
      const validConditions = ['Good', 'Needs Maintenance', 'Broken'];
      
      for (const condition of validConditions) {
        const equipment = new equipmentModel({
          name: `Equipment ${condition}`,
          condition: condition
        });
        
        const savedEquipment = await equipment.save();
        expect(savedEquipment.condition).toBe(condition);
      }
    });

    test('should use default condition when not specified', async () => {
      const equipment = new equipmentModel({
        name: 'Test Equipment'
      });
      
      const savedEquipment = await equipment.save();
      expect(savedEquipment.condition).toBe('Good');
    });

    test('should reject invalid condition values', async () => {
      const equipment = new equipmentModel({
        name: 'Test Equipment',
        condition: 'Invalid Condition'
      });

      await expect(equipment.save()).rejects.toThrow();
    });
  });

  describe('Data Types Validation', () => {
    test('should handle string fields correctly', async () => {
      const equipment = new equipmentModel({
        name: 'Barbell Set',
        notes: 'Olympic weight set with various plates'
      });

      const savedEquipment = await equipment.save();
      expect(typeof savedEquipment.name).toBe('string');
      expect(typeof savedEquipment.notes).toBe('string');
    });

    test('should handle number fields correctly', async () => {
      const equipment = new equipmentModel({
        name: 'Resistance Bands',
        quantity: 20
      });

      const savedEquipment = await equipment.save();
      expect(typeof savedEquipment.quantity).toBe('number');
      expect(savedEquipment.quantity).toBe(20);
    });

    test('should handle date fields correctly', async () => {
      const purchaseDate = new Date('2024-03-15');
      const warrantyExpiry = new Date('2026-03-15');
      
      const equipment = new equipmentModel({
        name: 'Exercise Bike',
        purchaseDate: purchaseDate,
        warrantyExpiry: warrantyExpiry
      });

      const savedEquipment = await equipment.save();
      expect(savedEquipment.purchaseDate).toEqual(purchaseDate);
      expect(savedEquipment.warrantyExpiry).toEqual(warrantyExpiry);
      expect(savedEquipment.purchaseDate instanceof Date).toBe(true);
      expect(savedEquipment.warrantyExpiry instanceof Date).toBe(true);
    });

    test('should handle zero quantity', async () => {
      const equipment = new equipmentModel({
        name: 'Out of Stock Equipment',
        quantity: 0
      });

      const savedEquipment = await equipment.save();
      expect(savedEquipment.quantity).toBe(0);
    });

    test('should handle negative quantity', async () => {
      const equipment = new equipmentModel({
        name: 'Equipment',
        quantity: -1
      });

      const savedEquipment = await equipment.save();
      expect(savedEquipment.quantity).toBe(-1);
    });
  });

  describe('CRUD Operations', () => {
    test('should create equipment successfully', async () => {
      const equipmentData = {
        name: 'Lat Pulldown Machine',
        quantity: 2,
        condition: 'Good',
        purchaseDate: new Date('2024-02-01')
      };

      const equipment = await equipmentModel.create(equipmentData);
      expect(equipment.name).toBe(equipmentData.name);
      expect(equipment.quantity).toBe(equipmentData.quantity);
      expect(equipment._id).toBeDefined();
    });

    test('should read equipment by ID', async () => {
      const equipment = await equipmentModel.create({
        name: 'Cable Machine',
        quantity: 1,
        condition: 'Good'
      });

      const foundEquipment = await equipmentModel.findById(equipment._id);
      expect(foundEquipment).toBeTruthy();
      expect(foundEquipment.name).toBe('Cable Machine');
      expect(foundEquipment.quantity).toBe(1);
    });

    test('should update equipment', async () => {
      const equipment = await equipmentModel.create({
        name: 'Smith Machine',
        quantity: 1,
        condition: 'Good'
      });

      const updatedEquipment = await equipmentModel.findByIdAndUpdate(
        equipment._id,
        { 
          condition: 'Needs Maintenance',
          notes: 'Requires cable replacement'
        },
        { new: true }
      );

      expect(updatedEquipment.condition).toBe('Needs Maintenance');
      expect(updatedEquipment.notes).toBe('Requires cable replacement');
      expect(updatedEquipment.name).toBe('Smith Machine'); // unchanged
    });

    test('should delete equipment', async () => {
      const equipment = await equipmentModel.create({
        name: 'Old Treadmill',
        condition: 'Broken'
      });

      await equipmentModel.findByIdAndDelete(equipment._id);
      const deletedEquipment = await equipmentModel.findById(equipment._id);
      expect(deletedEquipment).toBeNull();
    });
  });

  describe('Queries and Filtering', () => {
    beforeEach(async () => {
      await equipmentModel.insertMany([
        { name: 'Treadmill A', quantity: 3, condition: 'Good' },
        { name: 'Treadmill B', quantity: 2, condition: 'Needs Maintenance' },
        { name: 'Exercise Bike', quantity: 5, condition: 'Good' },
        { name: 'Broken Bike', quantity: 1, condition: 'Broken' },
        { name: 'Dumbbells', quantity: 20, condition: 'Good' }
      ]);
    });

    test('should find equipment by condition', async () => {
      const goodEquipment = await equipmentModel.find({ condition: 'Good' });
      const brokenEquipment = await equipmentModel.find({ condition: 'Broken' });
      
      expect(goodEquipment).toHaveLength(3);
      expect(brokenEquipment).toHaveLength(1);
      expect(brokenEquipment[0].name).toBe('Broken Bike');
    });

    test('should find equipment by name pattern', async () => {
      const treadmills = await equipmentModel.find({ 
        name: { $regex: 'Treadmill', $options: 'i' } 
      });
      
      expect(treadmills).toHaveLength(2);
      expect(treadmills.map(t => t.name)).toContain('Treadmill A');
      expect(treadmills.map(t => t.name)).toContain('Treadmill B');
    });

    test('should find equipment with quantity greater than threshold', async () => {
      const highQuantityEquipment = await equipmentModel.find({ 
        quantity: { $gt: 3 } 
      });
      
      expect(highQuantityEquipment).toHaveLength(2);
      expect(highQuantityEquipment.map(e => e.name)).toContain('Exercise Bike');
      expect(highQuantityEquipment.map(e => e.name)).toContain('Dumbbells');
    });

    test('should count equipment by condition', async () => {
      const goodCount = await equipmentModel.countDocuments({ condition: 'Good' });
      const maintenanceCount = await equipmentModel.countDocuments({ condition: 'Needs Maintenance' });
      const brokenCount = await equipmentModel.countDocuments({ condition: 'Broken' });
      
      expect(goodCount).toBe(3);
      expect(maintenanceCount).toBe(1);
      expect(brokenCount).toBe(1);
    });

    test('should sort equipment by quantity', async () => {
      const sortedEquipment = await equipmentModel
        .find({})
        .sort({ quantity: -1 }); // descending
      
      expect(sortedEquipment[0].name).toBe('Dumbbells');
      expect(sortedEquipment[0].quantity).toBe(20);
      expect(sortedEquipment[sortedEquipment.length - 1].quantity).toBe(1);
    });
  });

  describe('Timestamps', () => {
    test('should automatically set createdAt and updatedAt on create', async () => {
      const equipment = await equipmentModel.create({
        name: 'Timestamped Equipment'
      });

      expect(equipment.createdAt).toBeDefined();
      expect(equipment.updatedAt).toBeDefined();
      expect(equipment.createdAt instanceof Date).toBe(true);
      expect(equipment.updatedAt instanceof Date).toBe(true);
    });

    test('should update updatedAt on document modification', async () => {
      const equipment = await equipmentModel.create({
        name: 'Equipment to Update'
      });
      
      const originalUpdatedAt = equipment.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      equipment.condition = 'Needs Maintenance';
      await equipment.save();
      
      expect(equipment.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Edge Cases and Validation', () => {
    test('should handle long equipment names', async () => {
      const longName = 'A'.repeat(200);
      const equipment = new equipmentModel({
        name: longName
      });

      const savedEquipment = await equipment.save();
      expect(savedEquipment.name).toBe(longName);
    });

    test('should handle long notes', async () => {
      const longNotes = 'B'.repeat(1000);
      const equipment = new equipmentModel({
        name: 'Equipment with long notes',
        notes: longNotes
      });

      const savedEquipment = await equipment.save();
      expect(savedEquipment.notes).toBe(longNotes);
    });

    test('should handle future warranty expiry dates', async () => {
      const futureDate = new Date('2030-12-31');
      const equipment = new equipmentModel({
        name: 'Future Warranty Equipment',
        warrantyExpiry: futureDate
      });

      const savedEquipment = await equipment.save();
      expect(savedEquipment.warrantyExpiry).toEqual(futureDate);
    });

    test('should handle past purchase dates', async () => {
      const pastDate = new Date('2020-01-01');
      const equipment = new equipmentModel({
        name: 'Old Equipment',
        purchaseDate: pastDate
      });

      const savedEquipment = await equipment.save();
      expect(savedEquipment.purchaseDate).toEqual(pastDate);
    });
  });

  describe('Bulk Operations', () => {
    test('should handle bulk insert', async () => {
      const equipmentList = [
        { name: 'Equipment 1', quantity: 1, condition: 'Good' },
        { name: 'Equipment 2', quantity: 2, condition: 'Needs Maintenance' },
        { name: 'Equipment 3', quantity: 3, condition: 'Broken' }
      ];

      const insertedEquipment = await equipmentModel.insertMany(equipmentList);
      expect(insertedEquipment).toHaveLength(3);
      
      const allEquipment = await equipmentModel.find({});
      expect(allEquipment).toHaveLength(3);
    });

    test('should handle bulk update', async () => {
      await equipmentModel.insertMany([
        { name: 'Equipment A', condition: 'Good' },
        { name: 'Equipment B', condition: 'Good' },
        { name: 'Equipment C', condition: 'Broken' }
      ]);

      const result = await equipmentModel.updateMany(
        { condition: 'Good' },
        { notes: 'Equipment in good condition' }
      );

      expect(result.modifiedCount).toBe(2);
      
      const updatedEquipment = await equipmentModel.find({ 
        notes: 'Equipment in good condition' 
      });
      expect(updatedEquipment).toHaveLength(2);
    });

    test('should handle bulk delete', async () => {
      await equipmentModel.insertMany([
        { name: 'Equipment 1', condition: 'Broken' },
        { name: 'Equipment 2', condition: 'Broken' },
        { name: 'Equipment 3', condition: 'Good' }
      ]);

      const result = await equipmentModel.deleteMany({ condition: 'Broken' });
      expect(result.deletedCount).toBe(2);
      
      const remainingEquipment = await equipmentModel.find({});
      expect(remainingEquipment).toHaveLength(1);
      expect(remainingEquipment[0].condition).toBe('Good');
    });
  });
});
