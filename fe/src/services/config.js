// API Configuration
export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh'
    },
    USER: {
        PROFILE: '/api/users/profile',
        UPDATE: '/api/users/update'
    },
    PACKAGE: {
        LIST: '/api/packages',
        DETAIL: '/api/packages/:id'
    },
    MEMBERSHIP: {
        REGISTER: '/api/memberships/register',
        ACTIVE: '/api/memberships/active/:userId',
        HISTORY: '/api/memberships/user/:userId',
        RENEW: '/api/memberships/:membershipId/renew',
        CANCEL: '/api/memberships/:membershipId/cancel'
    }
}; 