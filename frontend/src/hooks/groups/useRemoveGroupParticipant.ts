import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { removeGroupParticipant as removeGroupParticipantApi } from '../../api/groups';
import { GroupParticipantActionResponse } from '../../types/group';

type RemoveParticipantError = Error & { statusCode?: number };
interface RemoveParticipantVariables {
  groupId: string;
  userId: number;
}

export const useRemoveGroupParticipant = (
  onSettledCallback?: () => void
): UseMutationResult<
  GroupParticipantActionResponse,
  RemoveParticipantError,
  RemoveParticipantVariables
> => {
  const queryClient = useQueryClient();
  return useMutation<
    GroupParticipantActionResponse,
    RemoveParticipantError,
    RemoveParticipantVariables
  >({
    mutationFn: ({ groupId, userId }) => removeGroupParticipantApi(groupId, userId),
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Teilnehmer erfolgreich entfernt.');
      queryClient.invalidateQueries({
        queryKey: ['groupParticipants', { groupId: variables.groupId }],
      });
      queryClient.invalidateQueries({ queryKey: ['groupDetails', variables.groupId] });
    },
    onError: (error, variables) => {
      toast.error(`Fehler beim Entfernen von Benutzer ${variables.userId}: ${error.message}`);
    },
    onSettled: () => {
      if (onSettledCallback) {
        onSettledCallback();
      }
    },
  });
};
