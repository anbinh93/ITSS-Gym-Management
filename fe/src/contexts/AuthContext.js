import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('gym_token');
        if (token) {
            // Get user info from token
            try {
                const userInfo = JSON.parse(atob(token.split('.')[1]));
                setUser(userInfo);
            } catch (error) {
                console.error('Error parsing token:', error);
                localStorage.removeItem('gym_token');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('gym_token', token);
        console.log(userData);
        console.log(token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('gym_token');
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