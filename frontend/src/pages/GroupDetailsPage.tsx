import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGroupDetails } from '@/hooks/groups/useGroupDetails';
import { useJoinGroup } from '@/hooks/groups/useJoinGroup';
import { useLeaveGroup } from '@/hooks/groups/useLeaveGroup';
import { Loader2, AlertCircle, Plus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { GroupParticipant as GroupParticipantType } from '@/types/group';
import { cn } from '@/lib/utils';

const GroupDetailsPage = () => {
  const { groupId } = useParams<{ groupId: string }>();

  const { data: group, isLoading, isFetching, isError, error } = useGroupDetails(groupId);

  const { mutate: joinGroupMutate, isPending: isJoiningGroup } = useJoinGroup();
  const { mutate: leaveGroupMutate, isPending: isLeavingGroup } = useLeaveGroup();

  const organizer = useMemo(() => group?.organizer, [group]);
  const allParticipantsPreview = useMemo(() => group?.participantsPreview ?? [], [group]);
  const tags = useMemo(() => group?.tags ?? [], [group]);

  const handleJoinGroup = () => {
    if (!groupId || isJoiningGroup || isFetching) return;
    console.log(`[UI] Attempting to join group ID: ${groupId}`);
    joinGroupMutate(groupId);
  };

  const handleLeaveGroup = () => {
    if (!groupId || isLeavingGroup || isFetching) return;
    console.log(`[UI] Attempting to leave group ID: ${groupId}`);
    leaveGroupMutate(groupId);
  };

  const MAX_DISPLAY_SLOTS_IN_PREVIEW = 6;
  const showJoinButton = group?.currentUserMembership === 'NOT_MEMBER';

  const numberOfParticipantsToDisplay = showJoinButton
    ? MAX_DISPLAY_SLOTS_IN_PREVIEW - 1
    : MAX_DISPLAY_SLOTS_IN_PREVIEW;

  const displayedParticipants = useMemo(() => {
    return allParticipantsPreview.slice(0, numberOfParticipantsToDisplay);
  }, [allParticipantsPreview, numberOfParticipantsToDisplay]);

  const getInitials = (firstName?: string, lastName?: string) =>
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'N/A';

  if (isLoading) {
    return (
      <div className="container-wrapper py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="container-wrapper py-8">
        <div className="p-6 border border-destructive/50 bg-destructive/10 text-destructive rounded-lg flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8" />
          <p className="font-medium">Fehler beim Laden der Gruppendetails</p>
          <p className="text-sm">
            {error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.'}
          </p>
        </div>
      </div>
    );
  }
  if (!group) {
    return (
      <div className="container-wrapper py-8 text-center text-muted-foreground min-h-[calc(100vh-10rem)] flex items-center justify-center">
        Gruppendaten nicht verfügbar oder Gruppe nicht gefunden.
      </div>
    );
  }

  return (
    <div className="container-wrapper py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6 lg:mb-8">{group.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="p-4 sm:p-6 border rounded-lg bg-card shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div />
              {group.currentUserMembership === 'MEMBER' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLeaveGroup}
                  disabled={isLeavingGroup || isFetching}
                >
                  {isLeavingGroup ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Gruppe verlassen
                </Button>
              )}
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap">{group.description}</p>
          </div>

          <div className="p-4 sm:p-6 border rounded-lg bg-card shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Teilnehmer ({group.totalParticipants})</h2>
              {group.totalParticipants > displayedParticipants.length && (
                <Button asChild variant="link" size="sm" className="p-0 h-auto text-sm">
                  <Link to={`/groups/${groupId}/participants`}>Alles ansehen</Link>
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4 items-stretch">
              {showJoinButton && (
                <Button
                  variant="outline"
                  className={cn(
                    'flex flex-col items-center justify-center p-2 border-dashed text-center cursor-pointer hover:bg-accent group disabled:opacity-70 disabled:cursor-not-allowed',
                    'w-24 sm:w-28',
                    'min-h-[150px] sm:min-h-[160px]'
                  )}
                  onClick={handleJoinGroup}
                  disabled={isJoiningGroup || isFetching}
                >
                  {isJoiningGroup ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <Plus className="h-6 w-6 text-muted-foreground group-hover:text-accent-foreground mb-1" />
                  )}
                  <span className="text-xs text-muted-foreground group-hover:text-accent-foreground mt-1">
                    {isJoiningGroup ? 'Beitreten...' : 'Teilnehmen?'}
                  </span>
                </Button>
              )}
              {displayedParticipants.map((participant: GroupParticipantType) => (
                <Link
                  to={`/profile/${participant.id}`}
                  key={participant.id}
                  className={cn(
                    'flex flex-col items-center p-3 rounded-lg border bg-background hover:shadow-lg transition-all duration-200 ease-in-out w-24 sm:w-28 text-center no-underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    'min-h-[150px] sm:min-h-[160px]',
                    participant.isOrganizer && 'border-2 border-primary shadow-xl'
                  )}
                  title={`Profil von ${participant.firstName} ${participant.lastName} ansehen`}
                >
                  <Avatar className="h-12 w-12 sm:h-14 sm:w-14 mb-2">
                    <AvatarImage
                      src={participant.avatarUrl ?? undefined}
                      alt={`${participant.firstName} ${participant.lastName}`}
                    />
                    <AvatarFallback className="text-lg">
                      {getInitials(participant.firstName, participant.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col justify-end flex-grow w-full">
                    <div className="h-[2.5em] flex items-center justify-center mb-0.5">
                      <span className="text-sm font-medium text-card-foreground leading-tight line-clamp-2">
                        {participant.firstName} {participant.lastName}
                      </span>
                    </div>
                    {participant.isOrganizer ? (
                      <span className="text-xs text-primary font-semibold">Veranstalter</span>
                    ) : (
                      <span className="text-xs h-[1em]"></span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-[calc(theme(space.14)+1rem)] p-4 sm:p-6 border rounded-lg bg-card shadow-sm space-y-4">
            <h2 className="text-xl font-semibold border-b pb-3 mb-4">Detail</h2>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Gruppenname
              </p>
              <p className="text-lg font-medium">{group.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Zeit
              </p>
              <p>
                {new Date(group.dateTime).toLocaleDateString('de-DE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                <br />
                {new Date(group.dateTime).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                Uhr
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ort
              </p>
              <p className="font-medium">{group.location}</p>
              <p className="text-sm text-muted-foreground">{group.address}</p>
            </div>
            {organizer && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Veranstalter
                </p>
                <Link
                  to={`/profile/${organizer.id}`}
                  className="flex items-center gap-2 mt-1 p-2 border rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 no-underline"
                  title={`Profil von ${organizer.firstName} ${organizer.lastName} ansehen`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={organizer.avatarUrl ?? undefined}
                      alt={`${organizer.firstName} ${organizer.lastName}`}
                    />
                    <AvatarFallback>
                      {getInitials(organizer.firstName, organizer.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-card-foreground">
                    {organizer.firstName} {organizer.lastName}
                  </span>
                </Link>
              </div>
            )}
            {tags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsPage;
