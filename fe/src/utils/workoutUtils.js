/**
 * Utility functions for workout statistics and date calculations
 */

/**
 * Calculate workout statistics from workout data array
 * @param {Array} workoutData - Array of workout objects
 * @returns {Object} Calculated statistics
 */
export const calculateWorkoutStats = (workoutData = []) => {
  const totalWorkouts = workoutData.length;
  const totalMinutes = workoutData.reduce((total, w) => total + (w.durationMinutes || 0), 0);
  const totalHours = Math.round(totalMinutes / 60) || 0;
  const averageDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

  // Calculate weekly workouts (last 7 days)
  const weeklyWorkouts = workoutData.filter(w => {
    const workoutDate = new Date(w.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo;
  }).length;

  // Calculate monthly workouts (last 30 days)
  const monthlyWorkouts = workoutData.filter(w => {
    const workoutDate = new Date(w.date);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return workoutDate >= monthAgo;
  }).length;

  // Calculate streak (consecutive days with workouts)
  const workoutStreak = calculateWorkoutStreak(workoutData);

  // Calculate weekly goal progress (assuming 4 workouts per week)
  const weeklyGoal = 4;
  const weeklyProgress = Math.min((weeklyWorkouts / weeklyGoal) * 100, 100);

  return {
    totalWorkouts,
    totalMinutes,
    totalHours,
    averageDuration,
    weeklyWorkouts,
    monthlyWorkouts,
    workoutStreak,
    weeklyProgress,
    weeklyGoal
  };
};

/**
 * Calculate workout streak (consecutive days with workouts)
 * @param {Array} workoutData - Array of workout objects
 * @returns {number} Current streak in days
 */
export const calculateWorkoutStreak = (workoutData = []) => {
  if (workoutData.length === 0) return 0;

  // Sort workouts by date (most recent first)
  const sortedWorkouts = workoutData
    .map(w => new Date(w.date))
    .sort((a, b) => b - a);

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedWorkouts.length; i++) {
    const workoutDate = new Date(sortedWorkouts[i]);
    workoutDate.setHours(0, 0, 0, 0);

    const daysDifference = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

    if (daysDifference === streak) {
      streak++;
    } else if (daysDifference > streak) {
      break;
    }
  }

  return streak;
};

/**
 * Get workouts for a specific time period
 * @param {Array} workoutData - Array of workout objects
 * @param {string} period - 'week', 'month', 'year'
 * @returns {Array} Filtered workouts
 */
export const getWorkoutsForPeriod = (workoutData = [], period = 'week') => {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  return workoutData.filter(w => {
    const workoutDate = new Date(w.date);
    return workoutDate >= startDate;
  });
};

/**
 * Format duration in minutes to human readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 
    ? `${hours}h ${remainingMinutes}m`
    : `${hours} giờ`;
};

/**
 * Get workout frequency data for charts
 * @param {Array} workoutData - Array of workout objects
 * @param {number} days - Number of days to include
 * @returns {Array} Chart data
 */
export const getWorkoutFrequencyData = (workoutData = [], days = 7) => {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    const dayWorkouts = workoutData.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate.toDateString() === date.toDateString();
    });

    data.push({
      date: date.toLocaleDateString('vi-VN'),
      workouts: dayWorkouts.length,
      duration: dayWorkouts.reduce((total, w) => total + (w.durationMinutes || 0), 0)
    });
  }

  return data;
};

/**
 * Get workout intensity distribution
 * @param {Array} workoutData - Array of workout objects
 * @returns {Object} Intensity distribution
 */
export const getWorkoutIntensityDistribution = (workoutData = []) => {
  const distribution = {
    light: 0,    // < 30 minutes
    moderate: 0, // 30-60 minutes
    intense: 0   // > 60 minutes
  };

  workoutData.forEach(workout => {
    const duration = workout.durationMinutes || 0;
    if (duration < 30) {
      distribution.light++;
    } else if (duration <= 60) {
      distribution.moderate++;
    } else {
      distribution.intense++;
    }
  });

  return distribution;
};

/**
 * Calculate calories burned estimation (rough estimation)
 * @param {number} durationMinutes - Workout duration in minutes
 * @param {string} intensity - 'light', 'moderate', 'intense'
 * @param {number} weight - Body weight in kg (optional)
 * @returns {number} Estimated calories burned
 */
export const estimateCaloriesBurned = (durationMinutes, intensity = 'moderate', weight = 70) => {
  const metabolicEquivalents = {
    light: 3.5,     // Light exercise
    moderate: 6.0,  // Moderate exercise
    intense: 8.5    // Intense exercise
  };

  const met = metabolicEquivalents[intensity] || metabolicEquivalents.moderate;
  // Formula: METs × weight (kg) × time (hours)
  const calories = met * weight * (durationMinutes / 60);
  
  return Math.round(calories);
};

/**
 * Get achievement badges based on workout statistics
 * @param {Object} stats - Workout statistics
 * @returns {Array} Array of achievement objects
 */
export const getAchievements = (stats) => {
  const achievements = [];

  if (stats.totalWorkouts >= 100) {
    achievements.push({
      title: 'Centurion',
      description: 'Hoàn thành 100 buổi tập',
      icon: 'bi-trophy-fill',
      color: 'gold'
    });
  } else if (stats.totalWorkouts >= 50) {
    achievements.push({
      title: 'Dedicated',
      description: 'Hoàn thành 50 buổi tập',
      icon: 'bi-award-fill',
      color: 'silver'
    });
  } else if (stats.totalWorkouts >= 10) {
    achievements.push({
      title: 'Getting Started',
      description: 'Hoàn thành 10 buổi tập',
      icon: 'bi-star-fill',
      color: 'bronze'
    });
  }

  if (stats.workoutStreak >= 30) {
    achievements.push({
      title: 'Streak Master',
      description: 'Tập luyện liên tiếp 30 ngày',
      icon: 'bi-fire',
      color: 'red'
    });
  } else if (stats.workoutStreak >= 7) {
    achievements.push({
      title: 'Weekly Warrior',
      description: 'Tập luyện liên tiếp 7 ngày',
      icon: 'bi-lightning-fill',
      color: 'orange'
    });
  }

  if (stats.totalHours >= 100) {
    achievements.push({
      title: 'Time Master',
      description: 'Tập luyện hơn 100 giờ',
      icon: 'bi-clock-fill',
      color: 'blue'
    });
  }

  return achievements;
};

/**
 * Generate workout summary text
 * @param {Object} stats - Workout statistics
 * @returns {string} Summary text
 */
export const generateWorkoutSummary = (stats) => {
  if (stats.totalWorkouts === 0) {
    return "Bạn chưa có buổi tập nào. Hãy bắt đầu hành trình fitness của mình!";
  }

  const summaryParts = [];
  
  summaryParts.push(`Bạn đã hoàn thành ${stats.totalWorkouts} buổi tập`);
  summaryParts.push(`tổng cộng ${stats.totalHours} giờ`);
  
  if (stats.workoutStreak > 0) {
    summaryParts.push(`và đang có chuỗi ${stats.workoutStreak} ngày tập luyện liên tiếp`);
  }

  summaryParts.push(`Tuần này bạn đã tập ${stats.weeklyWorkouts} buổi.`);

  if (stats.weeklyWorkouts >= stats.weeklyGoal) {
    summaryParts.push("Tuyệt vời! Bạn đã đạt mục tiêu tuần này!");
  } else {
    const remaining = stats.weeklyGoal - stats.weeklyWorkouts;
    summaryParts.push(`Còn ${remaining} buổi nữa để đạt mục tiêu tuần.`);
  }

  return summaryParts.join(' ');
};

export default {
  calculateWorkoutStats,
  calculateWorkoutStreak,
  getWorkoutsForPeriod,
  formatDuration,
  getWorkoutFrequencyData,
  getWorkoutIntensityDistribution,
  estimateCaloriesBurned,
  getAchievements,
  generateWorkoutSummary
};
