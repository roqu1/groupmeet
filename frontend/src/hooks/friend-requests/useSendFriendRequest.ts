import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { sendFriendRequest } from '../../api/friendRequests';

interface SendFriendRequestData {
  message: string;
}

type SendFriendRequestError = Error;

type SendFriendRequestVariables = number;

export const useSendFriendRequest = (
  onSettledCallback?: () => void
): UseMutationResult<SendFriendRequestData, SendFriendRequestError, SendFriendRequestVariables> => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation<
    SendFriendRequestData,
    SendFriendRequestError,
    SendFriendRequestVariables
  >({
    mutationFn: (userId: SendFriendRequestVariables) => sendFriendRequest(userId),

    onSuccess: (data) => {
      toast.success(data.message || 'Freundschaftsanfrage gesendet!');

      queryClient.invalidateQueries({ queryKey: ['userSearch'] });
    },

    onError: (error: SendFriendRequestError, variables) => {
      console.error(`Error sending friend request to user ID: ${variables}`, error);
      toast.error(`Fehler: ${error.message || 'Anfrage konnte nicht gesendet werden.'}`);
    },

    onSettled: () => {
      if (onSettledCallback) {
        onSettledCallback();
      }
    },
  });

  return mutationResult;
};
