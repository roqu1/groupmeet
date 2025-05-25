import React from 'react';
import { Link } from 'react-router-dom';
import { FriendSummary } from '@/types/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MailWarning } from 'lucide-react';

interface FriendsSectionProps {
  friendsCount: number;
  friendPreviews: FriendSummary[];
  pendingFriendRequestsCount?: number;
  isOwnProfile: boolean;
  profileUserId: number;
}

const FriendsSection: React.FC<FriendsSectionProps> = ({
  friendsCount,
  friendPreviews,
  pendingFriendRequestsCount,
  isOwnProfile,
  profileUserId,
}) => {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'N/A';
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">Freunde ({friendsCount})</h2>
        {isOwnProfile && (
          <Button asChild variant="link" size="sm">
            <Link to={`/profile/${profileUserId}/friends`}>Alle anzeigen</Link>
          </Button>
        )}
      </div>

      {isOwnProfile &&
        pendingFriendRequestsCount !== undefined &&
        pendingFriendRequestsCount > 0 && (
          <div className="mb-4 p-3 bg-amber-100 border border-amber-300 text-amber-800 rounded-md text-sm flex items-center">
            <MailWarning className="h-5 w-5 mr-2 flex-shrink-0" />
            Sie haben {pendingFriendRequestsCount} neue Freundschaftsanfrage
            {pendingFriendRequestsCount > 1 ? 'n' : ''}.{' '}
            <Link to="/friend-requests" className="font-semibold hover:underline ml-1">
              Anzeigen
            </Link>
          </div>
        )}

      {friendPreviews.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {friendPreviews.map((friend) => (
            <Link
              key={friend.id}
              to={`/profile/${friend.id}`}
              className="flex flex-col items-center text-center p-2 rounded-md hover:bg-muted/50 transition-colors group"
              title={`${friend.firstName} ${friend.lastName}`}
            >
              <Avatar className="h-16 w-16 mb-1 group-hover:scale-105 transition-transform">
                <AvatarImage src={friend.avatarUrl ?? undefined} alt={friend.username} />
                <AvatarFallback>{getInitials(friend.firstName, friend.lastName)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate w-full group-hover:text-primary">
                {friend.firstName}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {isOwnProfile
            ? 'Sie haben noch keine Freunde.'
            : 'Dieser Benutzer hat noch keine Freunde.'}
        </p>
      )}
    </div>
  );
};

export default FriendsSection;
