import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Search as SearchIcon } from 'lucide-react';
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
import { useBlockGroupParticipant } from '@/hooks/groups/useBlockGroupParticipant';
import { useRemoveGroupParticipant } from '@/hooks/groups/useRemoveGroupParticipant';

const DEFAULT_PARTICIPANTS_PAGE_SIZE = 15;

const GroupParticipantsListPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const { currentUser } = useAuth();

  const {
    data: groupParticipantsData,
    isLoading,
    isFetching,
    isError,
  } = useGroupParticipants(groupId, currentPage, DEFAULT_PARTICIPANTS_PAGE_SIZE, activeSearchTerm);

  const participants = useMemo(
    () => groupParticipantsData?.participantsPage.content ?? [],
    [groupParticipantsData]
  );
  const pageInfo = useMemo(() => groupParticipantsData?.participantsPage, [groupParticipantsData]);
  const isCurrentUserOrganizer = useMemo(
    () => groupParticipantsData?.isCurrentUserOrganizer ?? false,
    [groupParticipantsData]
  );
  const groupName = useMemo(() => groupParticipantsData?.groupName, [groupParticipantsData]);
  const handleSearch = useCallback(() => {
    setCurrentPage(0);
    setActiveSearchTerm(searchTerm);
  }, [searchTerm]);

  const [actionTarget, setActionTarget] = useState<{
    userId: number | null;
    type: 'block' | 'remove' | null;
  }>({ userId: null, type: null });

  const { mutate: blockParticipantMutate, isPending: isBlocking } = useBlockGroupParticipant(() =>
    setActionTarget({ userId: null, type: null })
  );
  const { mutate: removeParticipantMutate, isPending: isRemoving } = useRemoveGroupParticipant(() =>
    setActionTarget({ userId: null, type: null })
  );

  const handlePageChange = (newPage: number) => {
    if (pageInfo && newPage >= 0 && newPage < pageInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleBlockParticipant = (userId: number) => {
    if (!groupId || (isBlocking && actionTarget.userId === userId && actionTarget.type === 'block'))
      return;
    setActionTarget({ userId, type: 'block' });
    blockParticipantMutate({ groupId, userId });
  };

  const handleRemoveParticipant = (userId: number) => {
    if (
      !groupId ||
      (isRemoving && actionTarget.userId === userId && actionTarget.type === 'remove')
    )
      return;
    setActionTarget({ userId, type: 'remove' });
    removeParticipantMutate({ groupId, userId });
  };

  if (isLoading) {
    /* ... */
  }
  if (isError) {
    /* ... */
  }
  if (!groupParticipantsData && !isLoading && !isError) {
    /* ... */
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
        {pageInfo && pageInfo.totalElements > 0 && ` (${pageInfo.totalElements})`}
      </h1>
      <div className="my-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Teilnehmer suchen (Name, Benutzername...)"
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
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
        {participants.length > 0 ? (
          participants.map((participant: GroupParticipant) => (
            <ParticipantListItem
              key={participant.id}
              participant={participant}
              isCurrentUserOrganizer={isCurrentUserOrganizer}
              currentUserId={currentUser?.id || null}
              onBlockParticipant={handleBlockParticipant}
              onRemoveParticipant={handleRemoveParticipant}
              isActionInProgress={
                (isBlocking &&
                  actionTarget.type === 'block' &&
                  actionTarget.userId === participant.id) ||
                (isRemoving &&
                  actionTarget.type === 'remove' &&
                  actionTarget.userId === participant.id)
              }
              actionTypeInProgress={
                actionTarget.userId === participant.id ? actionTarget.type : null
              }
            />
          ))
        ) : !isFetching ? (
          <p className="text-muted-foreground text-center p-10">
            Diese Gruppe hat (noch) keine Teilnehmer.
          </p>
        ) : null}
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
