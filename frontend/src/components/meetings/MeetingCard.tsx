import React from 'react';
import { Link } from 'react-router-dom';
import { MeetingCardData } from '@/types/meeting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Users, MapPin, Globe } from 'lucide-react';

interface MeetingCardProps {
  meeting: MeetingCardData;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting }) => {
  return (
    <div className="flex flex-col justify-between rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow h-full">
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <div className="mb-3">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary">{meeting.type}</Badge>
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
          </div>
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight hover:text-primary transition-colors line-clamp-2">
            <Link
              to={`/groups/${meeting.id}`}
              className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
            >
              {meeting.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
            {meeting.shortDescription}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-border/60 flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center">
            <Users className="mr-1.5 h-4 w-4" />
            <span>
              {meeting.participantCount}
              {meeting.maxParticipants ? `/${meeting.maxParticipants}` : ' Teilnehmer'}
            </span>
          </div>
          <Button size="sm" className="px-3 py-1.5 h-auto" asChild>
            <Link to={`/groups/${meeting.id}`}>Anschauen</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
