import { useCallback } from 'react';
import { useHttp, ApiError } from '../useHttp';
import { API_CONFIG, buildCalendarDateParams } from '../../config/api';
import {
    CalendarData,
    DayDetails,
    PersonalNote,
    PersonalNoteRequest,
    CalendarDateRange,
} from '../../types/calendar';

interface UseCalendarReturn {
    getCalendarData: (dateRange: CalendarDateRange) => Promise<CalendarData>;
    getDayDetails: (date: string) => Promise<DayDetails>;
    savePersonalNote: (note: PersonalNoteRequest) => Promise<PersonalNote>;
    deletePersonalNote: (date: string) => Promise<void>;
    getUserCalendarData: (userId: number, dateRange: CalendarDateRange) => Promise<CalendarData>;
    getUserDayDetails: (userId: number, date: string) => Promise<DayDetails>;
    isLoading: boolean;
    error: ApiError | null;
    clearError: () => void;
}

export function useCalendar(): UseCalendarReturn {
    const { sendRequest, isLoading, error, clearState } = useHttp();

    /**
     * Kalenderdaten für den aktuellen Benutzer innerhalb eines Datumsbereichs abrufen.
     */
    const getCalendarData = useCallback(
        async (dateRange: CalendarDateRange): Promise<CalendarData> => {
            const queryParams = buildCalendarDateParams(dateRange.startDate, dateRange.endDate);
            const url = `${API_CONFIG.endpoints.calendar}?${queryParams}`;

            return await sendRequest(url, {
                method: 'GET',
            }) as CalendarData;
        },
        [sendRequest]
    );

    /**
     * Detaillierte Informationen für ein bestimmtes Datum abrufen.
     */
    const getDayDetails = useCallback(
        async (date: string): Promise<DayDetails> => {
            return await sendRequest(API_CONFIG.endpoints.calendarDay(date), {
                method: 'GET',
            }) as DayDetails;
        },
        [sendRequest]
    );

    /**
     * Eine persönliche Notiz für ein bestimmtes Datum erstellen oder aktualisieren.
     */
    const savePersonalNote = useCallback(
        async (note: PersonalNoteRequest): Promise<PersonalNote> => {
            return await sendRequest(API_CONFIG.endpoints.calendarNotes, {
                method: 'POST',
                body: note,
            }) as PersonalNote;
        },
        [sendRequest]
    );

    /**
     * Eine persönliche Notiz für ein bestimmtes Datum löschen.
     */
    const deletePersonalNote = useCallback(
        async (date: string): Promise<void> => {
            await sendRequest(API_CONFIG.endpoints.calendarNoteDelete(date), {
                method: 'DELETE',
            });
        },
        [sendRequest]
    );

    /**
     * Kalenderdaten eines bestimmten Benutzers abrufen (Freundeskalender).
     */
    const getUserCalendarData = useCallback(
        async (userId: number, dateRange: CalendarDateRange): Promise<CalendarData> => {
            const queryParams = buildCalendarDateParams(dateRange.startDate, dateRange.endDate);
            const url = `${API_CONFIG.endpoints.userCalendar(userId)}?${queryParams}`;

            return await sendRequest(url, {
                method: 'GET',
            }) as CalendarData;
        },
        [sendRequest]
    );

    /**
     * Tagesdetails für einen bestimmten Benutzerkalender abrufen.
     */
    const getUserDayDetails = useCallback(
        async (userId: number, date: string): Promise<DayDetails> => {
            return await sendRequest(API_CONFIG.endpoints.userCalendarDay(userId, date), {
                method: 'GET',
            }) as DayDetails;
        },
        [sendRequest]
    );

    return {
        getCalendarData,
        getDayDetails,
        savePersonalNote,
        deletePersonalNote,
        getUserCalendarData,
        getUserDayDetails,
        isLoading,
        error,
        clearError: clearState,
    };
}