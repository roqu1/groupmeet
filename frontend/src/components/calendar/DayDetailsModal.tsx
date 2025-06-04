import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/Badge'; // Konsistente Großschreibung verwenden
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit3,
  Trash2,
  Save,
  X,
  Plus,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'react-toastify';

import { DayDetails, CalendarEvent, PersonalNoteRequest } from '@/types/calendar';
import { useCalendar } from '@/hooks/calendar/useCalendar';

/**
 * Modal component that displays detailed information for a selected calendar date.
 * This component handles requirements A_8, A_9, and A_10 from the ticket:
 * - A_8: Modal window opens when clicking on a date
 * - A_9: Shows meetings and notes for the date, with editing capabilities
 * - A_10: Allows navigation to meeting detail pages
 *
 * The modal serves as a comprehensive day view, allowing users to see all their
 * scheduled events and manage their personal notes for any given date.
 */

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string | null; // ISO date string (YYYY-MM-DD)
  dayDetails: DayDetails | null;
  isOwnCalendar: boolean; // Whether this is the current user's calendar
  onDataChange?: () => void; // Callback to refresh calendar data after changes
}

export default function DayDetailsModal({
  isOpen,
  onClose,
  selectedDate,
  dayDetails,
  isOwnCalendar,
  onDataChange,
}: DayDetailsModalProps) {
  // State for note editing functionality
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // API hooks for note management
  const { savePersonalNote, deletePersonalNote, isLoading, error, clearError } = useCalendar();

  // Initialize note content when day details change
  useEffect(() => {
    if (dayDetails?.noteForDay) {
      setNoteContent(dayDetails.noteForDay.content);
    } else {
      setNoteContent('');
    }
    setIsEditingNote(false);
    setHasUnsavedChanges(false);
    clearError();
  }, [dayDetails, clearError]);

  // Handle note content changes
  const handleNoteContentChange = (newContent: string) => {
    setNoteContent(newContent);
    const originalContent = dayDetails?.noteForDay?.content || '';
    setHasUnsavedChanges(newContent !== originalContent);
  };

  // Save note (create new or update existing)
  const handleSaveNote = async () => {
    if (!selectedDate || !noteContent.trim()) {
      toast.error('Notizinhalt darf nicht leer sein.');
      return;
    }

    try {
      const noteRequest: PersonalNoteRequest = {
        noteDate: selectedDate,
        content: noteContent.trim(),
      };

      await savePersonalNote(noteRequest);
      toast.success('Notiz erfolgreich gespeichert.');
      setIsEditingNote(false);
      setHasUnsavedChanges(false);
      onDataChange?.(); // Refresh calendar data
    } catch {
      toast.error('Fehler beim Speichern der Notiz.');
    }
  };

  // Delete existing note
  const handleDeleteNote = async () => {
    if (!selectedDate || !dayDetails?.noteForDay) {
      return;
    }

    if (!window.confirm('Möchten Sie diese Notiz wirklich löschen?')) {
      return;
    }

    try {
      await deletePersonalNote(selectedDate);
      toast.success('Notiz erfolgreich gelöscht.');
      setNoteContent('');
      setIsEditingNote(false);
      setHasUnsavedChanges(false);
      onDataChange?.(); // Refresh calendar data
    } catch {
      toast.error('Fehler beim Löschen der Notiz.');
    }
  };

  // Cancel note editing
  const handleCancelEdit = () => {
    const originalContent = dayDetails?.noteForDay?.content || '';
    setNoteContent(originalContent);
    setIsEditingNote(false);
    setHasUnsavedChanges(false);
    clearError();
  };

  // Format date for display
  const formatDisplayDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, dd. MMMM yyyy', { locale: de });
    } catch {
      return dateString;
    }
  };

  // Format event time for display
  const formatEventTime = (dateTimeString: string): string => {
    try {
      const dateTime = new Date(dateTimeString);
      return format(dateTime, 'HH:mm', { locale: de });
    } catch {
      return 'Zeit unbekannt';
    }
  };

  // Get format badge color based on meeting format
  const getFormatBadgeVariant = (format: string) => {
    switch (format) {
      case 'ONLINE':
        return 'default';
      case 'OFFLINE':
        return 'secondary';
      case 'HYBRID':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (!selectedDate) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {formatDisplayDate(selectedDate)}
          </DialogTitle>
          <DialogDescription>
            {isOwnCalendar
              ? 'Termine und Notizen für diesen Tag anzeigen und bearbeiten'
              : 'Termine und Notizen für diesen Tag anzeigen'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meetings/Events Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Termine ({dayDetails?.eventsForDay?.length || 0})
            </h3>

            {dayDetails?.eventsForDay && dayDetails.eventsForDay.length > 0 ? (
              <div className="space-y-3">
                {dayDetails.eventsForDay.map((event: CalendarEvent) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getFormatBadgeVariant(event.format)}>{event.format}</Badge>
                        {event.isOrganizer && <Badge variant="destructive">Organisator</Badge>}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {formatEventTime(event.dateTime)}
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {event.participantCount} Teilnehmer
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex justify-end mt-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/groups/${event.id}`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Details ansehen
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Keine Termine für diesen Tag.</p>
            )}
          </div>

          {/* Personal Note Section - Only show for own calendar */}
          {isOwnCalendar && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Persönliche Notiz
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">
                    {error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten.'}
                  </span>
                </div>
              )}

              {isEditingNote ? (
                // Note editing mode
                <div className="space-y-3">
                  <Textarea
                    value={noteContent}
                    onChange={(e) => handleNoteContentChange(e.target.value)}
                    placeholder="Ihre persönliche Notiz für diesen Tag..."
                    className="min-h-[100px]"
                    maxLength={1000}
                    disabled={isLoading}
                  />

                  <div className="text-xs text-muted-foreground text-right">
                    {noteContent.length}/1000 Zeichen
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveNote}
                      disabled={isLoading || !noteContent.trim() || !hasUnsavedChanges}
                      size="sm"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3 mr-1" />
                      )}
                      Speichern
                    </Button>

                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      disabled={isLoading}
                      size="sm"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Abbrechen
                    </Button>
                  </div>
                </div>
              ) : (
                // Note display mode
                <div>
                  {dayDetails?.noteForDay ? (
                    <div className="space-y-3">
                      <div className="bg-accent/50 rounded-lg p-3">
                        <p className="text-sm whitespace-pre-wrap">
                          {dayDetails.noteForDay.content}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => setIsEditingNote(true)} variant="outline" size="sm">
                          <Edit3 className="h-3 w-3 mr-1" />
                          Bearbeiten
                        </Button>

                        <Button
                          onClick={handleDeleteNote}
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3 mr-1" />
                          )}
                          Löschen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground text-sm mb-3">
                        Keine Notiz für diesen Tag vorhanden.
                      </p>
                      <Button onClick={() => setIsEditingNote(true)} variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Notiz hinzufügen
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Personal Note Section - Read-only for other users' calendars */}
          {!isOwnCalendar && dayDetails?.noteForDay && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Persönliche Notiz
              </h3>

              <div className="bg-accent/50 rounded-lg p-3">
                <p className="text-sm whitespace-pre-wrap">{dayDetails.noteForDay.content}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
