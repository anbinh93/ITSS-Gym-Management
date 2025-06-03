const API_BASE = process.env.REACT_APP_API_URL || "";

// Helper function to handle auth errors
const handleAuthError = (response) => {
  if (!response.success && (
    response.message === "Not Authorized Login Again" ||
    response.message === "Token expired" ||
    response.message === "Invalid token" ||
    response.status === 401
  )) {
    // Clear stored auth data
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_user');
    
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    return true;
  }
  return false;
};

// Enhanced fetch function with auth error handling
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('gym_token');
  
  // If no token and not on login page, redirect to login
  if (!token && !window.location.pathname.includes('/login')) {
    window.location.href = '/login';
    throw new Error('No authentication token found');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for auth errors
    if (handleAuthError(data)) {
      throw new Error('Authentication expired');
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export async function login(emailOrUsername, password) {
  try {
    const res = await fetch(`${API_BASE}/api/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername, password })
    });

    if (!res.ok) {
      throw new Error("Login failed");
    }

    const data = await res.json();
    
    if (data.success && data.token) {
      // Store token and user data
      localStorage.setItem('gym_token', data.token);
      localStorage.setItem('gym_user', JSON.stringify(data.user));
      
      // Redirect based on user role
      const role = data.user.role;
      if (role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else if (role === 'STAFF') {
        window.location.href = '/staff/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      throw new Error(data.message || "Login failed");
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
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
  try {
    // Call logout API to invalidate token on server
    await fetch(`${API_BASE}/api/user/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('gym_token') || ''}`
      }
    });

    // Clear local storage regardless of API response
    localStorage.removeItem("gym_token");
    localStorage.removeItem("gym_user");
    
    // Force redirect to login page
    window.location.href = '/login';
    
    return { success: true, message: "Logout successful" };
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local storage and redirect even if API call fails
    localStorage.removeItem("gym_token");
    localStorage.removeItem("gym_user");
    window.location.href = '/login';
    return { success: false, message: "Logout failed but cleared local data" };
  }
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
  const res = await fetch(`${API_BASE}/api/feedbacks/target/${target}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('gym_token') || ''}`
    }
  });
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

export async function updateFeedbackStatus(feedbackId, updateData) {
  const res = await fetch(`${API_BASE}/api/feedbacks/${feedbackId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('gym_token') || ''}`
    },
    body: JSON.stringify(updateData)
  });
  if (!res.ok) throw new Error('Cập nhật trạng thái phản hồi thất bại');
  return res.json();
}

// ===== STATISTICS API =====
export async function getRevenue() {
  try {
    return await fetchWithAuth(`${API_BASE}/api/statistics/revenue`);
  } catch (error) {
    console.error('getRevenue error:', error);
    return { success: false, revenue: 0 };
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