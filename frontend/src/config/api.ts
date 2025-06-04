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

    // Calendar endpoints - these provide all the API access needed for the personal calendar feature
    // These endpoints handle both viewing your own calendar and accessing friends' calendars
    calendar: '/api/calendar', // Get current user's calendar data with date range parameters
    userCalendar: (userId: string | number): string => `/api/calendar/${userId}`, // Get specific user's calendar (friends only)
    calendarDay: (date: string): string => `/api/calendar/day/${date}`, // Get detailed day view for current user
    userCalendarDay: (userId: string | number, date: string): string =>
      `/api/calendar/${userId}/day/${date}`, // Get day details for another user
    calendarNotes: '/api/calendar/notes', // Create or update personal notes (POST requests)
    calendarNoteDelete: (date: string): string => `/api/calendar/notes/${date}`, // Delete personal note for specific date
  },
} as const;

// Helper functions for calendar date management
// These functions standardize how we handle dates when communicating with the backend

/**
 * Builds URL query parameters for calendar date range requests.
 * This creates the "?startDate=2024-01-01&endDate=2024-01-31" part of calendar API calls.
 * Used when the calendar needs to fetch events and notes for a specific time period.
 *
 * @param startDate - ISO date string (YYYY-MM-DD format)
 * @param endDate - ISO date string (YYYY-MM-DD format)
 * @returns URL-encoded query string ready to append to API endpoints
 */
export const buildCalendarDateParams = (startDate: string, endDate: string): string =>
  new URLSearchParams({ startDate, endDate }).toString();

/**
 * Converts a JavaScript Date object to the ISO date format expected by the backend.
 * This ensures consistent date formatting across all calendar API communications.
 * The backend expects dates in YYYY-MM-DD format, and this function guarantees that format.
 *
 * @param date - JavaScript Date object
 * @returns ISO date string in YYYY-MM-DD format (e.g., "2024-03-15")
 */
export const formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];

/**
 * Calculates the start and end dates for a complete month containing the given date.
 * This is essential for calendar month view - when showing January 2024, we need
 * to fetch all events and notes for the entire month, from January 1st to January 31st.
 *
 * The function handles month boundaries automatically, including leap years and
 * months with different numbers of days (28, 29, 30, or 31 days).
 *
 * @param date - Any JavaScript Date within the desired month
 * @returns Object with startDate and endDate strings covering the full month
 *
 * Example:
 * getMonthDateRange(new Date('2024-03-15')) returns:
 * { startDate: '2024-03-01', endDate: '2024-03-31' }
 */
export const getMonthDateRange = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: January = 0, February = 1, etc.

  // Create date for first day of the month
  const startDate = new Date(year, month, 1);

  // Create date for last day of the month by going to first day of next month, then back one day
  // This automatically handles different month lengths (28, 29, 30, or 31 days)
  const endDate = new Date(year, month + 1, 0);

  return {
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
  };
};
