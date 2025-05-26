import React, { useState } from 'react';
import { useIncomingFriendRequests } from '@/hooks/friend-requests/useIncomingFriendRequests';
import FriendRequestCard from '@/components/friend-requests/FriendRequestCard';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 8;

const FriendRequestsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const {
    data: requestsPage,
    isLoading,
    isError,
    error,
    isFetching,
  } = useIncomingFriendRequests({ page: currentPage, size: PAGE_SIZE });

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    if (!requestsPage?.last) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const renderContent = () => {
    if (isLoading && !requestsPage && !isFetching) {
      return (
        <div className="flex flex-col items-center justify-center text-muted-foreground py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
          <span>Lade Freundschaftsanfragen...</span>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="my-6 p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md flex items-center gap-2 justify-center text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>Fehler beim Laden der Anfragen: {error?.message || 'Unbekannter Fehler'}</span>
        </div>
      );
    }

    const requests = requestsPage?.content ?? [];

    if (requests.length === 0 && !isFetching) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10">
          <Inbox className="h-12 w-12 mb-4 text-gray-400" />
          <h3 className="text-lg font-medium">Keine neuen Anfragen</h3>
          <p className="text-sm">Du hast derzeit keine offenen Freundschaftsanfragen.</p>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'space-y-4 transition-opacity duration-300',
          isFetching ? 'opacity-70' : 'opacity-100'
        )}
      >
        {isLoading && isFetching && requests.length === 0 && (
          <div className="flex justify-center items-center pt-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {requests.map((request) => (
          <FriendRequestCard key={request.requestId} request={request} />
        ))}
      </div>
    );
  };

  return (
    <div className="container-wrapper py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Freundschaftsanfragen</h1>

      {renderContent()}

      {requestsPage && requestsPage.totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                disabled={currentPage === 0 || isFetching}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 py-2 text-sm font-medium">
                Seite {currentPage + 1} von {requestsPage.totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={handleNextPage} disabled={requestsPage.last || isFetching} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default FriendRequestsPage;
