import { useCallback } from 'react';
import { useHttp, ApiError } from '../../hooks/useHttp'; // Pfad korrigiert
import { API_CONFIG, buildCalendarDateParams } from '../../config/api';
import { CalendarData, DayDetails, CalendarDateRange } from '../../types/calendar';

/**
 * Hook for accessing another user's calendar (friend's calendar).
 * This handles the friend permission checks and provides access to friends' calendars.
 * The backend will enforce that only friends can view each other's calendars.
 */

interface UseUserCalendarReturn {
  getUserCalendarData: (userId: number, dateRange: CalendarDateRange) => Promise<CalendarData>;
  getUserDayDetails: (userId: number, date: string) => Promise<DayDetails>;
  isLoading: boolean;
  error: ApiError | null;
  clearError: () => void;
}

export function useUserCalendar(): UseUserCalendarReturn {
  const { sendRequest, isLoading, error, clearState } = useHttp<any, ApiError>();

  /**
   * Fetch calendar data for a specific user (friend's calendar).
   * This will only work if the current user is friends with the target user.
   *
   * @param userId - The ID of the user whose calendar to view
   * @param dateRange - Object containing startDate and endDate strings
   * @returns Promise resolving to calendar data, or rejection if access denied
   */
  const getUserCalendarData = useCallback(
    async (userId: number, dateRange: CalendarDateRange): Promise<CalendarData> => {
      const queryParams = buildCalendarDateParams(dateRange.startDate, dateRange.endDate);
      const url = `${API_CONFIG.endpoints.userCalendar(userId)}?${queryParams}`;

      return await sendRequest(url, {
        method: 'GET',
      });
    },
    [sendRequest]
  );

  /**
   * Get day details for a specific user's calendar.
   * This allows viewing a friend's events and notes for a specific date.
   *
   * @param userId - The ID of the user whose day details to view
   * @param date - ISO date string (YYYY-MM-DD)
   * @returns Promise resolving to day details
   */
  const getUserDayDetails = useCallback(
    async (userId: number, date: string): Promise<DayDetails> => {
      return await sendRequest(API_CONFIG.endpoints.userCalendarDay(userId, date), {
        method: 'GET',
      });
    },
    [sendRequest]
  );

  return {
    getUserCalendarData,
    getUserDayDetails,
    isLoading,
    error,
    clearError: clearState,
  };
}
