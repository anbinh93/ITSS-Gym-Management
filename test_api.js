const axios = require('axios');

// Test function to check workout stats API
async function testWorkoutStatsAPI() {
  try {
    // First, let's test with a mock user login to get a token
    const loginRes = await axios.post('http://localhost:3000/api/user/login', {
      email: 'member1@gmail.com', // Using a real user from seed data
      password: 'Member@123'
    });
    
    console.log('Login response:', loginRes.data);
    
    if (loginRes.data.success) {
      const token = loginRes.data.token;
      const userId = loginRes.data.user._id;
      
      // Test the workout stats API
      const statsRes = await axios.get(`http://localhost:3000/api/workout-sessions/user/${userId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Workout stats response:', statsRes.data);
    }
  } catch (error) {
    console.error('Error testing API:', error.response ? error.response.data : error.message);
  }
}

testWorkoutStatsAPI();
