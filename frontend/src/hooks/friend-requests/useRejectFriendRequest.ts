import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { API_CONFIG } from '@/config/api';
import { useHttp, ApiError } from '@/hooks/useHttp';
import { toast } from 'react-toastify';

interface RejectFriendRequestResponse {
  message: string;
}

export const useRejectFriendRequest = (
  onSettledCallback?: () => void
): UseMutationResult<RejectFriendRequestResponse, ApiError, number> => {
  const { sendRequest } = useHttp<RejectFriendRequestResponse, ApiError>();
  const queryClient = useQueryClient();

  const rejectRequest = async (requestId: number): Promise<RejectFriendRequestResponse> => {
    const endpoint = API_CONFIG.endpoints.rejectFriendRequest(requestId);
    return sendRequest(endpoint, { method: 'DELETE' });
  };

  return useMutation<RejectFriendRequestResponse, ApiError, number>({
    mutationFn: rejectRequest,
    onSuccess: (data) => {
      toast.info(data.message || 'Freundschaftsanfrage abgelehnt/entfernt.');
      queryClient.invalidateQueries({ queryKey: ['incomingFriendRequests'] });
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message || 'Anfrage konnte nicht abgelehnt werden.'}`);
    },
    onSettled: () => {
      if (onSettledCallback) {
        onSettledCallback();
      }
    },
  });
};
