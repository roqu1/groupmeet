/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { removeFriend } from '../../api/friends';
import { toast } from 'react-toastify';

type RemoveFriendError = Error;

export const useRemoveFriend = (
  _p0: () => void
): UseMutationResult<void, RemoveFriendError, number> => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation<void, RemoveFriendError, number>({
    mutationFn: removeFriend,

    onSuccess: () => {
      toast.success('Freund erfolgreich entfernt!');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },

    onError: (error: RemoveFriendError) => {
      toast.error(`Fehler beim Entfernen des Freundes: ${error.message || 'Unbekannter Fehler'}`);
    },
  });

  return mutationResult;
};
