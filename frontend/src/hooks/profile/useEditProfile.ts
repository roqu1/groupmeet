import { useState, useEffect, useCallback } from 'react';
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

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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
  const { currentUser, checkAuthStatus } = useAuth();
  const queryClient = useQueryClient();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleInterestsChange: React.Dispatch<React.SetStateAction<string[]>> = useCallback(
    (valueOrUpdater) => {
      setFormData((prevFormState) => {
        const newInterests =
          typeof valueOrUpdater === 'function'
            ? valueOrUpdater(prevFormState.interests)
            : valueOrUpdater;
        return { ...prevFormState, interests: newInterests };
      });

      if (errors.interests) {
        setErrors((prev) => ({ ...prev, interests: undefined }));
      }
    },
    [errors.interests]
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrors((prev) => ({
          ...prev,
          profileImage: `Datei ist zu groß. Maximale Größe ist ${MAX_FILE_SIZE_MB}MB.`,
        }));
        e.target.value = '';
        setFormData((prev) => ({ ...prev, profileImage: null }));
        setProfileImageUrl(originalData?.avatarUrl || null);
        return;
      }
      setFormData((prev) => ({ ...prev, profileImage: file }));
      setProfileImageUrl(URL.createObjectURL(file));
      if (errors.profileImage) {
        setErrors((prev) => ({ ...prev, profileImage: undefined }));
      }
    } else {
      setFormData((prev) => ({ ...prev, profileImage: null }));
      setProfileImageUrl(originalData?.avatarUrl || null);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('location', formData.location);
      submitData.append('aboutMe', formData.aboutMe);
      submitData.append('interests', JSON.stringify(formData.interests));

      if (formData.profileImage) {
        submitData.append('profileImage', formData.profileImage);
      }

      const updatedProfileData = await updateUserProfile(submitData);

      await queryClient.invalidateQueries({
        queryKey: ['userProfile', currentUser?.id?.toString()],
      });
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });

      if (currentUser && currentUser.id === updatedProfileData.id) {
        await checkAuthStatus();
      }

      await queryClient.invalidateQueries({ queryKey: ['userSearch'] });
      await queryClient.invalidateQueries({ queryKey: ['friends'] });

      navigate(`/profile/${currentUser?.id}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      let errorMessage =
        'Fehler beim Aktualisieren des Profils. Bitte versuchen Sie es später erneut.';
      if (error && error.message) {
        errorMessage = error.message;
      }
      setErrors({ server: errorMessage });
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
