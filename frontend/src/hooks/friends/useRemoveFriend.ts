import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { removeFriend } from '../../api/friends';
import { toast } from 'react-toastify';

type RemoveFriendError = Error;

export const useRemoveFriend = (): UseMutationResult<void, RemoveFriendError, number> => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation<void, RemoveFriendError, number>({
    mutationFn: removeFriend,

    onSuccess: (_data, variables) => {
      console.log(`Successfully removed friend with ID: ${variables}`);
      toast.success('Freund erfolgreich entfernt!');

      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },

    onError: (error: RemoveFriendError, variables) => {
      console.error(`Error removing friend with ID: ${variables}`, error);
      toast.error(`Fehler beim Entfernen des Freundes: ${error.message || 'Unbekannter Fehler'}`);
    },
  });

  return mutationResult;
};
