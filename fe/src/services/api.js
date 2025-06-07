import { API_BASE } from './config';

// Helper function to handle auth errors
const handleAuthError = (response) => {
  if (!response.success && response.message === "Not Authorized Login Again") {
    // Clear stored auth data
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_user');
    
    // Redirect to login
    window.location.href = '/login';
    return true;
  }
  return false;
};

// Enhanced fetch function with auth error handling
const fetchWithAuth = async (url, options = {}) => {
  try{
        const token = localStorage.getItem('gym_token');
        const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("fetchWithAuth data:", data);
      // Check for auth errors
      if (handleAuthError(data)) {
        throw new Error('Authentication expired');
      }
      
      return data;
  }catch(error){
    console.log("fetchWithAuth error:", error);
    // Return error response structure instead of undefined
    return {
      success: false,
      message: error.message || 'Network error',
      error: error
    };
  }
  
};

export async function login(emailOrUsername, password) {
  console.log('Calling API login:', { emailOrUsername, password });
  const res = await fetch(`${API_BASE}/api/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrUsername, password })
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function register(name, email, password, phone, birthYear, role, gender, username) {
  const res = await fetch(`${API_BASE}/api/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, phone, birthYear, role, gender, username })
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function getCurrentUser() {
  return JSON.parse(localStorage.getItem("gym_user") || "null");
}

export async function logout() {
  localStorage.removeItem("gym_token");
  localStorage.removeItem("gym_user");
  return { message: "Logout successful" };
}

// ===== GYM ROOM API =====
export async function getAllGymRooms() {
  try {
    return await fetchWithAuth(`${API_BASE}/api/gymroom`);
  } catch (error) {
    console.error('getAllGymRooms error:', error);
    throw new Error('Lấy danh sách phòng tập thất bại');
  }
}

export async function createGymRoom(data) {
  const res = await fetch(`${API_BASE}/api/gymroom`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('gym_token') || ''}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Tạo phòng tập thất bại');
  return res.json();
}

export async function updateGymRoom(id, data) {
  const res = await fetch(`${API_BASE}/api/gymroom/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('gym_token') || ''}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Cập nhật phòng tập thất bại');
  return res.json();
}

export async function deleteGymRoom(id) {
  const res = await fetch(`${API_BASE}/api/gymroom/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('gym_token') || ''}`
    }
  });
  if (!res.ok) throw new Error('Xóa phòng tập thất bại');
  return res.json();
}

// ===== USER API (Staff, Customer) =====
export async function getAllUsers() {
  try {
    return await fetchWithAuth(`${API_BASE}/api/user`);
  } catch (error) {
    console.error('getAllUsers error:', error);
    throw new Error('Lấy danh sách người dùng thất bại');
  }
}

export async function getUserById(id) {
  const res = await fetch(`${API_BASE}/api/user/${id}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('gym_token') || ''}` }
  });
  if (!res.ok) throw new Error('Lấy thông tin người dùng thất bại');
  return res.json();
}

export async function updateUser(id, data) {
  try {
    return await fetchWithAuth(`${API_BASE}/api/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('updateUser error:', error);
    throw new Error('Cập nhật người dùng thất bại');
  }
}

export async function deleteUser(id) {
  try {
    return await fetchWithAuth(`${API_BASE}/api/user/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('deleteUser error:', error);
    throw new Error('Xóa người dùng thất bại');
  }
}

// ===== DEVICE (EQUIPMENT) API =====
export async function getAllDevices() {
  try {
    return await fetchWithAuth(`${API_BASE}/api/equipment`);
  } catch (error) {
    console.error('getAllDevices error:', error);
    throw new Error('Lấy danh sách thiết bị thất bại');
  }
}

export async function createDevice(data) {
  try {
    return await fetchWithAuth(`${API_BASE}/api/equipment`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('createDevice error:', error);
    throw new Error('Tạo thiết bị thất bại');
  }
}

export async function updateDevice(id, data) {
  try {
    return await fetchWithAuth(`${API_BASE}/api/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('updateDevice error:', error);
    throw new Error('Cập nhật thiết bị thất bại');
  }
}

export async function deleteDevice(id) {
  try {
    return await fetchWithAuth(`${API_BASE}/api/equipment/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('deleteDevice error:', error);
    throw new Error('Xóa thiết bị thất bại');
  }
}

// ===== PACKAGE API =====
export async function getAllPackages() {
  try {
    return await fetchWithAuth(`${API_BASE}/api/package`);
  } catch (error) {
    console.error('getAllPackages error:', error);
    throw new Error('Lấy danh sách gói tập thất bại');
  }
}

export async function createPackage(data) {
  const res = await fetch(`${API_BASE}/api/package`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('gym_token') || ''}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Tạo gói tập thất bại');
  return res.json();
}

export async function updatePackage(id, data) {
  const res = await fetch(`${API_BASE}/api/package/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('gym_token') || ''}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Cập nhật gói tập thất bại');
  return res.json();
}

export async function deletePackage(id) {
  const res = await fetch(`${API_BASE}/api/package/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('gym_token') || ''}`
    }
  });
  if (!res.ok) throw new Error('Xóa gói tập thất bại');
  return res.json();
}

// ===== FEEDBACK API =====
export async function getFeedbacksByTarget(target) {
  const res = await fetch(`${API_BASE}/api/feedbacks/target/${target}`);
  if (!res.ok) throw new Error('Lấy phản hồi thất bại');
  return res.json();
}

export async function submitFeedback(data) {
  const res = await fetch(`${API_BASE}/api/feedbacks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('gym_token') || ''}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Gửi phản hồi thất bại');
  return res.json();
}

// ===== STATISTICS API =====
export async function getRevenue(period = 'month') {
  try {
    return await fetchWithAuth(`${API_BASE}/api/statistics/revenue?period=${period}`);
  } catch (error) {
    console.error('getRevenue error:', error);
    return { success: false, revenue: 0, timeSeriesData: [], period };
  }
}

export async function getNewMembersStats() {
  try {
    return await fetchWithAuth(`${API_BASE}/api/statistics/new-members`);
  } catch (error) {
    console.error('getNewMembersStats error:', error);
    return { success: false, total: 0, recent: [] };
  }
}

export async function getStaffPerformance() {
  try {
    return await fetchWithAuth(`${API_BASE}/api/statistics/staff-performance`);
  } catch (error) {
    console.error('getStaffPerformance error:', error);
    return { success: false, stats: {} };
  }
}

// ===== WORKOUT SCHEDULE API =====
export async function getUserWorkoutSchedule(userId) {
  return await fetchWithAuth(`${API_BASE}/api/schedule/user/${userId}`, {
    method: 'GET'
  });
}

export async function getCoachWorkoutSchedule(coachId) {
  return await fetchWithAuth(`${API_BASE}/api/schedule/coach/${coachId}`);
}

export async function createUserWorkoutSchedule(userId, data) {
  return await fetchWithAuth(`${API_BASE}/api/schedule/user/${userId}`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getUserProgress(userId) {
  return await fetchWithAuth(`${API_BASE}/api/progress/user/${userId}`);
}

export async function updateUserProgress(userId, progressData) {
  return await fetchWithAuth(`${API_BASE}/api/progress/user/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(progressData)
  });
}

export { fetchWithAuth };