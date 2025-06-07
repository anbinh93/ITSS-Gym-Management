import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in using authService
        const token = authService.getToken();
        if (token) {
            // Get user info from localStorage (stored by authService)
            try {
                const userInfo = authService.getCurrentUser();
                console.log('AuthContext - Loaded user from authService:', userInfo);
                setUser(userInfo);
            } catch (error) {
                console.error('Error loading user from authService:', error);
                // Clear invalid data
                authService.logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        console.log('AuthContext - Login called with:', userData, token);
        setUser(userData);
        // Store both token and user data
        localStorage.setItem('gym_token', token);
        localStorage.setItem('gym_user', JSON.stringify(userData));
    };

    const logout = () => {
        console.log('AuthContext - Logout called');
        setUser(null);
        // Use authService to clear all data
        authService.logout();
    };

    const value = {
        user,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 