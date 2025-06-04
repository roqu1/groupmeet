import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { API_CONFIG } from '@/config/api';
import { useHttp, ApiError } from '@/hooks/useHttp';
import { AuthUser, useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'react-toastify';

type SubscribeResponse = AuthUser;

export const useSubscribeToPro = (): UseMutationResult<SubscribeResponse, ApiError, void> => {
  const { sendRequest } = useHttp<SubscribeResponse, ApiError>();
  const queryClient = useQueryClient();
  const { updateCurrentUser, currentUser } = useAuth();

  const subscribeUser = async (): Promise<SubscribeResponse> => {
    const endpoint = API_CONFIG.endpoints.subscribeToPro;
    return sendRequest(endpoint, {
      method: 'POST',
    });
  };

  return useMutation<SubscribeResponse, ApiError, void>({
    mutationFn: subscribeUser,
    onSuccess: (data) => {
      updateCurrentUser({ isPro: data.isPro }); // Update AuthContext immediately
      queryClient.invalidateQueries({ queryKey: ['userProfile', currentUser?.id?.toString()] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message || 'Abonnement konnte nicht abgeschlossen werden.'}`);
    },
  });
};
