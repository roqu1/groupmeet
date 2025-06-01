import React from 'react';
import { Link } from 'react-router-dom';
import { GroupParticipant, Gender } from '@/types/group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  UserX,
  Loader2,
  Mars,
  Venus,
  VenusAndMars,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getFullAvatarUrl } from '@/utils/imageUrl';

interface ParticipantListItemProps {
  participant: GroupParticipant;
  isCurrentUserOrganizer: boolean;
  currentUserId: number | null;
  meetingId: string;
  onBlockParticipant: (meetingId: string, userId: number) => void;
  onUnblockParticipant: (meetingId: string, userId: number) => void;
  onRemoveParticipant: (meetingId: string, userId: number) => void;
  isCurrentParticipantActionLoading: boolean;
  actionTypeInProgressForCurrentParticipant: 'block' | 'unblock' | 'remove' | null;
}

const ParticipantListItem: React.FC<ParticipantListItemProps> = ({
  participant,
  isCurrentUserOrganizer,
  currentUserId,
  meetingId,
  onBlockParticipant,
  onUnblockParticipant,
  onRemoveParticipant,
  isCurrentParticipantActionLoading,
  actionTypeInProgressForCurrentParticipant,
}) => {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'N/A';
  };

  const showAdminActions =
    isCurrentUserOrganizer && participant.id !== currentUserId && !participant.isOrganizer;

  const GenderIconDisplay: React.FC<{ gender: Gender | undefined }> = ({ gender }) => {
    if (gender === 'MALE') {
      return (
        <Mars className="ml-1 h-3.5 w-3.5 flex-shrink-0 text-blue-600" aria-label="Männlich" />
      );
    } else if (gender === 'FEMALE') {
      return (
        <Venus className="ml-1 h-3.5 w-3.5 flex-shrink-0 text-pink-600" aria-label="Weiblich" />
      );
    } else if (gender === 'DIVERS') {
      return (
        <VenusAndMars
          className="ml-1 h-3.5 w-3.5 flex-shrink-0 text-purple-600"
          aria-label="Divers"
        />
      );
    }
    return null;
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-card border-b last:border-b-0 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <Avatar className="h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0">
          <AvatarImage
            src={getFullAvatarUrl(participant.avatarUrl)}
            alt={`${participant.firstName} ${participant.lastName}`}
          />
          <AvatarFallback>
            {getInitials(participant.firstName, participant.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <div className="flex items-center">
            <Link
              to={`/profile/${participant.id}`}
              className="font-semibold text-sm sm:text-base text-card-foreground hover:underline focus:underline focus:outline-none rounded-sm"
              title={`Profil von ${participant.firstName} ${participant.lastName} ansehen`}
            >
              {participant.firstName} {participant.lastName}
            </Link>
            <GenderIconDisplay gender={participant.gender} />
          </div>
          <p
            className="text-xs sm:text-sm text-muted-foreground truncate"
            title={`@${participant.username}`}
          >
            @{participant.username}
          </p>
          {participant.isOrganizer && (
            <span className="text-xs text-primary font-semibold block sm:inline sm:ml-2">
              (Veranstalter)
            </span>
          )}
          {participant.participationStatus === 'BLOCKED' && (
            <span className="text-xs text-red-500 font-semibold block sm:inline sm:ml-2">
              (Gesperrt)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <Button asChild variant="outline" size="sm" className="px-3 h-8 text-xs sm:text-sm">
          <Link to={`/profile/${participant.id}`}>Anschauen</Link>
        </Button>

        {showAdminActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={isCurrentParticipantActionLoading}
              >
                {isCurrentParticipantActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
                <span className="sr-only">Optionen</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {participant.participationStatus === 'BLOCKED' ? (
                <DropdownMenuItem
                  onClick={() => onUnblockParticipant(meetingId, participant.id)}
                  disabled={
                    isCurrentParticipantActionLoading &&
                    actionTypeInProgressForCurrentParticipant === 'unblock'
                  }
                  className="text-green-600 hover:!text-green-600 focus:!text-green-600 hover:!bg-green-50 focus:!bg-green-50"
                >
                  {isCurrentParticipantActionLoading &&
                  actionTypeInProgressForCurrentParticipant === 'unblock' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Sperrung aufheben
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() => onBlockParticipant(meetingId, participant.id)}
                    disabled={
                      isCurrentParticipantActionLoading &&
                      actionTypeInProgressForCurrentParticipant === 'block'
                    }
                    className="text-orange-600 hover:!text-orange-600 focus:!text-orange-600 hover:!bg-orange-50 focus:!bg-orange-50"
                  >
                    {isCurrentParticipantActionLoading &&
                    actionTypeInProgressForCurrentParticipant === 'block' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldAlert className="mr-2 h-4 w-4" />
                    )}
                    Benutzer sperren
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onRemoveParticipant(meetingId, participant.id)}
                    disabled={
                      isCurrentParticipantActionLoading &&
                      actionTypeInProgressForCurrentParticipant === 'remove'
                    }
                    className="text-red-600 hover:!text-red-600 focus:!text-red-600 hover:!bg-red-50 focus:!bg-red-50"
                  >
                    {isCurrentParticipantActionLoading &&
                    actionTypeInProgressForCurrentParticipant === 'remove' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserX className="mr-2 h-4 w-4" />
                    )}
                    Teilnehmer entfernen
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default ParticipantListItem;
