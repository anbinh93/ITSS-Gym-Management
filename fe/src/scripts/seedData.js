import { seedAccounts } from '../data/seedAccounts';
import { register } from '../services/api';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

async function createMembership(userData, membershipSeedData, token) {
    try {
        // The backend should derive the price from the packageId
        const payload = {
            userId: userData._id,
            packageId: membershipSeedData.packageId,
            paymentMethod: membershipSeedData.paymentMethod || 'CASH',
            // DO NOT SEND PRICE - backend should get it from packageId
        };
        console.log('Creating membership with payload:', payload);

        const response = await fetch(`${API_BASE}/api/memberships/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to create membership. Status:', response.status, 'Response:', errorText);
            throw new Error(`Failed to create membership: ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Create membership error:', error);
        throw error;
    }
}

async function seedUsers() {
    console.log('Starting to seed users...');
    
    try {
        // Seed admin account
        console.log('Seeding admin account...');
        await register(
            seedAccounts.admin.name,
            seedAccounts.admin.email,
            seedAccounts.admin.password,
            seedAccounts.admin.phone,
            seedAccounts.admin.birthYear,
            seedAccounts.admin.role,
            seedAccounts.admin.gender,
            seedAccounts.admin.username
        );
        console.log('Admin account created successfully');

        // Seed staff accounts
        console.log('Seeding staff accounts...');
        for (const staff of seedAccounts.staff) {
            await register(
                staff.name,
                staff.email,
                staff.password,
                staff.phone,
                staff.birthYear,
                staff.role,
                staff.gender,
                staff.username
            );
            console.log(`Staff account ${staff.username} created successfully`);
        }

        // Seed member accounts with membership data
        console.log('Seeding member accounts...');
        for (const member of seedAccounts.members) {
            try {
                const registrationResponse = await register(
                    member.name,
                    member.email,
                    member.password,
                    member.phone,
                    member.birthYear,
                    member.role,
                    member.gender,
                    member.username
                );

                console.log(`Member account ${member.username} created successfully`);

                if (registrationResponse.success && member.membership && registrationResponse.token) {
                    console.log(`Creating membership for ${member.username}...`);
                    // Ensure response.user has _id, adjust if structure is different
                    const userForMembership = registrationResponse.user || registrationResponse.data?.user;
                    if (!userForMembership || !userForMembership._id) {
                        console.error(`User ID not found for ${member.username} after registration.`);
                        continue; 
                    }
                    await createMembership(userForMembership, member.membership, registrationResponse.token);
                    console.log(`Membership created for ${member.username}`);
                } else {
                    if (!registrationResponse.success) {
                        console.error(`Registration failed for ${member.username}:`, registrationResponse.message);
                    }
                    if (!member.membership) {
                        console.warn(`No membership data to seed for ${member.username}`);
                    }
                    if (!registrationResponse.token) {
                        console.error(`No token received after registering ${member.username}`);
                    }
                }
            } catch (error) {
                console.error(`Error processing member ${member.username}:`, error.message);
            }
        }

        console.log('All accounts seeded successfully (or with logged errors)!');
    } catch (error) {
        console.error('Error seeding accounts:', error);
    }
}

// Execute seeding
seedUsers(); 