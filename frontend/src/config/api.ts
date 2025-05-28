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
    userProfile: (userId: string | number): string => `/api/users/${userId}/profile`,
    currentUserProfile: '/api/user/profile',
    incomingFriendRequests: '/api/friends/requests/incoming',
    acceptFriendRequest: (requestId: number): string => `/api/friends/requests/${requestId}/accept`,
    rejectFriendRequest: (requestId: number): string => `/api/friends/requests/${requestId}/reject`,
    createMeeting: '/api/meetings',
    searchMeetings: '/api/meetings/search',
    interests: '/api/interests',
  },
} as const;
