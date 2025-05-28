import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { removeGroupParticipant } from '../../api/groups';
import { GroupParticipantActionResponse } from '../../types/group';

type RemoveParticipantError = Error;
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
    mutationFn: ({ groupId, userId }) => removeGroupParticipant(groupId, userId),
    onSuccess: (data, variables) => {
      toast.success(data.message);
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
