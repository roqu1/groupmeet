import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGroupDetails } from '@/hooks/groups/useGroupDetails';
import { useJoinGroup } from '@/hooks/groups/useJoinGroup';
import { useLeaveGroup } from '@/hooks/groups/useLeaveGroup';
import {
  Loader2,
  AlertCircle,
  Plus,
  Users,
  MapPin,
  CalendarDays,
  ArrowLeft,
  Globe,
  Trash2,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { MeetingParticipantPreview } from '@/types/group';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeleteMeeting } from '@/hooks/groups/useDeleteMeeting';
import { LOCATION_OPTIONS } from '@/config/options';
import { getFullAvatarUrl } from '@/utils/imageUrl';

const GroupDetailsPage = () => {
  const { groupId } = useParams<{ groupId: string }>();

  const { data: group, isLoading, isFetching, isError, error } = useGroupDetails(groupId);
  const { mutate: deleteMeetingMutate, isPending: isDeletingGroupHook } = useDeleteMeeting();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { mutate: joinGroupMutate, isPending: isJoiningGroup } = useJoinGroup();
  const { mutate: leaveGroupMutate, isPending: isLeavingGroup } = useLeaveGroup();

  const organizer = useMemo(() => group?.organizer, [group]);
  const participantsPreview = useMemo(() => group?.participantsPreview ?? [], [group]);
  const totalParticipants = useMemo(() => group?.totalParticipants ?? 0, [group]);
  const meetingTypeNames = useMemo(() => group?.meetingTypeNames ?? [], [group]);

  const handleJoinGroup = () => {
    if (!groupId || isJoiningGroup || isFetching) return;
    joinGroupMutate(groupId);
  };

  const handleLeaveGroup = () => {
    if (!groupId || isLeavingGroup || isFetching) return;
    leaveGroupMutate(groupId, {
      onSuccess: () => {},
    });
  };

  const handleDeleteConfirmed = () => {
    if (!groupId || isDeletingGroupHook || isFetching) return;
    deleteMeetingMutate(groupId, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
      onError: () => {
        setIsDeleteDialogOpen(false);
      },
    });
  };

  const MAX_DISPLAY_SLOTS_IN_PREVIEW = 5;

  const isCurrentUserMember = group?.currentUserMembership === 'MEMBER';
  const isCurrentUserOrganizer = group?.currentUserOrganizer === true;

  const showJoinButton =
    group?.currentUserMembership === 'NOT_MEMBER' &&
    (!group.maxParticipants || group.totalParticipants < group.maxParticipants);

  const showLeaveButton = isCurrentUserMember && !isCurrentUserOrganizer;
  const showDeleteButton = isCurrentUserOrganizer;

  const numberOfParticipantsToDisplay = showJoinButton
    ? MAX_DISPLAY_SLOTS_IN_PREVIEW - 1
    : MAX_DISPLAY_SLOTS_IN_PREVIEW;

  const displayedParticipants = useMemo(() => {
    return participantsPreview.slice(0, numberOfParticipantsToDisplay);
  }, [participantsPreview, numberOfParticipantsToDisplay]);

  const getInitials = (firstName?: string, lastName?: string) =>
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'N/A';

  const getLocationLabel = (locationValue: string | undefined): string => {
    if (!locationValue) return '';
    const locationOption = LOCATION_OPTIONS.find((option) => option.value === locationValue);
    return locationOption ? locationOption.label : locationValue;
  };

  if (isLoading && !group) {
    return (
      <div className="container-wrapper py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  if (isError && !group) {
    return (
      <div className="container-wrapper py-8">
        <div className="p-6 border border-destructive/50 bg-destructive/10 text-destructive rounded-lg flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8" />
          <p className="font-medium">Fehler beim Laden der Meeting-Details</p>
          <p className="text-sm">{error?.message || 'Ein unbekannter Fehler ist aufgetreten.'}</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to={`/`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zur Homepage
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  if (!group) {
    return (
      <div className="container-wrapper py-8 text-center text-muted-foreground min-h-[calc(100vh-10rem)] flex items-center justify-center">
        Meeting-Daten nicht verfügbar oder Meeting nicht gefunden.
      </div>
    );
  }

  return (
    <div className="container-wrapper py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6 lg:mb-8">{group.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="p-4 sm:p-6 border rounded-lg bg-card shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                {group.maxParticipants && (
                  <Badge variant="outline" className="text-sm">
                    <Users className="mr-1.5 h-3.5 w-3.5" />
                    {group.participantCount} / {group.maxParticipants}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {showLeaveButton && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLeaveGroup}
                    disabled={isLeavingGroup || isFetching}
                  >
                    {isLeavingGroup ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Meeting verlassen
                  </Button>
                )}
                {isCurrentUserOrganizer && (
                  <>
                    {/* <Button variant="outline" size="sm" disabled={isFetching  || isEditing }> */}
                    {/* Meeting bearbeiten (TODO)
                    </Button> */}
                    {showDeleteButton && (
                      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeletingGroupHook || isFetching}
                            className="ml-2"
                            onClick={() => setIsDeleteDialogOpen(true)}
                          >
                            {isDeletingGroupHook ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Meeting löschen
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Möchten Sie das Meeting "{group.title}" wirklich löschen? Diese Aktion
                              kann nicht rückgängig gemacht werden. Alle Teilnehmerdaten für dieses
                              Meeting gehen verloren.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setIsDeleteDialogOpen(false)}
                              disabled={isDeletingGroupHook}
                            >
                              Abbrechen
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteConfirmed}
                              disabled={isDeletingGroupHook}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeletingGroupHook ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </>
                )}
              </div>
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap">{group.description}</p>
          </div>

          <div className="p-4 sm:p-6 border rounded-lg bg-card shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Teilnehmer ({totalParticipants})</h2>
              {totalParticipants > displayedParticipants.length && (
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
              {organizer && (
                <Link
                  to={`/profile/${organizer.id}`}
                  key={`organizer-${organizer.id}`}
                  className={cn(
                    'flex flex-col items-center p-3 rounded-lg border bg-background hover:shadow-lg transition-all duration-200 ease-in-out w-24 sm:w-28 text-center no-underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    'min-h-[150px] sm:min-h-[160px]',
                    'border-2 border-primary shadow-xl'
                  )}
                  title={`Profil von ${organizer.firstName} ${organizer.lastName} ansehen (Veranstalter)`}
                >
                  <Avatar className="h-12 w-12 sm:h-14 sm:w-14 mb-2">
                    <AvatarImage
                      src={getFullAvatarUrl(organizer.avatarUrl)}
                      alt={`${organizer.firstName} ${organizer.lastName}`}
                    />
                    <AvatarFallback className="text-lg">
                      {getInitials(organizer.firstName, organizer.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col justify-end flex-grow w-full">
                    <div className="h-[2.5em] flex items-center justify-center mb-0.5">
                      <span className="text-sm font-medium text-card-foreground leading-tight line-clamp-2">
                        {organizer.firstName} {organizer.lastName}
                      </span>
                    </div>
                    <span className="text-xs text-primary font-semibold">Veranstalter</span>
                  </div>
                </Link>
              )}
              {displayedParticipants.map((participant: MeetingParticipantPreview) => (
                <Link
                  to={`/profile/${participant.id}`}
                  key={participant.id}
                  className={cn(
                    'flex flex-col items-center p-3 rounded-lg border bg-background hover:shadow-lg transition-all duration-200 ease-in-out w-24 sm:w-28 text-center no-underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    'min-h-[150px] sm:min-h-[160px]'
                  )}
                  title={`Profil von ${participant.firstName} ${participant.lastName} ansehen`}
                >
                  <Avatar className="h-12 w-12 sm:h-14 sm:w-14 mb-2">
                    <AvatarImage
                      src={getFullAvatarUrl(participant.avatarUrl)}
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
                    <span className="text-xs h-[1em]"></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-[calc(theme(space.14)+1rem)] p-4 sm:p-6 border rounded-lg bg-card shadow-sm space-y-4">
            <h2 className="text-xl font-semibold border-b pb-3 mb-4">Details</h2>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Meeting-Titel
              </p>
              <p className="text-lg font-medium">{group.title}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center">
                <CalendarDays className="h-3.5 w-3.5 mr-1" /> Zeit
              </p>
              <p>
                {format(new Date(group.dateTime), 'EEEE, dd. MMMM yyyy', { locale: de })}
                <br />
                {format(new Date(group.dateTime), "HH:mm 'Uhr'", { locale: de })}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center">
                {group.format === 'ONLINE' ? (
                  <Globe className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                )}{' '}
                Format & Ort
              </p>
              <p className="font-medium">
                {group.format === 'ONLINE'
                  ? 'Online'
                  : getLocationLabel(group.location || 'Nicht spezifiziert')}
              </p>
            </div>
            {organizer && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1" /> Veranstalter
                </p>
                <Link
                  to={`/profile/${organizer.id}`}
                  className="flex items-center gap-2 mt-1 p-2 border rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 no-underline"
                  title={`Profil von ${organizer.firstName} ${organizer.lastName} ansehen`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={getFullAvatarUrl(organizer.avatarUrl)}
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
            {meetingTypeNames.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Interessen
                </p>
                <div className="flex flex-wrap gap-2">
                  {meetingTypeNames.map((tag) => (
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
