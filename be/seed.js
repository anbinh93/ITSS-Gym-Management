import { connectDatabase, disconnectDatabase } from "./utils/seedUtils.js";
import { DatabaseSeeder } from "./services/DatabaseSeeder.js";

async function seed() {
  console.log('🚀 Starting database seeding...');
  
  // Connect to database
  const connected = await connectDatabase();
  if (!connected) {
    process.exit(1);
  }

  try {
    const seeder = new DatabaseSeeder();
    
    // Clear existing data
    await seeder.clearAllData();
    
    // Seed all data
    const users = await seeder.seedUsers();
    const packages = await seeder.seedPackages();
    await seeder.seedEquipment();
    await seeder.seedMemberships(users, packages);
    await seeder.seedWorkouts(users);
    
    console.log('✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

seed(); 