import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useUserMeetings from '@/hooks/users/useUserMeetings';
import { UserProfileMeeting, UserProfileMeetingsPage } from '@/types/meeting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  Globe,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface UserMeetingsSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

const MeetingStatusBadge: React.FC<{ status: UserProfileMeeting['status'] }> = ({ status }) => {
  let variant: 'default' | 'secondary' | 'outline' | 'destructive' = 'secondary';
  let textToDisplay = '';

  switch (status) {
    case 'UPCOMING':
      variant = 'default';
      textToDisplay = 'Bevorstehend';
      break;
    case 'ONGOING':
      variant = 'default';
      textToDisplay = 'Laufend';
      break;
    case 'COMPLETED':
      variant = 'outline';
      textToDisplay = 'Abgeschlossen';
      break;
    default:
      textToDisplay = status;
  }
  return (
    <Badge
      variant={variant}
      className={cn(
        status === 'ONGOING' && 'bg-green-600 hover:bg-green-700 text-white',
        status === 'UPCOMING' && 'bg-blue-600 hover:bg-blue-700 text-white'
      )}
    >
      {textToDisplay}
    </Badge>
  );
};

const UserMeetingsSection: React.FC<UserMeetingsSectionProps> = ({ userId, isOwnProfile }) => {
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    isError,
    error,
  } = useUserMeetings({ userId, pageSize: 3 });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const meetings = data?.pages.flatMap((page: UserProfileMeetingsPage) => page.content) ?? [];

  const handleScroll = useCallback(
    (direction: 'left' | 'right') => {
      if (scrollContainerRef.current) {
        const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
        scrollContainerRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
      }
      if (direction === 'right' && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      } else if (direction === 'left' && hasPreviousPage && !isFetchingPreviousPage) {
        fetchPreviousPage();
      }
    },
    [
      hasNextPage,
      hasPreviousPage,
      fetchNextPage,
      fetchPreviousPage,
      isFetchingNextPage,
      isFetchingPreviousPage,
    ]
  );

  if (isLoading && !data) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-sm min-h-[200px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          {isOwnProfile ? 'Meine Meetings' : 'Meetings'}
        </h2>
        <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Fehler beim Laden der Meetings: {error?.message || 'Unbekannt'}</span>
        </div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          {isOwnProfile ? 'Meine Meetings' : 'Meetings'}
        </h2>
        <p className="text-muted-foreground">
          Nimmt an keinen Meetings teil oder hat keine erstellt.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        {isOwnProfile ? 'Meine Meetings' : 'Meetings'}
      </h2>
      <div className="relative">
        {(hasPreviousPage || meetings.length > 3) && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-card hover:bg-muted opacity-80 hover:opacity-100"
            onClick={() => handleScroll('left')}
            disabled={isFetchingPreviousPage || !hasPreviousPage}
            aria-label="Vorherige Meetings"
          >
            {isFetchingPreviousPage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        )}
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent scroll-smooth"
        >
          {meetings.map((meeting: UserProfileMeeting) => (
            <Link
              to={`/groups/${meeting.id}`}
              key={meeting.id}
              className="flex-shrink-0 w-72 bg-background border rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200 ease-in-out block no-underline hover:no-underline"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground text-md line-clamp-2">
                    {meeting.title}
                  </h3>
                  <MeetingStatusBadge status={meeting.status} />
                </div>

                <div className="text-xs text-muted-foreground space-y-1 mb-2">
                  <div className="flex items-center">
                    <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                    {format(new Date(meeting.dateTime), "dd.MM.yy, HH:mm 'Uhr'", { locale: de })}
                  </div>
                  <div className="flex items-center">
                    {meeting.format === 'ONLINE' ? (
                      <Globe className="mr-1.5 h-3.5 w-3.5" />
                    ) : (
                      <MapPin className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    <span>
                      {meeting.format === 'ONLINE'
                        ? 'Online'
                        : meeting.location || 'Ort nicht spezifiziert'}
                    </span>
                  </div>
                </div>
                {meeting.meetingTypeNames && meeting.meetingTypeNames.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-border/50">
                    {meeting.meetingTypeNames.slice(0, 3).map((type: string) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {meeting.meetingTypeNames.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{meeting.meetingTypeNames.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
          {isFetchingNextPage && (
            <div className="flex-shrink-0 w-72 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        {(hasNextPage || meetings.length > 3) && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-card hover:bg-muted opacity-80 hover:opacity-100"
            onClick={() => handleScroll('right')}
            disabled={isFetchingNextPage || !hasNextPage}
            aria-label="Nächste Meetings"
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserMeetingsSection;
