import React from 'react';
import { Link } from 'react-router-dom';
import { UserProfile, ProfileFriendshipStatus } from '@/types/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Pencil,
  UserPlus,
  UserX,
  Check,
  Loader2,
  Users,
  MapPin,
  MinusCircle,
  X,
} from 'lucide-react';
import { useSendFriendRequest } from '@/hooks/friend-requests/useSendFriendRequest';
import { useAcceptFriendRequest } from '@/hooks/friend-requests/useAcceptFriendRequest';
import { useRejectFriendRequest } from '@/hooks/friend-requests/useRejectFriendRequest';
import { useQueryClient } from '@tanstack/react-query';
import { useRemoveFriend } from '@/hooks/friend-requests/useRemoveFriend';
import { useAuth } from '@/lib/auth/AuthContext';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isOwnProfile }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [currentAction, setCurrentAction] = React.useState<string | null>(null);

  const invalidateProfileQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['userProfile', profile.id.toString()] });
    if (currentUser) {
      queryClient.invalidateQueries({ queryKey: ['userProfile', currentUser.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['incomingFriendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['userSearch'] });
    }
  };

  const { mutate: sendRequestMutate, isPending: isSendingRequest } = useSendFriendRequest(() => {
    setCurrentAction(null);
    invalidateProfileQueries();
  });

  const { mutate: acceptRequestMutate, isPending: isAcceptingRequest } = useAcceptFriendRequest(
    () => {
      setCurrentAction(null);
      invalidateProfileQueries();
    }
  );

  const { mutate: rejectOrCancelRequestMutate, isPending: isRejectingOrCancelling } =
    useRejectFriendRequest(() => {
      setCurrentAction(null);
      invalidateProfileQueries();
    });

  const { mutate: removeFriendMutate, isPending: isRemovingFriend } = useRemoveFriend(() => {
    setCurrentAction(null);
    invalidateProfileQueries();
  });

  const handleSendFriendRequest = () => {
    if (!isOwnProfile && profile.id) {
      setCurrentAction('send');
      sendRequestMutate(profile.id);
    }
  };

  const handleCancelFriendRequest = () => {
    if (profile.relatedFriendshipId) {
      setCurrentAction('cancel');
      rejectOrCancelRequestMutate(profile.relatedFriendshipId);
    }
  };

  const handleAcceptFriendRequest = () => {
    if (profile.relatedFriendshipId) {
      setCurrentAction('accept');
      acceptRequestMutate(profile.relatedFriendshipId);
    }
  };

  const handleRejectFriendRequest = () => {
    if (profile.relatedFriendshipId) {
      setCurrentAction('reject');
      rejectOrCancelRequestMutate(profile.relatedFriendshipId);
    }
  };

  const handleRemoveFriend = () => {
    if (!isOwnProfile && profile.id) {
      setCurrentAction('remove');
      removeFriendMutate(profile.id);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'N/A';
  };

  const renderInteractionButton = () => {
    if (isOwnProfile) return null;
    if (!currentUser) return null;

    const anyActionPending =
      isSendingRequest || isAcceptingRequest || isRejectingOrCancelling || isRemovingFriend;

    switch (profile.friendshipStatusWithViewer) {
      case ProfileFriendshipStatus.NONE:
        return (
          <Button
            size="sm"
            onClick={handleSendFriendRequest}
            disabled={anyActionPending && currentAction !== 'send'}
            aria-live="polite"
          >
            {isSendingRequest && currentAction === 'send' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Freund hinzufügen
          </Button>
        );
      case ProfileFriendshipStatus.REQUEST_SENT:
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancelFriendRequest}
            disabled={anyActionPending && currentAction !== 'cancel'}
            aria-live="polite"
          >
            {isRejectingOrCancelling && currentAction === 'cancel' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MinusCircle className="mr-2 h-4 w-4 text-muted-foreground" />
            )}
            Anfrage zurückziehen
          </Button>
        );
      case ProfileFriendshipStatus.REQUEST_RECEIVED:
        return (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              size="sm"
              variant="default"
              onClick={handleAcceptFriendRequest}
              disabled={anyActionPending && currentAction !== 'accept'}
              className="bg-green-500 hover:bg-green-600 text-white"
              aria-live="polite"
            >
              {isAcceptingRequest && currentAction === 'accept' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Annehmen
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRejectFriendRequest}
              disabled={anyActionPending && currentAction !== 'reject'}
              aria-live="polite"
            >
              {isRejectingOrCancelling && currentAction === 'reject' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Ablehnen
            </Button>
          </div>
        );
      case ProfileFriendshipStatus.FRIENDS:
        return (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleRemoveFriend}
            disabled={anyActionPending && currentAction !== 'remove'}
            aria-live="polite"
          >
            {isRemovingFriend && currentAction === 'remove' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserX className="mr-2 h-4 w-4" />
            )}
            Freund entfernen
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm relative">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-2 border-primary">
          <AvatarImage
            src={profile.avatarUrl ?? undefined}
            alt={`${profile.firstName} ${profile.lastName}`}
          />
          <AvatarFallback className="text-3xl">
            {getInitials(profile.firstName, profile.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-md text-muted-foreground">@{profile.username}</p>
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            {profile.location && (
              <div className="flex items-center justify-center sm:justify-start">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.age !== null && (
              <div className="flex items-center justify-center sm:justify-start">
                <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Alter: {profile.age}</span>
              </div>
            )}
          </div>
        </div>
        <div className="sm:ml-auto flex-shrink-0 mt-4 sm:mt-0">
          {isOwnProfile ? (
            <Button asChild variant="outline" size="icon" title="Profil bearbeiten">
              <Link to="/profile/edit">
                <Pencil className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            renderInteractionButton()
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
