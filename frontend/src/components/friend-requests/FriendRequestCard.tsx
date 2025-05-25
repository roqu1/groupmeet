import React from 'react';
import { Link } from 'react-router-dom';
import { FriendRequest } from '@/types/friendRequest';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, UserCircle } from 'lucide-react';
import { useAcceptFriendRequest } from '@/hooks/friend-requests/useAcceptFriendRequest';
import { useRejectFriendRequest } from '@/hooks/friend-requests/useRejectFriendRequest';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface FriendRequestCardProps {
  request: FriendRequest;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({ request }) => {
  const { mutate: acceptRequest, isPending: isAccepting } = useAcceptFriendRequest();
  const { mutate: rejectRequest, isPending: isRejecting } = useRejectFriendRequest();

  const getInitials = (firstName?: string, lastName?: string) => {
    return (
      `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || <UserCircle size={20} />
    );
  };

  const handleAccept = () => {
    acceptRequest(request.requestId);
  };

  const handleReject = () => {
    rejectRequest(request.requestId);
  };

  const isLoadingAction = isAccepting || isRejecting;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-card border border-border rounded-lg shadow-sm gap-3">
      <div className="flex items-center gap-3 flex-grow min-w-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={request.senderAvatarUrl ?? undefined} alt={request.senderUsername} />
          <AvatarFallback>
            {getInitials(request.senderFirstName, request.senderLastName)}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <Link
            to={`/profile/${request.senderId}`}
            className="font-semibold text-card-foreground hover:underline truncate"
          >
            {request.senderFirstName} {request.senderLastName}
          </Link>
          <p className="text-sm text-muted-foreground truncate">@{request.senderUsername}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDistanceToNow(new Date(request.requestDate), { addSuffix: true, locale: de })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
        <Button
          size="sm"
          onClick={handleAccept}
          disabled={isLoadingAction}
          className="bg-green-500 hover:bg-green-600 text-white"
          aria-label={`Anfrage von ${request.senderUsername} annehmen`}
        >
          {isAccepting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          <span className="ml-1.5 hidden sm:inline">Annehmen</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReject}
          disabled={isLoadingAction}
          aria-label={`Anfrage von ${request.senderUsername} ablehnen`}
        >
          {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          <span className="ml-1.5 hidden sm:inline">Ablehnen</span>
        </Button>
      </div>
    </div>
  );
};

export default FriendRequestCard;
