export interface PersonalNote {
  id: number;
  noteDate: string; // ISO date string (YYYY-MM-DD)
  content: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface PersonalNoteRequest {
  noteDate: string; // ISO date string (YYYY-MM-DD)
  content: string;
}

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

export interface CalendarData {
  events: CalendarEvent[];
  notes: PersonalNote[];
  datesWithNotes: string[]; // Array of ISO date strings that have notes
}

export interface DayDetails {
  date: string; // ISO date string
  eventsForDay: CalendarEvent[];
  noteForDay: PersonalNote | null; // null if no note exists for this date
}

export interface BigCalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: CalendarEvent; // Additional data we want to attach to the event
}

export type CalendarView = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

export interface CalendarHookState {
  isLoading: boolean;
  error: string | null;
}

export interface CalendarDateRange {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface DayDetailsModalState {
  isOpen: boolean;
  date: string | null; // ISO date string
  dayDetails: DayDetails | null;
  isLoadingDetails: boolean;
  error: string | null;
}

export interface NoteEditingState {
  isEditing: boolean;
  content: string;
  isSaving: boolean;
  error: string | null;
}

export interface CalendarPermissions {
  canView: boolean;
  canEdit: boolean; // Only true for own calendar
  isOwnCalendar: boolean;
}

export interface CalendarSettings {
  defaultView: CalendarView;
  startOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  showWeekends: boolean;
  timeFormat: '12h' | '24h';
}

export interface CalendarApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error' | 'loading';
}
