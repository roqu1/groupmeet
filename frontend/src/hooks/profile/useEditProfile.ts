import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { fetchUserProfile, updateUserProfile, UserProfile } from '@/api/user-api';
import { useAuth } from '@/lib/auth/AuthContext';

export interface ProfileFormState {
  firstName: string;
  lastName: string;
  location: string;
  aboutMe: string;
  interests: string[];
  profileImage: File | null;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  location?: string;
  aboutMe?: string;
  interests?: string;
  profileImage?: string;
  server?: string;
}

export const useEditProfile = () => {
  const [formData, setFormData] = useState<ProfileFormState>({
    firstName: '',
    lastName: '',
    location: '',
    aboutMe: '',
    interests: [],
    profileImage: null,
  });

  const [originalData, setOriginalData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const navigate = useNavigate();

  // Get current user information from authentication context
  // This provides the user ID needed for constructing the correct profile URL after saving
  const { currentUser } = useAuth();

  // Access React Query's cache management system to ensure profile data stays synchronized
  // This is crucial because your application uses different API endpoints for editing vs viewing profiles
  const queryClient = useQueryClient();

  // Fetch user profile data on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await fetchUserProfile();

        setFormData({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          location: profileData.location || '',
          aboutMe: profileData.aboutMe || '',
          interests: profileData.interests || [],
          profileImage: null,
        });

        setOriginalData(profileData);
        setProfileImageUrl(profileData.avatarUrl || null);
        setErrors({});
      } catch (error) {
        console.error('Failed to load profile:', error);
        setErrors({ server: 'Failed to load profile data. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Form field handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleInterestsChange = (selectedInterests: string[]) => {
    setFormData((prev) => ({ ...prev, interests: selectedInterests }));

    // Clear interests error if it exists
    if (errors.interests) {
      setErrors((prev) => ({ ...prev, interests: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, profileImage: file }));
      setProfileImageUrl(URL.createObjectURL(file));

      // Clear the image error if it exists
      if (errors.profileImage) {
        setErrors((prev) => ({ ...prev, profileImage: undefined }));
      }
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vorname ist erforderlich';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nachname ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare form data for multipart/form-data submission
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('location', formData.location);
      submitData.append('aboutMe', formData.aboutMe);
      submitData.append('interests', JSON.stringify(formData.interests));

      if (formData.profileImage) {
        submitData.append('profileImage', formData.profileImage);
      }

      await updateUserProfile(submitData);

      // Invalidate the cached profile data to ensure the viewing page displays updated information
      // This step is critical because your edit and view operations use different API endpoints
      // Without this cache invalidation, users would see stale data even after successful updates
      await queryClient.invalidateQueries({
        queryKey: ['userProfile', currentUser?.id?.toString()],
      });

      // Redirect to the current user's specific profile page using the correct URL pattern
      // This ensures compatibility with the GM-6 profile viewing integration
      navigate(`/profile/${currentUser?.id}`);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors({
        server: 'Fehler beim Aktualisieren des Profils. Bitte versuchen Sie es später erneut.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    originalData,
    profileImageUrl,
    isLoading,
    isSubmitting,
    errors,
    handleInputChange,
    handleInterestsChange,
    handleImageChange,
    handleSubmit,
  };
};
