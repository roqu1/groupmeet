export interface PersonalNote {
  id: number;
  noteDate: string; // ISO date string (YYYY-MM-DD)
  content: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

/**
 * Request structure for creating or updating personal notes.
 * This matches your backend PersonalNoteRequestDto.
 */
export interface PersonalNoteRequest {
  noteDate: string; // ISO date string (YYYY-MM-DD)
  content: string;
}

/**
 * Calendar event data structure.
 * Represents a meeting/event that appears on the calendar.
 */
export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  dateTime: string; // ISO datetime string
  location?: string;
  format: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  isOrganizer: boolean;
  participantCount: number;
}

/**
 * Complete calendar data response from the backend.
 * Contains all information needed to render a user's calendar for a date range.
 */
export interface CalendarData {
  events: CalendarEvent[];
  notes: PersonalNote[];
  datesWithNotes: string[]; // Array of ISO date strings that have notes
}

/**
 * Day details response when clicking on a specific calendar date.
 * Contains all events and notes for that specific day.
 */
export interface DayDetails {
  date: string; // ISO date string
  eventsForDay: CalendarEvent[];
  noteForDay: PersonalNote | null; // null if no note exists for this date
}

/**
 * React Big Calendar event structure.
 * This is the format that react-big-calendar expects for events.
 * We'll transform our CalendarEvent data into this format.
 */
export interface BigCalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: CalendarEvent; // Additional data we want to attach to the event
}

/**
 * Calendar view types supported by react-big-calendar.
 * We'll allow users to switch between these different views.
 */
export type CalendarView = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

/**
 * Calendar hook state for managing loading and error states.
 * This follows the same pattern as your existing hooks like useLogin.
 */
export interface CalendarHookState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Calendar navigation parameters.
 * Used when fetching calendar data for specific date ranges.
 */
export interface CalendarDateRange {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

/**
 * Modal state for day details dialog.
 * Manages what's shown when a user clicks on a calendar date.
 */
export interface DayDetailsModalState {
  isOpen: boolean;
  date: string | null; // ISO date string
  dayDetails: DayDetails | null;
  isLoadingDetails: boolean;
  error: string | null;
}

/**
 * Note editing state within the day details modal.
 * Manages the form for adding/editing personal notes.
 */
export interface NoteEditingState {
  isEditing: boolean;
  content: string;
  isSaving: boolean;
  error: string | null;
}

/**
 * Calendar permissions for viewing other users' calendars.
 * Used to determine what actions are available to the current user.
 */
export interface CalendarPermissions {
  canView: boolean;
  canEdit: boolean; // Only true for own calendar
  isOwnCalendar: boolean;
}

/**
 * Calendar settings/preferences.
 * Could be used for storing user preferences about calendar display.
 */
export interface CalendarSettings {
  defaultView: CalendarView;
  startOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  showWeekends: boolean;
  timeFormat: '12h' | '24h';
}

/**
 * API response wrapper for calendar endpoints.
 * Provides consistent error handling across all calendar API calls.
 */
export interface CalendarApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error' | 'loading';
}
