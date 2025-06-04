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
    locations: '/api/locations',
    joinMeeting: (meetingId: string): string => `/api/meetings/${meetingId}/join`,
    leaveMeeting: (meetingId: string): string => `/api/meetings/${meetingId}/leave`,
    meetingDetails: (meetingId: string): string => `/api/meetings/${meetingId}`,
    meetingParticipants: (meetingId: string): string =>
      `/api/meetings/${meetingId}/participants-details`,
    blockMeetingParticipant: (meetingId: string, userId: number): string =>
      `/api/meetings/${meetingId}/participants/${userId}/block`,
    removeMeetingParticipant: (meetingId: string, userId: number): string =>
      `/api/meetings/${meetingId}/participants/${userId}/remove`,
    deleteMeeting: (meetingId: string): string => `/api/meetings/${meetingId}`,
    calendar: '/api/calendar',
    userCalendar: (userId: string | number): string => `/api/calendar/${userId}`,
    calendarDay: (date: string): string => `/api/calendar/day/${date}`,
    userCalendarDay: (userId: string | number, date: string): string =>
      `/api/calendar/${userId}/day/${date}`,
    calendarNotes: '/api/calendar/notes',
    calendarNoteDelete: (date: string): string => `/api/calendar/notes/${date}`,
  },
} as const;

export const buildCalendarDateParams = (startDate: string, endDate: string): string =>
  new URLSearchParams({ startDate, endDate }).toString();

export const formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];

export const getMonthDateRange = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return {
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
  };
};
