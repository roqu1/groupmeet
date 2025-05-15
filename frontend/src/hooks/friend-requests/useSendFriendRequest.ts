import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { sendFriendRequest } from '../../api/friendRequests';

interface SendFriendRequestData {
  message: string;
}

type SendFriendRequestError = Error;

type SendFriendRequestVariables = number;

/**
 * Custom hook to send a friend request.
 * Uses React Query's useMutation for handling the API call, state, and side effects.
 */
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

    onSuccess: (data, variables) => {
      console.log(`Successfully sent friend request to user ID: ${variables}`, data);
      toast.success(data.message || 'Freundschaftsanfrage gesendet!');

      queryClient.invalidateQueries({ queryKey: ['userSearch'] });
    },

    onError: (error: SendFriendRequestError, variables) => {
      console.error(`Error sending friend request to user ID: ${variables}`, error);
      toast.error(`Fehler: ${error.message || 'Anfrage konnte nicht gesendet werden.'}`);
    },

    onSettled: () => {
      console.log('Send friend request mutation settled.');
      if (onSettledCallback) {
        onSettledCallback();
      }
    },
  });

  return mutationResult;
};
