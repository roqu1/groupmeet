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

/**
 * Hook for managing calendar data operations.
 * This follows the exact same pattern as your useLogin hook,
 * using your existing useHttp utility for consistent error handling and loading states.
 */

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

  /**
   * Fetch calendar data for the current user within a date range.
   * This gets both meetings and personal notes for the specified period.
   *
   * @param dateRange - Object containing startDate and endDate strings
   * @returns Promise resolving to complete calendar data
   */
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

  /**
   * Get detailed information for a specific date.
   * This is called when a user clicks on a calendar date to see all events and notes for that day.
   *
   * @param date - ISO date string (YYYY-MM-DD)
   * @returns Promise resolving to day details including events and notes
   */
  const getDayDetails = useCallback(
    async (date: string): Promise<DayDetails> => {
      return (await sendRequest(API_CONFIG.endpoints.calendarDay(date), {
        method: 'GET',
      })) as DayDetails;
    },
    [sendRequest]
  );

  /**
   * Create or update a personal note for a specific date.
   * If a note already exists for the date, it will be updated; otherwise, a new note is created.
   *
   * @param note - The note data including date and content
   * @returns Promise resolving to the saved note
   */
  const savePersonalNote = useCallback(
    async (note: PersonalNoteRequest): Promise<PersonalNote> => {
      return (await sendRequest(API_CONFIG.endpoints.calendarNotes, {
        method: 'POST',
        body: note,
      })) as PersonalNote;
    },
    [sendRequest]
  );

  /**
   * Delete a personal note for a specific date.
   * This removes the note completely from the user's calendar.
   *
   * @param date - ISO date string (YYYY-MM-DD) of the note to delete
   * @returns Promise that resolves when deletion is complete
   */
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
