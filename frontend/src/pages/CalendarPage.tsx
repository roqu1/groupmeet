import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, ArrowLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import Calendar from '@/components/calendar/Calendar';
import CreateMeetingDialog from '@/components/meetings/CreateMeetingDialog';

export default function CalendarPage() {
  const { userId } = useParams<{ userId?: string }>();
  const [showInstructions, setShowInstructions] = useState(true);

  const [calendarRefresh, setCalendarRefresh] = useState<(() => Promise<void>) | null>(null);

  const userIdNumber = userId ? parseInt(userId, 10) : undefined;
  const isOwnCalendar = !userIdNumber;

  const handleRefreshReady = useCallback((refreshFn: () => Promise<void>) => {
    setCalendarRefresh(() => refreshFn);
  }, []);

  return (
    <div className="container-wrapper py-8">
      <div className="mb-6">
        {isOwnCalendar ? (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <CalendarDays className="h-8 w-8" />
                Mein Kalender
              </h1>
              <p className="text-muted-foreground mt-2">
                Verwalten Sie Ihre Termine und persönlichen Notizen an einem Ort.
              </p>
            </div>
            <CreateMeetingDialog onMeetingCreated={calendarRefresh || undefined} />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/profile/${userId}`}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Zurück zum Profil
                  </Link>
                </Button>
              </div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <CalendarDays className="h-8 w-8" />
                Kalender
              </h1>
              <p className="text-muted-foreground mt-2">
                Termine und Notizen von diesem Benutzer ansehen.
              </p>
            </div>
          </div>
        )}
      </div>

      {showInstructions && (
        <div className="mb-6 p-4 bg-accent/50 border rounded-lg relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInstructions(false)}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold mb-2">So verwenden Sie den Kalender:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              • <strong>Klicken Sie auf ein Datum</strong>, um Termine und Notizen für diesen Tag
              anzuzeigen
            </li>
            <li>
              • <strong>Klicken Sie auf einen Termin</strong>, um zur Detailseite des Meetings zu
              gelangen
            </li>
            {isOwnCalendar && (
              <>
                <li>
                  • <strong>Fügen Sie persönliche Notizen hinzu</strong>, indem Sie auf ein Datum
                  klicken
                </li>
                <li>
                  • <strong>Termine werden automatisch hinzugefügt</strong>, wenn Sie Meetings
                  beitreten
                </li>
              </>
            )}
            <li>
              • <strong>Navigieren Sie durch Monate</strong> mit den Pfeiltasten oder der
              Datumsauswahl
            </li>
          </ul>
        </div>
      )}

      <Calendar
        userId={userIdNumber}
        className="calendar-page-container"
        onRefreshReady={handleRefreshReady}
      />

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          {isOwnCalendar
            ? 'Ihre Kalenderdaten sind privat und nur für Sie und Ihre Freunde sichtbar.'
            : 'Sie können diesen Kalender einsehen, da Sie mit diesem Benutzer befreundet sind.'}
        </p>
      </div>
    </div>
  );
}
