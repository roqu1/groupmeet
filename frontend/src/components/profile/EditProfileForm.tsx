import React from 'react';
import { Link } from 'react-router-dom';
import { useEditProfile } from '@/hooks/profile/useEditProfile.ts';
import { useInterestOptions } from '@/hooks/options/useInterestOptions.ts';
import { useLocationOptions } from '@/hooks/options/useLocationOptions.ts';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MultiSelect } from '../ui/multi-select';
import { Combobox } from '../ui/comboBox';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getFullAvatarUrl } from '@/utils/imageUrl';

export const EditProfileForm: React.FC = () => {
  const { currentUser } = useAuth();

  const {
    data: availableInterests,
    isLoading: interestsLoading,
    error: interestsError,
  } = useInterestOptions();

  const {
    data: availableLocations,
    isLoading: locationsLoading,
    error: locationsError,
  } = useLocationOptions();

  const {
    formData,
    profileImageUrl,
    originalData,
    isLoading: profileLoading,
    isSubmitting,
    errors,
    handleInputChange,
    handleInterestsChange,
    handleImageChange,
    handleSubmit,
  } = useEditProfile();

  const handleLocationSelect = (value: string) => {
    handleInputChange({
      target: { name: 'location', value },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  if (profileLoading || interestsLoading || locationsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Lade Formulardaten...</span>
      </div>
    );
  }

  if (interestsError || locationsError || !availableInterests || !availableLocations) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <span>Fehler beim Laden der Formulardaten. Bitte versuchen Sie es später erneut.</span>
        {interestsError && <p className="text-sm">{interestsError.message}</p>}
        {locationsError && <p className="text-sm">{locationsError.message}</p>}
      </div>
    );
  }

  const displayAvatar = profileImageUrl?.startsWith('blob:')
    ? profileImageUrl
    : getFullAvatarUrl(originalData?.avatarUrl);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="profileImageUpload" className="block text-sm font-medium text-foreground">
          Profilbild
        </label>
        <div className="flex items-center space-x-5">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Profilbild" className="w-full h-full object-cover" />
            ) : (
              <span className="text-muted-foreground text-xs">Kein Bild</span>
            )}
          </div>
          <div>
            <Input
              id="profileImageUpload"
              type="file"
              accept="image/png, image/jpeg, image/gif, image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {errors.profileImage && (
              <p className="mt-1 text-sm text-destructive">{errors.profileImage}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
            Vorname*
          </label>
          <Input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={errors.firstName ? 'border-destructive' : ''}
            required
          />
          {errors.firstName && <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
            Nachname*
          </label>
          <Input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={errors.lastName ? 'border-destructive' : ''}
            required
          />
          {errors.lastName && <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="location-combobox" className="block text-sm font-medium text-foreground">
          Ort
        </label>
        <Combobox
          id="location-combobox"
          options={availableLocations}
          value={formData.location || ''}
          onSelect={handleLocationSelect}
          placeholder="Ort auswählen..."
          searchPlaceholder="Ort suchen..."
          emptyMessage="Kein Ort gefunden."
          className={errors.location ? 'border-destructive' : ''}
        />
        {errors.location && <p className="mt-1 text-sm text-destructive">{errors.location}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="aboutMe" className="block text-sm font-medium text-foreground">
          Über mich
        </label>
        <textarea
          id="aboutMe"
          name="aboutMe"
          rows={4}
          value={formData.aboutMe}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-input bg-background shadow-sm focus:border-primary focus:ring-ring py-2 px-3 sm:text-sm ${errors.aboutMe ? 'border-destructive' : ''}`}
        />
        {errors.aboutMe && <p className="mt-1 text-sm text-destructive">{errors.aboutMe}</p>}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="interests-multiselect"
          className="block text-sm font-medium text-foreground"
        >
          Meine Interessen
        </label>
        <MultiSelect
          id="interests-multiselect"
          options={availableInterests}
          selected={formData.interests}
          onValueChange={handleInterestsChange}
          placeholder="Interessen auswählen..."
          className={errors.interests ? 'border-destructive' : ''}
        />
        {errors.interests && <p className="mt-1 text-sm text-destructive">{errors.interests}</p>}
      </div>

      {errors.server && (
        <div className="rounded-md bg-destructive/10 p-4 border border-destructive/30">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-destructive mr-2 flex-shrink-0" />
            <div className="ml-1">
              <h3 className="text-sm font-medium text-destructive">Fehler</h3>
              <div className="mt-1 text-sm text-destructive/90">
                <p>{errors.server}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-5 border-t border-border mt-8">
        <Button asChild variant="outline" type="button" disabled={isSubmitting}>
          <Link to={currentUser ? `/profile/${currentUser.id}` : '/profile'}>Abbrechen</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting || profileLoading}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            'Speichern'
          )}
        </Button>
      </div>
    </form>
  );
};
