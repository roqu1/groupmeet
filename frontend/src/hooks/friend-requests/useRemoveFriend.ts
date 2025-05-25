import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { removeFriend } from '../../api/friends';
import { toast } from 'react-toastify';

type RemoveFriendError = Error & { statusCode?: number };

export const useRemoveFriend = (
  onSettledCallback?: () => void
): UseMutationResult<void, RemoveFriendError, number> => {
  const mutationResult = useMutation<void, RemoveFriendError, number>({
    mutationFn: removeFriend,

    onSuccess: () => {
      toast.success('Freund erfolgreich entfernt!');
    },
    onError: (error: RemoveFriendError) => {
      toast.error(`Fehler beim Entfernen des Freundes: ${error.message || 'Unbekannter Fehler'}`);
    },
    onSettled: () => {
      if (onSettledCallback) {
        onSettledCallback();
      }
    },
  });

  return mutationResult;
};
