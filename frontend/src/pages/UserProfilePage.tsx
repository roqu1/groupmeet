/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AboutMeSection from '@/components/profile/AboutMeSection';
import InterestsSection from '@/components/profile/InterestsSection';
import AchievementsSection from '@/components/profile/AchievementsSection';
import FriendsSection from '@/components/profile/FriendsSection';
import { Loader2, AlertCircle } from 'lucide-react';
import ProfileHeader from '@/components/ProfileHeader';
import { useUserProfile } from '@/hooks/useUserProfile';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser, isLoading: isAuthLoading } = useAuth();

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    error: profileError,
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

  return (
    <div className="container-wrapper py-8">
      <div className="space-y-6">
        <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
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
      </div>
    </div>
  );
};

export default UserProfilePage;
