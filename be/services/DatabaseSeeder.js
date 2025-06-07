import { userModel } from "../models/userModel.js";
import { workoutModel } from "../models/workoutModel.js";
import { packageModel } from "../models/packageModel.js";
import { membershipModel } from "../models/membershipModel.js";
import { workoutSessionModel } from "../models/workoutSessionModel.js";
import { equipmentModel } from "../models/equipmentModel.js";
import { DEMO_USERS, MEMBER_USERS, SAMPLE_WORKOUTS, EQUIPMENT_DATA, PACKAGE_DATA } from "../config/seedData.js";
import { hashPassword, clearCollection, createRandomDate } from "../utils/seedUtils.js";

export class DatabaseSeeder {
  constructor() {
    this.models = {
      user: userModel,
      workout: workoutModel,
      package: packageModel,
      membership: membershipModel,
      workoutSession: workoutSessionModel,
      equipment: equipmentModel
    };
  }

  async clearAllData() {
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      clearCollection(this.models.user, 'users'),
      clearCollection(this.models.workout, 'workouts'),
      clearCollection(this.models.package, 'packages'),
      clearCollection(this.models.membership, 'memberships'),
      clearCollection(this.models.workoutSession, 'workout sessions'),
      clearCollection(this.models.equipment, 'equipment')
    ]);
  }

  async seedUsers() {
    console.log('👥 Seeding demo users...');
    const usersToCreate = await Promise.all(
      DEMO_USERS.map(async (user) => ({
        ...user,
        password: await hashPassword(user.password)
      }))
    );

    const createdUsers = await this.models.user.create(usersToCreate);
    console.log(`✅ Created ${createdUsers.length} demo users`);
    return createdUsers;
  }

  async seedMembers() {
    console.log('👥 Seeding member users...');
    const membersToCreate = await Promise.all(
      MEMBER_USERS.map(async (member) => ({
        ...member,
        password: await hashPassword(member.password)
      }))
    );

    const createdMembers = await this.models.user.create(membersToCreate);
    console.log(`✅ Created ${createdMembers.length} member users`);
    return createdMembers;
  }

  async seedPackages() {
    console.log('📦 Seeding packages...');
    const createdPackages = await this.models.package.create(PACKAGE_DATA);
    console.log(`✅ Created ${createdPackages.length} packages`);
    return createdPackages;
  }

  async seedEquipment() {
    console.log('🏋️ Seeding equipment...');
    const createdEquipment = await this.models.equipment.create(EQUIPMENT_DATA);
    console.log(`✅ Created ${createdEquipment.length} equipment items`);
    return createdEquipment;
  }

  async seedMemberships(users, packages) {
    console.log('🎫 Seeding memberships...');
    
    // Find user and coach for membership
    const user = users.find(u => u.role === 'user');
    const coach = users.find(u => u.role === 'coach');
    const standardPackage = packages.find(p => p.name === 'Standard Package');
    
    if (user && coach && standardPackage) {
      await this.models.membership.create({
        user: user._id,
        coach: coach._id,
        package: standardPackage._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30*24*60*60*1000),
        sessionsRemaining: 20,
        isActive: true,
        paymentStatus: 'paid',
        status: 'active'
      });
      console.log('✅ Created membership for user');
    }
  }

  async seedWorkouts(users) {
    console.log('💪 Seeding workouts...');
    let totalWorkouts = 0;

    for (const userData of SAMPLE_WORKOUTS) {
      const user = users.find(u => u.email === userData.userEmail);
      if (!user) {
        console.log(`⚠️ User ${userData.userEmail} not found, skipping workouts`);
        continue;
      }

      const workoutsToCreate = userData.workouts.map(workout => ({
        user: user._id,
        date: createRandomDate(workout.daysAgo),
        durationMinutes: workout.durationMinutes,
        notes: workout.notes
      }));

      await this.models.workout.create(workoutsToCreate);
      totalWorkouts += workoutsToCreate.length;
      console.log(`✅ Created ${workoutsToCreate.length} workouts for ${user.name}`);
    }

    console.log(`✅ Total workouts created: ${totalWorkouts}`);
  }
}
