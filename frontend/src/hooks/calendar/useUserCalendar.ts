import { useCallback } from 'react';
import { useHttp, ApiError } from '../useHttp';
import { API_CONFIG, buildCalendarDateParams } from '../../config/api';
import {
  CalendarData,
  DayDetails,
  PersonalNote,
  PersonalNoteRequest,
  CalendarDateRange,
} from '@/types/calendar.ts';

interface UseCalendarReturn {
  getCalendarData: (dateRange: CalendarDateRange) => Promise<CalendarData>;
  getDayDetails: (date: string) => Promise<DayDetails>;
  savePersonalNote: (note: PersonalNoteRequest) => Promise<PersonalNote>;
  deletePersonalNote: (date: string) => Promise<void>;
  isLoading: boolean;
  error: ApiError | null;
  clearError: () => void;
}

export function useUserCalendar(): UseCalendarReturn {
  const { sendRequest, isLoading, error, clearState } = useHttp();
  const getCalendarData = useCallback(
    async (dateRange: CalendarDateRange): Promise<CalendarData> => {
      const queryParams = buildCalendarDateParams(dateRange.startDate, dateRange.endDate);
      const url = `${API_CONFIG.endpoints.calendar}?${queryParams}`;

      return (await sendRequest(url, {
        method: 'GET',
      })) as CalendarData;
    },
    [sendRequest]
  );

  const getDayDetails = useCallback(
    async (date: string): Promise<DayDetails> => {
      return (await sendRequest(API_CONFIG.endpoints.calendarDay(date), {
        method: 'GET',
      })) as DayDetails;
    },
    [sendRequest]
  );

  const savePersonalNote = useCallback(
    async (note: PersonalNoteRequest): Promise<PersonalNote> => {
      return (await sendRequest(API_CONFIG.endpoints.calendarNotes, {
        method: 'POST',
        body: note,
      })) as PersonalNote;
    },
    [sendRequest]
  );

  const deletePersonalNote = useCallback(
    async (date: string): Promise<void> => {
      await sendRequest(API_CONFIG.endpoints.calendarNoteDelete(date), {
        method: 'DELETE',
      });
    },
    [sendRequest]
  );

  return {
    getCalendarData,
    getDayDetails,
    savePersonalNote,
    deletePersonalNote,
    isLoading,
    error,
    clearError: clearState,
  };
}
