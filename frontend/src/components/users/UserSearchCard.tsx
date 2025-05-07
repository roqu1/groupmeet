import React from 'react';
import { Link } from 'react-router-dom';
import { UserSearchResult, Gender } from '@/types/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, CheckCircle, Clock, Loader2, Venus, Mars, VenusAndMars } from 'lucide-react';

interface UserSearchCardProps {
  user: UserSearchResult;
  onAddFriend: (userId: number) => void;
  isAddingFriend: boolean;
}

const UserSearchCard: React.FC<UserSearchCardProps> = ({ user, onAddFriend, isAddingFriend }) => {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'N/A';
  };

  const renderActionButton = () => {
    if (user.friendshipStatus === 'NONE' && isAddingFriend) {
      return (
        <Button size="sm" disabled aria-label="Wird hinzugefügt...">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Hinzufügen...
        </Button>
      );
    }

    switch (user.friendshipStatus) {
      case 'NONE':
        return (
          <Button
            size="sm"
            onClick={() => onAddFriend(user.id)}
            disabled={isAddingFriend}
            aria-label={`Freundschaftsanfrage an ${user.username} senden`}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Hinzufügen
          </Button>
        );
      case 'REQUEST_SENT':
      case 'REQUEST_RECEIVED':
        return (
          <Button size="sm" variant="outline" disabled>
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            Angefragt
          </Button>
        );
      case 'FRIENDS':
        return (
          <Button size="sm" variant="outline" disabled>
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Freunde
          </Button>
        );
      default:
        return (
          <Button size="sm" variant="outline" disabled>
            Laden...
          </Button>
        );
    }
  };

  const GenderIconDisplay: React.FC<{ gender: Gender }> = ({ gender }) => {
    if (gender === 'MALE') {
      return <Mars className="ml-1.5 h-4 w-4 flex-shrink-0 text-blue-600" aria-label="Männlich" />;
    } else if (gender === 'FEMALE') {
      return <Venus className="ml-1.5 h-4 w-4 flex-shrink-0 text-pink-600" aria-label="Weiblich" />;
    } else if (gender === 'DIVERS') {
      return (
        <VenusAndMars
          className="ml-1.5 h-4 w-4 flex-shrink-0 text-purple-600"
          aria-label="Divers"
        />
      );
    }
    return null;
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
          <AvatarImage
            src={user.avatarUrl ?? undefined}
            alt={`${user.firstName} ${user.lastName}`}
          />
          <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <div className="flex items-center">
            <Link
              to={`/profile/${user.id}`}
              className="font-semibold text-sm sm:text-base text-card-foreground truncate hover:underline focus:underline focus:outline-none"
              title={`Profil von ${user.firstName} ${user.lastName} ansehen`}
            >
              {user.firstName} {user.lastName}
            </Link>
            <GenderIconDisplay gender={user.gender} />
          </div>
          <p
            className="text-xs sm:text-sm text-muted-foreground truncate"
            title={`@${user.username}`}
          >
            @{user.username}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 ml-2 sm:ml-4">{renderActionButton()}</div>
    </div>
  );
};

export default UserSearchCard;
