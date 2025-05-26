import React from 'react';
import { Link } from 'react-router-dom';
import { MeetingCardData } from '@/types/meeting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Users, MapPin, Globe, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { LOCATION_OPTIONS } from '@/config/options';

interface MeetingCardProps {
  meeting: MeetingCardData;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting }) => {
  const formattedDateTime = meeting.dateTime
    ? format(new Date(meeting.dateTime), "dd.MM.yyyy 'um' HH:mm 'Uhr'", { locale: de })
    : 'Datum nicht verfügbar';

  const getLocationLabel = (locationValue: string | undefined): string => {
    if (!locationValue) return '';
    const locationOption = LOCATION_OPTIONS.find((option) => option.value === locationValue);
    return locationOption ? locationOption.label : locationValue;
  };

  return (
    <div className="flex flex-col justify-between rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow h-full">
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <div className="mb-3">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary">{meeting.meetingTypeName}</Badge>
            <Badge
              variant={meeting.format === 'ONLINE' ? 'outline' : 'default'}
              className={
                meeting.format === 'ONLINE'
                  ? 'border-sky-500 text-sky-600'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }
            >
              {meeting.format === 'ONLINE' ? (
                <Globe className="mr-1.5 h-3 w-3" />
              ) : (
                <MapPin className="mr-1.5 h-3 w-3" />
              )}
              {meeting.format === 'ONLINE' ? 'Online' : 'Vor Ort'}
            </Badge>
            {meeting.format === 'OFFLINE' && meeting.location && (
              <Badge variant="outline" className="truncate max-w-xs">
                <MapPin className="mr-1.5 h-3 w-3 text-muted-foreground" />
                {getLocationLabel(meeting.location)}
              </Badge>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight hover:text-primary transition-colors line-clamp-2">
            <Link
              to={`/groups/${meeting.id}`}
              className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              onClick={(e) => e.preventDefault()}
            >
              {meeting.title}
            </Link>
          </h3>
          {meeting.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{meeting.description}</p>
          )}
        </div>
        <div className="mt-2 text-xs text-muted-foreground flex items-center">
          <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
          {formattedDateTime}
        </div>

        <div className="mt-auto pt-4 border-t border-border/60 flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center">
            <Users className="mr-1.5 h-4 w-4" />
            <span>
              {meeting.participantCount}
              {meeting.maxParticipants ? `/${meeting.maxParticipants}` : ' Teilnehmer'}
            </span>
          </div>
          <Button
            size="sm"
            className="px-3 py-1.5 h-auto"
            asChild
            onClick={(e) => e.preventDefault()}
          >
            <Link to={`/groups/${meeting.id}`}>Anschauen</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
