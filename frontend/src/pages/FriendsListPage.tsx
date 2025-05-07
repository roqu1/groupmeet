import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFriendsList } from '../hooks/friends/useFriendsList';
import { useRemoveFriend } from '../hooks/friends/useRemoveFriend';
import { Input } from '../components/ui/input';
import { Button, buttonVariants } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
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
} from '../components/ui/alert-dialog';
import { Loader2, AlertCircle, Search, UserPlus, Eye, UserX } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import { cn } from '../lib/utils';
import { Friend } from '../types/friend';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 6;
const DEBOUNCE_DELAY = 500;

const FriendsListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);
  const [currentPage, setCurrentPage] = useState(0);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);

  const {
    data: friendsPage,
    isLoading,
    isError,
    error,
    isFetching,
  } = useFriendsList({ page: currentPage, pageSize: PAGE_SIZE, searchTerm: debouncedSearchTerm });

  const { mutate: removeFriendMutate, isPending: isRemovingFriend } = useRemoveFriend();

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const confirmRemoveFriend = () => {
    if (friendToRemove) {
      removeFriendMutate(friendToRemove.id);
      setFriendToRemove(null);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    if (!friendsPage?.last) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const renderContent = () => {
    if (isLoading && !friendsPage && !isFetching) {
      return (
        <div className="flex justify-center items-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Freunde werden geladen...</span>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="mt-6 p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded flex items-center gap-2 justify-center text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>Fehler beim Laden der Freundesliste: {error?.message || 'Unbekannter Fehler'}</span>
        </div>
      );
    }

    const friendsToDisplay = friendsPage?.content ?? [];
    const totalPages = friendsPage?.totalPages ?? 0;

    if (friendsToDisplay.length === 0 && !isFetching) {
      return (
        <div className="mt-10 text-center text-gray-500">
          {searchTerm
            ? 'Keine Freunde für deine Suche gefunden.'
            : 'Sie haben noch keine Freunde in ihrer Liste.'}
        </div>
      );
    }

    return (
      <div
        className={cn('transition-opacity duration-300', isFetching ? 'opacity-70' : 'opacity-100')}
      >
        <ul className="mt-4 space-y-3 min-h-[300px]">
          {isLoading && isFetching && friendsToDisplay.length === 0 && (
            <div className="flex justify-center items-center pt-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {friendsToDisplay.map((friend) => (
            <li
              key={friend.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-card border border-border rounded-md shadow-sm hover:bg-muted/50 transition-colors gap-3 sm:gap-2"
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage
                    src={friend.avatarUrl ?? undefined}
                    alt={`${friend.firstName} ${friend.lastName}`}
                  />
                  <AvatarFallback>
                    {friend.firstName?.[0]?.toUpperCase()}
                    {friend.lastName?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <Link
                    to={`/profile/${friend.id}`}
                    className="font-semibold text-card-foreground hover:underline focus:underline focus:outline-none"
                    title={`Profil von ${friend.firstName} ${friend.lastName} ansehen`}
                  >
                    {friend.firstName} {friend.lastName}
                  </Link>
                  <p className="text-sm text-muted-foreground">@{friend.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 self-end sm:self-center flex-shrink-0">
                <Link to={`/profile/${friend.id}`} title="Profil ansehen">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                      title="Freund entfernen"
                      onClick={() => setFriendToRemove(friend)}
                      disabled={isRemovingFriend}
                    >
                      {isRemovingFriend && friendToRemove?.id === friend.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <UserX className="h-5 w-5" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sind Sie absolut sicher?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Möchten Sie{' '}
                        <span className="font-medium">
                          {friendToRemove?.firstName} {friendToRemove?.lastName}
                        </span>{' '}
                        (@{friendToRemove?.username}) wirklich aus Ihrer Freundesliste entfernen?
                        Diese Aktion kann nicht rückgängig gemacht werden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setFriendToRemove(null)}>
                        Abbrechen
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={confirmRemoveFriend}
                        className={buttonVariants({ variant: 'destructive' })}
                      >
                        Entfernen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>

        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0 || isFetching}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 py-2 text-sm font-medium">
                  Seite {currentPage + 1} von {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={handleNextPage}
                  disabled={friendsPage?.last || isFetching}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    );
  };

  return (
    <div className="container-wrapper py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-foreground">Meine Freunde</h1>
        <Link to="/find-friends" className="flex items-center">
          <Button variant="link" className="text-base">
            <UserPlus className="mr-1 h-4 w-4" /> Neuer Freund
          </Button>
        </Link>
      </div>
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="search"
          placeholder="Freunde suchen (Name, Benutzername...)"
          className="pl-9 w-full"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      {renderContent()}
    </div>
  );
};

export default FriendsListPage;
