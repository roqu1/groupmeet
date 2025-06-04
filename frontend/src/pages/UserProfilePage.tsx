/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import AboutMeSection from '@/components/profile/AboutMeSection';
import InterestsSection from '@/components/profile/InterestsSection';
import AchievementsSection from '@/components/profile/AchievementsSection';
import FriendsSection from '@/components/profile/FriendsSection';
import { Loader2, AlertCircle, Star } from 'lucide-react';
import ProfileHeader from '@/components/ProfileHeader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/lib/auth/AuthContext';
import UserMeetingsSection from '@/components/profile/UserMeetingsSection';
import { Button } from '@/components/ui/button';
import SubscriptionDialog from '@/components/profile/SubscriptionDialog';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser, isLoading: isAuthLoading, checkAuthStatus } = useAuth();
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useUserProfile(userId);

  if (isAuthLoading || (isLoadingProfile && !profile)) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isProfileError) {
    if ((profileError as any)?.statusCode === 404) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-destructive mb-2">Profil nicht gefunden</h2>
          <p className="text-muted-foreground">
            Das gesuchte Benutzerprofil konnte nicht gefunden werden.
          </p>
        </div>
      );
    }
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">
          Fehler beim Laden des Profils
        </h2>
        <p className="text-muted-foreground">
          {(profileError as any)?.message || 'Ein unbekannter Fehler ist aufgetreten.'}
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <p className="text-muted-foreground">Keine Profildaten verfügbar.</p>
      </div>
    );
  }

  const isOwnProfile = !!currentUser && currentUser.id === profile.id;

  const handleSubscriptionSuccess = async () => {
    await checkAuthStatus();
    refetchProfile();
  };

  return (
    <div className="container-wrapper py-8">
      <div className="space-y-6">
        <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

        {isOwnProfile && !profile.pro && (
          <div className="bg-card p-6 rounded-lg shadow-sm border border-primary/50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-primary">Upgrade auf Pro!</h3>
                <p className="text-sm text-muted-foreground">
                  Schalte unbegrenzte Freunde, Meeting-Erstellungen und mehr frei.
                </p>
              </div>
              <Button onClick={() => setIsSubscriptionDialogOpen(true)}>
                <Star className="mr-2 h-4 w-4" /> Subscription kaufen
              </Button>
            </div>
          </div>
        )}

        <AboutMeSection aboutMe={profile.aboutMe} />
        <InterestsSection interests={profile.interests} />
        <AchievementsSection achievements={profile.achievements} />
        <FriendsSection
          friendsCount={profile.friendsCount}
          friendPreviews={profile.friendPreviews}
          pendingFriendRequestsCount={profile.pendingFriendRequestsCount}
          isOwnProfile={isOwnProfile}
          profileUserId={profile.id}
        />
        {userId && <UserMeetingsSection userId={userId} isOwnProfile={isOwnProfile} />}
      </div>
      {isOwnProfile && !profile.pro && (
        <SubscriptionDialog
          isOpen={isSubscriptionDialogOpen}
          onOpenChange={setIsSubscriptionDialogOpen}
          onSubscriptionSuccess={handleSubscriptionSuccess}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
