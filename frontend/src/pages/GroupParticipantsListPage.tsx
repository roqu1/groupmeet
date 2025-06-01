import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Search as SearchIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGroupParticipants } from '@/hooks/groups/useGroupParticipants';
import ParticipantListItem from '@/components/groups/ParticipantListItem';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { GroupParticipant } from '@/types/group';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBlockMeetingParticipant } from '@/hooks/groups/useBlockMeetingParticipant';
import { useUnblockMeetingParticipant } from '@/hooks/groups/useUnblockMeetingParticipant';
import { useRemoveGroupParticipant } from '@/hooks/groups/useRemoveGroupParticipant';
import { useDebounce } from '@/hooks/useDebounce';

const DEFAULT_PARTICIPANTS_PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_DELAY = 500;

const GroupParticipantsListPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [currentPage, setCurrentPage] = useState(0);
  const [uiSearchTerm, setUiSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(uiSearchTerm, SEARCH_DEBOUNCE_DELAY);

  const { currentUser } = useAuth();

  const {
    data: groupParticipantsData,
    isLoading,
    isFetching,
    isError,
    error: fetchError,
  } = useGroupParticipants(
    groupId,
    currentPage,
    DEFAULT_PARTICIPANTS_PAGE_SIZE,
    debouncedSearchTerm
  );

  const participants = useMemo(
    () => groupParticipantsData?.participantsPage?.content ?? [],
    [groupParticipantsData]
  );
  const pageInfo = useMemo(() => groupParticipantsData?.participantsPage, [groupParticipantsData]);
  const isCurrentUserOrganizer = useMemo(
    () => groupParticipantsData?.isCurrentUserOrganizer ?? false,
    [groupParticipantsData]
  );
  const groupName = useMemo(() => groupParticipantsData?.groupName, [groupParticipantsData]);

  const [actionTarget, setActionTarget] = useState<{
    userId: number | null;
    type: 'block' | 'unblock' | 'remove' | null;
  }>({ userId: null, type: null });

  const commonMutationSettledCallback = useCallback(() => {
    setActionTarget({ userId: null, type: null });
  }, []);

  const { mutate: blockParticipantMutate, isPending: isBlocking } = useBlockMeetingParticipant(
    commonMutationSettledCallback
  );
  const { mutate: unblockParticipantMutate, isPending: isUnblocking } =
    useUnblockMeetingParticipant(commonMutationSettledCallback);
  const { mutate: removeParticipantMutate, isPending: isRemoving } = useRemoveGroupParticipant(
    commonMutationSettledCallback
  );

  const handlePageChange = (newPage: number) => {
    if (pageInfo && newPage >= 0 && newPage < pageInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleBlockParticipant = (meetingId: string, userId: number) => {
    if (
      !meetingId ||
      (isBlocking && actionTarget.userId === userId && actionTarget.type === 'block')
    )
      return;
    setActionTarget({ userId, type: 'block' });
    blockParticipantMutate({ meetingId, userId });
  };

  const handleUnblockParticipant = (meetingId: string, userId: number) => {
    if (
      !meetingId ||
      (isUnblocking && actionTarget.userId === userId && actionTarget.type === 'unblock')
    )
      return;
    setActionTarget({ userId, type: 'unblock' });
    unblockParticipantMutate({ meetingId, userId });
  };

  const handleRemoveParticipant = (meetingId: string, userId: number) => {
    if (
      !meetingId ||
      (isRemoving && actionTarget.userId === userId && actionTarget.type === 'remove')
    )
      return;
    setActionTarget({ userId, type: 'remove' });
    removeParticipantMutate({ groupId: meetingId, userId });
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUiSearchTerm(event.target.value);
    setCurrentPage(0);
  };

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
          <p className="font-medium">Fehler beim Laden der Teilnehmer</p>
          <p className="text-sm">
            {fetchError instanceof Error
              ? fetchError.message
              : 'Ein unbekannter Fehler ist aufgetreten.'}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to={`/groups/${groupId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Gruppe
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!groupParticipantsData?.participantsPage && !isLoading && !isError) {
    return (
      <div className="container-wrapper py-8 text-center text-muted-foreground min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Gruppendaten konnten nicht geladen werden.</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to={`/`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zur Homepage
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-wrapper py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link to={`/groups/${groupId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Gruppe {groupName && `"${groupName}"`}
          </Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Teilnehmer {groupName && `der Gruppe "${groupName}"`}
      </h1>
      <div className="my-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Teilnehmer suchen (Name, Benutzername...)"
            className="pl-9 w-full"
            value={uiSearchTerm}
            onChange={handleSearchInputChange}
          />
        </div>
      </div>
      {isFetching && !isLoading && (
        <div className="mb-4 p-2 text-sm text-muted-foreground flex items-center justify-center bg-card border rounded-md">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Liste wird aktualisiert...
        </div>
      )}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        {!isLoading &&
          !isError &&
          Array.isArray(participants) &&
          participants.map((participant: GroupParticipant) => {
            const isCurrentActionLoading =
              (isBlocking &&
                actionTarget.type === 'block' &&
                actionTarget.userId === participant.id) ||
              (isUnblocking &&
                actionTarget.type === 'unblock' &&
                actionTarget.userId === participant.id) ||
              (isRemoving &&
                actionTarget.type === 'remove' &&
                actionTarget.userId === participant.id);

            const currentActionType =
              actionTarget.userId === participant.id ? actionTarget.type : null;

            return (
              <ParticipantListItem
                key={participant.id}
                participant={participant}
                isCurrentUserOrganizer={isCurrentUserOrganizer}
                currentUserId={currentUser?.id || null}
                meetingId={groupId!}
                onBlockParticipant={handleBlockParticipant}
                onUnblockParticipant={handleUnblockParticipant}
                onRemoveParticipant={handleRemoveParticipant}
                isCurrentParticipantActionLoading={isCurrentActionLoading}
                actionTypeInProgressForCurrentParticipant={currentActionType}
              />
            );
          })}
        {!isLoading && !isError && (!participants || participants.length === 0) && (
          <p className="text-muted-foreground text-center p-10">
            {debouncedSearchTerm
              ? `Keine Teilnehmer für "${debouncedSearchTerm}" gefunden.`
              : 'Diese Gruppe hat (noch) keine Teilnehmer.'}
          </p>
        )}
        {(isLoading || (isFetching && participants.length === 0)) && (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
      {pageInfo && pageInfo.totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(pageInfo.number - 1)}
                disabled={pageInfo.first || isFetching}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 py-2 text-sm font-medium">
                Seite {pageInfo.number + 1} von {pageInfo.totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(pageInfo.number + 1)}
                disabled={pageInfo.last || isFetching}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
export default GroupParticipantsListPage;
