import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus, selectCurrentUser, selectIsLoggedIn } from '../redux/authSlice';
import authService from '../services/authService';

const ProtectedRoute = ({ children, allowedRoles = [], requiredPermissions = [] }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  useEffect(() => {
    // Check auth status on component mount
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // If not logged in, redirect to login with return url
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no user data (corrupted state), redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = getRoleBasedDashboard(currentUser.role);
    return <Navigate to={redirectPath} replace />;
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      authService.hasPermission(permission)
    );
    
    if (!hasAllPermissions) {
      const redirectPath = getRoleBasedDashboard(currentUser.role);
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

// Helper function to get dashboard path based on role
const getRoleBasedDashboard = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'staff':
      return '/staff/dashboard';
    case 'coach':
      return '/coach/dashboard';
    case 'user':
      return '/user/dashboard';
    default:
      return '/login';
  }
};

export default ProtectedRoute; 