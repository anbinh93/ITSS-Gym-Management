// Mock Authentication Service
const DEMO_ACCOUNTS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@gym.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    permissions: ['all']
  },
  {
    id: 2,
    username: 'staff',
    email: 'staff@gym.com',
    password: 'staff123',
    role: 'staff',
    name: 'Staff Member',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b8e5?w=150&h=150&fit=crop&crop=face',
    permissions: ['customer', 'subscription', 'feedback', 'gymroom', 'device']
  },
  {
    id: 3,
    username: 'coach',
    email: 'coach@gym.com',
    password: 'coach123',
    role: 'coach',
    name: 'Personal Trainer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    permissions: ['clients', 'schedule', 'programs', 'progress']
  },
  {
    id: 4,
    username: 'user',
    email: 'user@gym.com',
    password: 'user123',
    role: 'user',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
    permissions: ['dashboard', 'schedule', 'progress', 'profile']
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a mock JWT token
const generateToken = (user) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    id: user.id, 
    email: user.email, 
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

// Decode mock JWT token
const decodeToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Date.now()) return null; // Token expired
    
    return payload;
  } catch (error) {
    return null;
  }
};

export const authService = {
  // Login with email/username and password
  async login(credentials) {
    await delay(800); // Simulate network delay
    
    const { emailOrUsername, password } = credentials;
    
    const user = DEMO_ACCOUNTS.find(
      account => 
        (account.email === emailOrUsername || account.username === emailOrUsername) &&
        account.password === password
    );
    
    if (!user) {
      throw new Error('Invalid email/username or password');
    }
    
    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    
    // Store in localStorage for persistence
    localStorage.setItem('gym_token', token);
    localStorage.setItem('gym_user', JSON.stringify(userWithoutPassword));
    
    return {
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    };
  },
  
  // Logout
  async logout() {
    await delay(300);
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_user');
    return { message: 'Logout successful' };
  },
  
  // Get current user from stored token
  getCurrentUser() {
    const token = localStorage.getItem('gym_token');
    const storedUser = localStorage.getItem('gym_user');
    
    if (!token || !storedUser) return null;
    
    const payload = decodeToken(token);
    if (!payload) {
      // Token invalid or expired
      this.logout();
      return null;
    }
    
    return JSON.parse(storedUser);
  },
  
  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('gym_token');
    if (!token) return false;
    
    const payload = decodeToken(token);
    return payload !== null;
  },
  
  // Get stored token
  getToken() {
    return localStorage.getItem('gym_token');
  },
  
  // Get demo accounts (for development/testing)
  getDemoAccounts() {
    return DEMO_ACCOUNTS.map(({ password, ...account }) => account);
  },
  
  // Check user permissions
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  },
  
  // Refresh token (mock implementation)
  async refreshToken() {
    await delay(500);
    const user = this.getCurrentUser();
    if (!user) throw new Error('No user found');
    
    const newToken = generateToken(user);
    localStorage.setItem('gym_token', newToken);
    return { token: newToken };
  }
};

export default authService; 