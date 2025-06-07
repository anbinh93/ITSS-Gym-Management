// Test script to diagnose login issues
import fetch from 'node-fetch';
const API_BASE = 'http://localhost:3000';

console.log('=== Starting Login Diagnostics ===');

// Test 1: Basic API connectivity
async function testAPIConnectivity() {
    console.log('\n1. Testing API connectivity...');
    try {
        const response = await fetch(`${API_BASE}/`);
        const text = await response.text();
        console.log('✅ API Server accessible:', text);
        return true;
    } catch (error) {
        console.error('❌ API Server not accessible:', error.message);
        return false;
    }
}

// Test 2: Login API test
async function testLoginAPI() {
    console.log('\n2. Testing Login API...');
    const credentials = {
        emailOrUsername: 'user@gym.com',
        password: 'user123'
    };
    
    try {
        console.log('Sending request to:', `${API_BASE}/api/user/login`);
        console.log('With credentials:', credentials);
        
        const response = await fetch(`${API_BASE}/api/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            console.log('✅ Login API working correctly');
            return { success: true, data };
        } else {
            console.log('❌ Login failed:', data.message);
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('❌ Login API error:', error);
        return { success: false, error: error.message };
    }
}

// Test 3: Workout API test
async function testWorkoutAPI(userId, token) {
    console.log('\n3. Testing Workout API...');
    try {
        const response = await fetch(`${API_BASE}/api/workout/user/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Workout API response:', data);
        
        if (data.success) {
            console.log('✅ Workout API working correctly');
            console.log(`Found ${data.workouts.length} workouts`);
            return { success: true, workouts: data.workouts };
        } else {
            console.log('❌ Workout API failed:', data.message);
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('❌ Workout API error:', error);
        return { success: false, error: error.message };
    }
}

// Test 4: Frontend authService test
async function testAuthService() {
    console.log('\n4. Testing Frontend AuthService...');
    try {
        // Import the authService (this would work in a real frontend environment)
        // For now, we'll simulate the login process
        
        const credentials = {
            emailOrUsername: 'user@gym.com',
            password: 'user123'
        };
        
        // Simulate the authService.login process
        console.log('Simulating authService.login...');
        
        // Step 1: Call API login
        const loginResult = await testLoginAPI();
        if (!loginResult.success) {
            throw new Error(loginResult.error);
        }
        
        // Step 2: Store in localStorage (simulate)
        console.log('Would store in localStorage:');
        console.log('Token:', loginResult.data.token);
        console.log('User:', JSON.stringify(loginResult.data.user, null, 2));
        
        // Step 3: Test workout API
        const workoutResult = await testWorkoutAPI(loginResult.data.user._id, loginResult.data.token);
        
        if (workoutResult.success) {
            console.log('✅ Complete login flow working correctly');
            return { success: true, workouts: workoutResult.workouts };
        } else {
            console.log('❌ Workout API failed in complete flow');
            return { success: false, error: workoutResult.error };
        }
        
    } catch (error) {
        console.error('❌ AuthService simulation failed:', error);
        return { success: false, error: error.message };
    }
}

// Run all tests
async function runAllTests() {
    console.log('Starting comprehensive login diagnostics...');
    
    const connectivity = await testAPIConnectivity();
    if (!connectivity) {
        console.log('❌ Cannot proceed - API server not accessible');
        return;
    }
    
    const loginTest = await testLoginAPI();
    if (!loginTest.success) {
        console.log('❌ Cannot proceed - Login API not working');
        return;
    }
    
    const workoutTest = await testWorkoutAPI(loginTest.data.user._id, loginTest.data.token);
    if (!workoutTest.success) {
        console.log('❌ Workout API not working');
        return;
    }
    
    const authServiceTest = await testAuthService();
    if (authServiceTest.success) {
        console.log('\n🎉 All tests passed! Login and workout statistics should work.');
        console.log(`Found ${authServiceTest.workouts.length} workout records for statistics calculation.`);
        
        // Calculate some basic statistics
        const workouts = authServiceTest.workouts;
        const totalWorkouts = workouts.length;
        const totalMinutes = workouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
        const totalHours = Math.floor(totalMinutes / 60);
        
        console.log('\n📊 Workout Statistics Preview:');
        console.log(`Total Workouts: ${totalWorkouts}`);
        console.log(`Total Minutes: ${totalMinutes}`);
        console.log(`Total Hours: ${totalHours}`);
        
        // Weekly workouts (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyWorkouts = workouts.filter(w => new Date(w.date) >= weekAgo);
        console.log(`Weekly Workouts: ${weeklyWorkouts.length}`);
        
        // Monthly workouts (last 30 days)
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const monthlyWorkouts = workouts.filter(w => new Date(w.date) >= monthAgo);
        console.log(`Monthly Workouts: ${monthlyWorkouts.length}`);
        
    } else {
        console.log('\n❌ Some tests failed. Please check the errors above.');
    }
}

// Run the tests
runAllTests().catch(console.error);
