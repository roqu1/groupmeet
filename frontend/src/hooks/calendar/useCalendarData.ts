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

interface UseCalendarDataReturn {
  calendarData: CalendarData | null;
  bigCalendarEvents: BigCalendarEvent[];
  currentDateRange: CalendarDateRange;
  isLoading: boolean;
  error: ApiError | null;
  refreshCalendarData: () => Promise<void>;
  changeCurrentDate: (newDate: Date) => void;
  clearError: () => void;
}

interface UseCalendarDataOptions {
  userId?: number;
  initialDate?: Date;
}

export function useCalendarData(options: UseCalendarDataOptions = {}): UseCalendarDataReturn {
  const { userId, initialDate = new Date() } = options;

  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);

  const calendarHook = useCalendar();

  const { getCalendarData, getUserCalendarData, isLoading, error, clearError } = calendarHook;

  const currentDateRange = useMemo((): CalendarDateRange => {
    return getMonthDateRange(currentDate);
  }, [currentDate]);

  const loadCalendarData = useCallback(async () => {
    try {
      let data: CalendarData;

      if (userId) {
        data = await getUserCalendarData(userId, currentDateRange);
      } else {
        data = await getCalendarData(currentDateRange);
      }

      setCalendarData(data);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    }
  }, [userId, currentDateRange, getCalendarData, getUserCalendarData]);

  const bigCalendarEvents = useMemo((): BigCalendarEvent[] => {
    if (!calendarData?.events) return [];

    return calendarData.events.map((event: CalendarEvent): BigCalendarEvent => {
      const eventDate = new Date(event.dateTime);

      return {
        id: event.id,
        title: event.title,
        start: eventDate,
        end: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000),
        allDay: false,
        resource: event,
      };
    });
  }, [calendarData]);
  const refreshCalendarData = useCallback(async () => {
    await loadCalendarData();
  }, [loadCalendarData]);

  const changeCurrentDate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

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
