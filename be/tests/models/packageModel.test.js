const mongoose = require('mongoose');
const { packageModel } = require('../../models/packageModel.js');

describe('Package Model Test Suite', () => {
  
  describe('Package Schema Validation', () => {
    test('should create a valid package with all fields', async () => {
      const validPackage = {
        name: 'Premium Package',
        durationInDays: 30,
        sessionLimit: 20,
        price: 500000,
        withTrainer: true
      };

      const packageDoc = new packageModel(validPackage);
      const savedPackage = await packageDoc.save();

      expect(savedPackage._id).toBeDefined();
      expect(savedPackage.name).toBe(validPackage.name);
      expect(savedPackage.durationInDays).toBe(validPackage.durationInDays);
      expect(savedPackage.sessionLimit).toBe(validPackage.sessionLimit);
      expect(savedPackage.price).toBe(validPackage.price);
      expect(savedPackage.withTrainer).toBe(true);
    });

    test('should create package with default withTrainer value', async () => {
      const packageData = {
        name: 'Basic Package',
        durationInDays: 15,
        sessionLimit: 10,
        price: 250000
      };

      const package = new packageModel(packageData);
      const savedPackage = await package.save();

      expect(savedPackage.withTrainer).toBe(false); // Default value
    });

    test('should allow package creation with minimal fields', async () => {
      const packageData = {
        name: 'Minimal Package'
      };

      const package = new packageModel(packageData);
      const savedPackage = await package.save();

      expect(savedPackage._id).toBeDefined();
      expect(savedPackage.name).toBe('Minimal Package');
      expect(savedPackage.withTrainer).toBe(false); // Default value
    });
  });

  describe('Package Data Types', () => {
    test('should handle numeric fields correctly', async () => {
      const packageData = {
        name: 'Numeric Test Package',
        durationInDays: 45,
        sessionLimit: 25,
        price: 750000.50
      };

      const package = new packageModel(packageData);
      const savedPackage = await package.save();

      expect(typeof savedPackage.durationInDays).toBe('number');
      expect(typeof savedPackage.sessionLimit).toBe('number');
      expect(typeof savedPackage.price).toBe('number');
      expect(savedPackage.durationInDays).toBe(45);
      expect(savedPackage.sessionLimit).toBe(25);
      expect(savedPackage.price).toBe(750000.50);
    });

    test('should handle boolean field correctly', async () => {
      const packageData1 = {
        name: 'Boolean Test Package 1',
        withTrainer: true
      };

      const packageData2 = {
        name: 'Boolean Test Package 2',
        withTrainer: false
      };

      const package1 = new packageModel(packageData1);
      const package2 = new packageModel(packageData2);
      
      const savedPackage1 = await package1.save();
      const savedPackage2 = await package2.save();

      expect(typeof savedPackage1.withTrainer).toBe('boolean');
      expect(typeof savedPackage2.withTrainer).toBe('boolean');
      expect(savedPackage1.withTrainer).toBe(true);
      expect(savedPackage2.withTrainer).toBe(false);
    });
  });

  describe('Package CRUD Operations', () => {
    test('should create multiple packages', async () => {
      const packages = [
        { name: 'Basic Package', durationInDays: 15, sessionLimit: 8, price: 200000 },
        { name: 'Standard Package', durationInDays: 30, sessionLimit: 15, price: 400000 },
        { name: 'Premium Package', durationInDays: 60, sessionLimit: 30, price: 750000, withTrainer: true }
      ];

      const savedPackages = [];
      for (const packageData of packages) {
        const package = new packageModel(packageData);
        const savedPackage = await package.save();
        savedPackages.push(savedPackage);
      }

      expect(savedPackages.length).toBe(3);
      expect(savedPackages[0].name).toBe('Basic Package');
      expect(savedPackages[1].name).toBe('Standard Package');
      expect(savedPackages[2].name).toBe('Premium Package');
      expect(savedPackages[2].withTrainer).toBe(true);
    });

    test('should find package by name', async () => {
      const packageData = {
        name: 'Find Test Package',
        durationInDays: 20,
        sessionLimit: 12,
        price: 350000
      };

      const package = new packageModel(packageData);
      await package.save();

      const foundPackage = await packageModel.findOne({ name: 'Find Test Package' });
      expect(foundPackage).toBeTruthy();
      expect(foundPackage.name).toBe('Find Test Package');
      expect(foundPackage.durationInDays).toBe(20);
    });

    test('should update package information', async () => {
      const packageData = {
        name: 'Update Test Package',
        durationInDays: 30,
        sessionLimit: 15,
        price: 400000
      };

      const package = new packageModel(packageData);
      const savedPackage = await package.save();

      savedPackage.name = 'Updated Package Name';
      savedPackage.price = 450000;
      savedPackage.withTrainer = true;
      
      const updatedPackage = await savedPackage.save();

      expect(updatedPackage.name).toBe('Updated Package Name');
      expect(updatedPackage.price).toBe(450000);
      expect(updatedPackage.withTrainer).toBe(true);
    });

    test('should delete package', async () => {
      const packageData = {
        name: 'Delete Test Package',
        durationInDays: 10,
        sessionLimit: 5,
        price: 150000
      };

      const package = new packageModel(packageData);
      const savedPackage = await package.save();
      const packageId = savedPackage._id;

      await packageModel.findByIdAndDelete(packageId);
      
      const deletedPackage = await packageModel.findById(packageId);
      expect(deletedPackage).toBeNull();
    });

    test('should get all packages', async () => {
      // Create test packages
      const packagesData = [
        { name: 'Package A', price: 100000 },
        { name: 'Package B', price: 200000 },
        { name: 'Package C', price: 300000 }
      ];

      for (const data of packagesData) {
        const package = new packageModel(data);
        await package.save();
      }

      const allPackages = await packageModel.find();
      expect(allPackages.length).toBe(3);
    });
  });

  describe('Package Queries and Filtering', () => {
    beforeEach(async () => {
      // Setup test data
      const packagesData = [
        { name: 'Cheap Package', durationInDays: 15, sessionLimit: 8, price: 200000, withTrainer: false },
        { name: 'Mid Package', durationInDays: 30, sessionLimit: 15, price: 400000, withTrainer: false },
        { name: 'Expensive Package', durationInDays: 60, sessionLimit: 30, price: 800000, withTrainer: true },
        { name: 'Premium Package', durationInDays: 90, sessionLimit: 50, price: 1200000, withTrainer: true }
      ];

      for (const data of packagesData) {
        const package = new packageModel(data);
        await package.save();
      }
    });

    test('should filter packages by price range', async () => {
      const affordablePackages = await packageModel.find({ 
        price: { $lte: 500000 } 
      });
      
      expect(affordablePackages.length).toBe(2);
      affordablePackages.forEach(package => {
        expect(package.price).toBeLessThanOrEqual(500000);
      });
    });

    test('should filter packages with trainer', async () => {
      const trainerPackages = await packageModel.find({ 
        withTrainer: true 
      });
      
      expect(trainerPackages.length).toBe(2);
      trainerPackages.forEach(package => {
        expect(package.withTrainer).toBe(true);
      });
    });

    test('should filter packages by duration', async () => {
      const longTermPackages = await packageModel.find({ 
        durationInDays: { $gte: 60 } 
      });
      
      expect(longTermPackages.length).toBe(2);
      longTermPackages.forEach(package => {
        expect(package.durationInDays).toBeGreaterThanOrEqual(60);
      });
    });

    test('should sort packages by price', async () => {
      const packagesByPrice = await packageModel.find().sort({ price: 1 });
      
      expect(packagesByPrice.length).toBe(4);
      expect(packagesByPrice[0].price).toBeLessThanOrEqual(packagesByPrice[1].price);
      expect(packagesByPrice[1].price).toBeLessThanOrEqual(packagesByPrice[2].price);
      expect(packagesByPrice[2].price).toBeLessThanOrEqual(packagesByPrice[3].price);
    });
  });

  describe('Package Timestamps', () => {
    test('should automatically add createdAt and updatedAt timestamps', async () => {
      const packageData = {
        name: 'Timestamp Test Package',
        price: 300000
      };

      const package = new packageModel(packageData);
      const savedPackage = await package.save();

      expect(savedPackage.createdAt).toBeDefined();
      expect(savedPackage.updatedAt).toBeDefined();
      expect(savedPackage.createdAt).toBeInstanceOf(Date);
      expect(savedPackage.updatedAt).toBeInstanceOf(Date);
    });

    test('should update updatedAt when package is modified', async () => {
      const packageData = {
        name: 'Update Timestamp Package',
        price: 300000
      };

      const package = new packageModel(packageData);
      const savedPackage = await package.save();
      const originalUpdatedAt = savedPackage.updatedAt;

      // Wait a moment to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedPackage.price = 350000;
      const updatedPackage = await savedPackage.save();

      expect(updatedPackage.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
