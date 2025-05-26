import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { API_CONFIG } from '@/config/api';
import { UserProfile } from '@/types/user';
import { useHttp, ApiError } from '@/hooks/useHttp';

export const useUserProfile = (
  userId: string | undefined
): UseQueryResult<UserProfile, ApiError> => {
  const { sendRequest } = useHttp<UserProfile, ApiError>();

  const fetchUserProfile = async (): Promise<UserProfile> => {
    if (!userId) {
      throw new Error('User ID is required to fetch profile.');
    }
    const endpoint = API_CONFIG.endpoints.userProfile(userId);
    return sendRequest(endpoint);
  };

  return useQuery<UserProfile, ApiError, UserProfile, (string | undefined)[]>({
    queryKey: ['userProfile', userId],
    queryFn: fetchUserProfile,
    enabled: !!userId,
    retry: (failureCount, error) => {
      if (error.statusCode === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
