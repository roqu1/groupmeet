import { useState, useCallback, useMemo } from 'react';
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  View,
  DateCellWrapperProps,
} from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Loader2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'react-toastify';

// Import styles for react-big-calendar
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import DayDetailsModal from './DayDetailsModal';
import { useCalendarData } from '@/hooks/calendar/useCalendarData';
import { useCalendar } from '@/hooks/calendar/useCalendar';
import { BigCalendarEvent, DayDetails } from '@/types/calendar';
import { formatDateForApi } from '@/config/api';

/**
 * Main Calendar component that integrates react-big-calendar with our calendar system.
 * This component handles requirements A_2, A_3, A_4, A_5, A_6 from the ticket:
 * - A_2: Integrates react-big-calendar component
 * - A_3: Correct display in light and dark themes
 * - A_4: Shows meetings the user participates in
 * - A_5/A_6: Automatically updates when user joins/leaves meetings
 */

interface CalendarProps {
  userId?: number; // If provided, shows another user's calendar (friend view)
  className?: string;
}

// Configure date-fns localizer for German locale
const locales = {
  de: de,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// German translations for calendar interface
const messages = {
  allDay: 'Ganztägig',
  previous: 'Zurück',
  next: 'Weiter',
  today: 'Heute',
  month: 'Monat',
  week: 'Woche',
  work_week: 'Arbeitswoche',
  day: 'Tag',
  agenda: 'Agenda',
  date: 'Datum',
  time: 'Zeit',
  event: 'Termin',
  noEventsInRange: 'Keine Termine in diesem Zeitraum.',
  showMore: (total: number) => `+ ${total} weitere`,
};

export default function Calendar({ userId, className }: CalendarProps) {
  // Calendar data and state management
  const {
    calendarData,
    bigCalendarEvents,
    isLoading,
    error,
    refreshCalendarData,
    changeCurrentDate,
    clearError,
  } = useCalendarData({ userId });

  // Day details modal state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetails, setDayDetails] = useState<DayDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDayDetails, setIsLoadingDayDetails] = useState(false);

  // Hook for fetching day details
  const { getDayDetails } = useCalendar();

  // Determine if this is the current user's calendar
  const isOwnCalendar = !userId;

  // Handle date/slot selection (when user clicks on a date)
  const handleSelectSlot = useCallback(
    async ({ start }: { start: Date }) => {
      const dateString = formatDateForApi(start);
      setSelectedDate(dateString);
      setIsLoadingDayDetails(true);

      try {
        const details = await getDayDetails(dateString);
        setDayDetails(details);
        setIsModalOpen(true);
      } catch (err) {
        toast.error('Fehler beim Laden der Tagesdetails.');
        console.error('Failed to load day details:', err);
      } finally {
        setIsLoadingDayDetails(false);
      }
    },
    [getDayDetails]
  );

  // Handle event selection (when user clicks on an event)
  const handleSelectEvent = useCallback((event: BigCalendarEvent) => {
    // Navigate to meeting details page
    const meetingId = event.resource?.originalEvent?.id;
    if (meetingId) {
      window.open(`/groups/${meetingId}`, '_blank');
    }
  }, []);

  // Handle calendar navigation (month/week/day changes)
  const handleNavigate = useCallback(
    (newDate: Date) => {
      changeCurrentDate(newDate);
    },
    [changeCurrentDate]
  );

  // Close modal and refresh data if needed
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setDayDetails(null);
  }, []);

  // Refresh calendar data after modal changes
  const handleDataChange = useCallback(() => {
    refreshCalendarData();
  }, [refreshCalendarData]);

  // Custom event component to show meeting details
  const EventComponent = useCallback(({ event }: { event: BigCalendarEvent }) => {
    const resource = event.resource;
    return (
      <div className="text-xs">
        <div className="font-medium truncate">{event.title}</div>
        {resource?.location && (
          <div className="text-muted-foreground truncate">{resource.location}</div>
        )}
        <div className="flex items-center gap-1 mt-1">
          <Badge
            variant={resource?.format === 'ONLINE' ? 'default' : 'secondary'}
            className="text-xs px-1 py-0"
          >
            {resource?.format || 'Meeting'}
          </Badge>
          {resource?.isOrganizer && (
            <Badge variant="destructive" className="text-xs px-1 py-0">
              Org
            </Badge>
          )}
        </div>
      </div>
    );
  }, []);

  // Custom day background component to show dates with notes
  const DayBackgroundComponent = useCallback(
    (props: DateCellWrapperProps) => {
      // Korrigierte Version mit dem richtigen DateCellWrapperProps-Typ
      const dateString = formatDateForApi(props.value);
      const hasNote = calendarData?.datesWithNotes?.includes(dateString);

      return (
        <div className="relative">
          {props.children}
          {hasNote && (
            <div
              className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"
              title="Hat persönliche Notiz"
            />
          )}
        </div>
      );
    },
    [calendarData?.datesWithNotes]
  );

  // Calendar component configuration
  const calendarComponents = useMemo(
    () => ({
      event: EventComponent,
      dateCellWrapper: DayBackgroundComponent,
    }),
    [EventComponent, DayBackgroundComponent]
  );

  // Loading state
  if (isLoading && !calendarData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Kalender wird geladen...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !calendarData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">
            {error instanceof Error ? error.message : 'Fehler beim Laden des Kalenders.'}
          </p>
          <Button
            onClick={() => {
              clearError();
              refreshCalendarData();
            }}
          >
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Calendar Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">
            {bigCalendarEvents.length} Termine • {calendarData?.notes?.length || 0} Notizen
          </span>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Aktualisierung...
          </div>
        )}
      </div>

      {/* Main Calendar Component */}
      <div className="calendar-container bg-background border rounded-lg p-4" aria-label="Kalender">
        <BigCalendar
          localizer={localizer}
          events={bigCalendarEvents}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          allDayAccessor="allDay"
          resourceAccessor="resource"
          // Event handlers
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onNavigate={handleNavigate}
          // Calendar configuration
          selectable={true}
          popup={true}
          showMultiDayTimes={true}
          step={30}
          timeslots={2}
          // Views configuration
          views={['month', 'week', 'work_week', 'day', 'agenda'] as View[]}
          defaultView="month"
          // Localization
          culture="de"
          messages={messages}
          // Styling
          style={{ height: 600 }}
          dayLayoutAlgorithm="no-overlap"
          // Custom components
          components={calendarComponents}
        />
      </div>

      {/* Legend for calendar symbols */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full" />
          <span>Tag mit persönlicher Notiz</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs">
            ONLINE
          </Badge>
          <span>Online-Meeting</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-xs">
            Org
          </Badge>
          <span>Sie sind Organisator</span>
        </div>
      </div>

      {/* Day Details Modal */}
      <DayDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedDate={selectedDate}
        dayDetails={isLoadingDayDetails ? null : dayDetails}
        isOwnCalendar={isOwnCalendar}
        onDataChange={handleDataChange}
      />

      {/* Loading overlay for day details */}
      {isLoadingDayDetails && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Tagesdetails werden geladen...</span>
          </div>
        </div>
      )}
    </div>
  );
}
