const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function quickTest() {
  console.log('🔍 Quick Login Test');
  
  try {
    const response = await fetch('http://localhost:3000/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrUsername: 'user@gym.com',
        password: 'user123456'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login thành công!');
      console.log(`User: ${data.user.name} (${data.user.email})`);
      
      // Test workout API
      const workoutResponse = await fetch(`http://localhost:3000/api/workout/user/${data.user._id}`, {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      const workoutData = await workoutResponse.json();
      if (workoutData.success) {
        console.log(`✅ Workout API: ${workoutData.workouts.length} workouts found`);
        const totalMinutes = workoutData.workouts.reduce((sum, w) => sum + w.durationMinutes, 0);
        console.log(`📊 Total workout time: ${totalMinutes} minutes`);
      }
      
    } else {
      console.log('❌ Login thất bại:', data.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

quickTest();
