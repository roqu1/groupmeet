import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { API_CONFIG } from '@/config/api';
import { useHttp, ApiError } from '@/hooks/useHttp';
import { toast } from 'react-toastify';

interface AcceptFriendRequestResponse {
  message: string;
}

export const useAcceptFriendRequest = (
  onSettledCallback?: () => void
): UseMutationResult<AcceptFriendRequestResponse, ApiError, number> => {
  const { sendRequest } = useHttp<AcceptFriendRequestResponse, ApiError>();
  const queryClient = useQueryClient();

  const acceptRequest = async (requestId: number): Promise<AcceptFriendRequestResponse> => {
    const endpoint = API_CONFIG.endpoints.acceptFriendRequest(requestId);
    return sendRequest(endpoint, { method: 'PUT' });
  };

  return useMutation<AcceptFriendRequestResponse, ApiError, number>({
    mutationFn: acceptRequest,
    onSuccess: (data) => {
      toast.success(data.message || 'Freundschaftsanfrage angenommen!');
      queryClient.invalidateQueries({ queryKey: ['incomingFriendRequests'] });
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message || 'Anfrage konnte nicht angenommen werden.'}`);
    },
    onSettled: () => {
      if (onSettledCallback) {
        onSettledCallback();
      }
    },
  });
};
