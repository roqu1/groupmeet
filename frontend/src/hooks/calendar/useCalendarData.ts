import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarData,
  CalendarDateRange,
  BigCalendarEvent,
  CalendarEvent,
} from '../../types/calendar';
import { getMonthDateRange } from '../../config/api';
import { ApiError } from '../useHttp';
import { useCalendar } from './useCalendar';

/**
 * Higher-level hook that manages calendar data state and transformations.
 * This hook provides a complete calendar state management solution,
 * handling data fetching, caching, and transformations for react-big-calendar.
 *
 * This hook orchestrates the two lower-level hooks (useCalendar and useUserCalendar)
 * to provide a unified interface for calendar data, regardless of whether we're
 * viewing the current user's calendar or a friend's calendar.
 */

interface UseCalendarDataReturn {
  calendarData: CalendarData | null;
  bigCalendarEvents: BigCalendarEvent[]; // Transformed for react-big-calendar
  currentDateRange: CalendarDateRange;
  isLoading: boolean;
  error: ApiError | null;
  refreshCalendarData: () => Promise<void>;
  changeCurrentDate: (newDate: Date) => void;
  clearError: () => void;
}

interface UseCalendarDataOptions {
  userId?: number; // If provided, loads another user's calendar
  initialDate?: Date; // Date to center the calendar on initially
}

export function useCalendarData(options: UseCalendarDataOptions = {}): UseCalendarDataReturn {
  const { userId, initialDate = new Date() } = options;

  // State für aktuelle Kalenderdaten und Datumsbereich
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);

  // Hook für Kalenderoperationen
  const calendarHook = useCalendar();

  const { getCalendarData, getUserCalendarData, isLoading, error, clearError } = calendarHook;

  // Aktuellen Datumsbereich basierend auf dem aktuellen Datum berechnen (Monatsansicht)
  const currentDateRange = useMemo((): CalendarDateRange => {
    return getMonthDateRange(currentDate);
  }, [currentDate]);

  /**
   * Kalenderdaten für den aktuellen Datumsbereich laden.
   * Diese Funktion wählt zwischen eigenem Kalender und Benutzerkalender basierend auf userId.
   */
  const loadCalendarData = useCallback(async () => {
    try {
      let data: CalendarData;

      if (userId) {
        // Laden des Kalenders eines anderen Benutzers (Freundeskalender)
        data = await getUserCalendarData(userId, currentDateRange);
      } else {
        // Laden des eigenen Kalenders
        data = await getCalendarData(currentDateRange);
      }

      setCalendarData(data);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    }
  }, [userId, currentDateRange, getCalendarData, getUserCalendarData]);

  /**
   * Transform calendar events into the format expected by react-big-calendar.
   * This conversion bridges your backend data structure with the library's requirements.
   *
   * This is a crucial transformation layer that allows your backend to use whatever
   * data structure makes sense for your API, while ensuring the UI library gets
   * exactly the format it expects.
   */
  const bigCalendarEvents = useMemo((): BigCalendarEvent[] => {
    if (!calendarData?.events) return [];

    return calendarData.events.map((event: CalendarEvent): BigCalendarEvent => {
      const eventDate = new Date(event.dateTime);

      return {
        id: event.id,
        title: event.title,
        start: eventDate,
        end: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000), // Default 2-hour duration
        allDay: false,
        resource: event, // Directly use the CalendarEvent as resource
      };
    });
  }, [calendarData]);

  /**
   * Refresh calendar data (useful after adding/editing events or notes).
   * This is typically called after a user makes changes to ensure the calendar
   * reflects the most current state.
   */
  const refreshCalendarData = useCallback(async () => {
    await loadCalendarData();
  }, [loadCalendarData]);

  /**
   * Change the current date and reload calendar data for the new date range.
   * This is called when users navigate to different months/weeks in the calendar.
   * The calendar automatically fetches new data when the date range changes.
   */
  const changeCurrentDate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  // Load calendar data when component mounts or date range changes
  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  return {
    calendarData,
    bigCalendarEvents,
    currentDateRange,
    isLoading,
    error,
    refreshCalendarData,
    changeCurrentDate,
    clearError,
  };
}
