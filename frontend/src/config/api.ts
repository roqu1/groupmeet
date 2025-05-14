const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const API_CONFIG = {
  baseUrl: BACKEND_URL,
  endpoints: {
    test: '/api/test',
    register: '/api/auth/register',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    friends: '/api/friends',
    friendById: (friendId: number | string): string => `/api/friends/${friendId}`,
    userSearch: '/api/users/search',
    sendFriendRequest: (targetUserId: number): string => `/api/friends/requests/${targetUserId}`,
  },
} as const;
