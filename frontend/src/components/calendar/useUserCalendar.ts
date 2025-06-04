import { useCallback } from 'react';
import { useHttp, ApiError } from '../../hooks/useHttp'; // Pfad korrigiert
import { API_CONFIG, buildCalendarDateParams } from '../../config/api';
import { CalendarData, DayDetails, CalendarDateRange } from '../../types/calendar';

interface UseUserCalendarReturn {
  getUserCalendarData: (userId: number, dateRange: CalendarDateRange) => Promise<CalendarData>;
  getUserDayDetails: (userId: number, date: string) => Promise<DayDetails>;
  isLoading: boolean;
  error: ApiError | null;
  clearError: () => void;
}

export function useUserCalendar(): UseUserCalendarReturn {
  const { sendRequest, isLoading, error, clearState } = useHttp();

  const getUserCalendarData = useCallback(
    async (userId: number, dateRange: CalendarDateRange): Promise<CalendarData> => {
      const queryParams = buildCalendarDateParams(dateRange.startDate, dateRange.endDate);
      const url = `${API_CONFIG.endpoints.userCalendar(userId)}?${queryParams}`;

      return (await sendRequest(url, {
        method: 'GET',
      })) as CalendarData;
    },
    [sendRequest]
  );

  const getUserDayDetails = useCallback(
    async (userId: number, date: string): Promise<DayDetails> => {
      return (await sendRequest(API_CONFIG.endpoints.userCalendarDay(userId, date), {
        method: 'GET',
      })) as DayDetails;
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
