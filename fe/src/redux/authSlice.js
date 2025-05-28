import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return {};
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get initial state from localStorage
const getInitialState = () => {
  const user = JSON.parse(localStorage.getItem('gym_user') || 'null');
  const token = localStorage.getItem('gym_token');
  if (!user || !token) {
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_user');
  }
  const isAuthenticated = !!token && !!user;
  return {
    currentUser: user,
    isLoggedIn: isAuthenticated,
    token: token,
    loading: false,
    error: null,
    lastLogin: user ? new Date().toISOString() : null,
  };
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
        localStorage.setItem('gym_user', JSON.stringify(state.currentUser));
      }
    },
    checkAuthStatus: (state) => {
      const user = JSON.parse(localStorage.getItem('gym_user') || 'null');
      const token = authService.getToken();
      const isAuthenticated = authService.isAuthenticated();
      
      state.currentUser = user;
      state.isLoggedIn = isAuthenticated;
      state.token = token;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.error = null;
        state.lastLogin = new Date().toISOString();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentUser = null;
        state.token = null;
        state.isLoggedIn = false;
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.currentUser = null;
        state.token = null;
        state.isLoggedIn = false;
        state.error = null;
        state.lastLogin = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Still logout on error
        state.currentUser = null;
        state.token = null;
        state.isLoggedIn = false;
      })
      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
      })
      .addCase(refreshToken.rejected, (state) => {
        // If refresh fails, logout user
        state.currentUser = null;
        state.token = null;
        state.isLoggedIn = false;
      });
  },
});

export const { clearError, updateUserProfile, checkAuthStatus } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.currentUser?.role;
export const selectUserPermissions = (state) => state.auth.currentUser?.permissions || [];

export default authSlice.reducer;
