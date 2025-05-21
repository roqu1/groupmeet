import React from 'react';
import { Link } from 'react-router-dom';
import { useEditProfile } from '@/hooks/profile/useEditProfile.ts';
import { useInterestOptions } from '@/hooks/options/useInterestOptions.ts';
import { useLocationOptions } from '@/hooks/options/useLocationOptions.ts';
import { Button } from '../ui/button';

export const EditProfileForm: React.FC = () => {
  // Fetch interest options using the existing pattern established by your team
  const {
    data: availableInterests,
    isLoading: interestsLoading,
    error: interestsError,
  } = useInterestOptions();

  // Fetch location options using the same pattern as interests
  const {
    data: availableLocations,
    isLoading: locationsLoading,
    error: locationsError,
  } = useLocationOptions();

  // Get profile form state and handlers from the existing useEditProfile hook
  const {
    formData,
    profileImageUrl,
    isLoading,
    isSubmitting,
    errors,
    handleInputChange,
    handleInterestsChange,
    handleImageChange,
    handleSubmit,
  } = useEditProfile();

  // Helper function that allows the dropdown to work with your existing form system
  // This bridges the gap between HTMLSelectElement and your existing input handler
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const syntheticEvent = {
      target: {
        name: e.target.name,
        value: e.target.value,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    handleInputChange(syntheticEvent);
  };

  // Enhanced loading state that coordinates multiple asynchronous data sources
  if (isLoading || interestsLoading || locationsLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  // Comprehensive error handling that accounts for all possible failure modes
  if (interestsError || !availableInterests || locationsError || !availableLocations) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-600">Error loading form data. Please try again later.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Profilbild</label>
        <div className="flex items-center space-x-5">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Profilbild" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400">Kein Bild</span>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.profileImage && (
              <p className="mt-1 text-sm text-red-600">{errors.profileImage}</p>
            )}
          </div>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* First Name */}
        <div className="space-y-1">
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Vorname*
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 ${
              errors.firstName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            required
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
        </div>

        {/* Last Name */}
        <div className="space-y-1">
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Nachname*
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 ${
              errors.lastName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            required
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
        </div>
      </div>

      {/* Location - Backend-driven dropdown instead of text input */}
      <div className="space-y-1">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Ort
        </label>
        <select
          id="location"
          name="location"
          value={formData.location || ''}
          onChange={handleSelectChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
        >
          <option value="">Wählen Sie einen Ort...</option>
          {availableLocations.map((location) => (
            <option key={location.value} value={location.value}>
              {location.label}
            </option>
          ))}
        </select>
      </div>

      {/* About Me */}
      <div className="space-y-1">
        <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700">
          Über mich
        </label>
        <textarea
          id="aboutMe"
          name="aboutMe"
          rows={4}
          value={formData.aboutMe}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
        />
      </div>

      {/* Interests - Using existing interest system instead of hardcoded array */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Meine Interessen</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableInterests.map((interest) => (
            <div key={interest.value} className="flex items-start">
              <input
                type="checkbox"
                id={`interest-${interest.value}`}
                checked={formData.interests.includes(interest.value)}
                onChange={(e) => {
                  const newInterests = e.target.checked
                    ? [...formData.interests, interest.value]
                    : formData.interests.filter((i: string) => i !== interest.value);
                  handleInterestsChange(newInterests);
                }}
                className="mt-0.5 mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`interest-${interest.value}`} className="text-sm text-gray-700">
                {interest.label}
              </label>
            </div>
          ))}
        </div>
        {errors.interests && <p className="mt-1 text-sm text-red-600">{errors.interests}</p>}
      </div>

      {/* Server Error Message */}
      {errors.server && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Fehler</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{errors.server}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Link to="/profile">
          <Button variant="outline" type="button" disabled={isSubmitting}>
            Abbrechen
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
        </Button>
      </div>
    </form>
  );
};
