import { fetchWithAuth } from './api';
import { API_BASE } from './config';

// Tạo workout session mới
export const createWorkoutSession = async (sessionData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/workout-sessions`, {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Lấy workout sessions của user
export const getUserWorkoutSessions = async (userId, page = 1, limit = 10) => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/workout-sessions/user/${userId}?page=${page}&limit=${limit}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Lấy tiến độ workout của user
export const getUserWorkoutProgress = async (userId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/workout-sessions/user/${userId}/progress`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Xác nhận workout session (coach/staff)
export const confirmWorkoutSession = async (sessionId, confirmationData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/workout-sessions/${sessionId}/confirm`, {
      method: 'PATCH',
      body: JSON.stringify(confirmationData)
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Lấy danh sách sessions chờ xác nhận
export const getPendingWorkoutSessions = async (page = 1, limit = 10) => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/workout-sessions/pending?page=${page}&limit=${limit}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Lấy sessions theo membership
export const getSessionsByMembership = async (membershipId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/workout-sessions/membership/${membershipId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// User check-in workout session
export const checkInWorkoutSession = async (sessionId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/workout-sessions/${sessionId}/checkin`, {
      method: 'PATCH'
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Coach check-out workout session
export const checkOutWorkoutSession = async (sessionId, notes) => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/workout-sessions/${sessionId}/checkout`, {
      method: 'PATCH',
      body: JSON.stringify({ notes })
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Lấy thống kê workout cho progress
export const getWorkoutStats = async (userId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/workout-sessions/user/${userId}/stats`);
    return response;
  } catch (error) {
    throw error;
  }
};
