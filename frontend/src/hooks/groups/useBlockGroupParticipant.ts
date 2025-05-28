import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { blockGroupParticipant } from '../../api/groups';
import { GroupParticipantActionResponse } from '../../types/group';

type BlockParticipantError = Error;
interface BlockParticipantVariables {
  groupId: string;
  userId: number;
}

export const useBlockGroupParticipant = (
  onSettledCallback?: () => void
): UseMutationResult<
  GroupParticipantActionResponse,
  BlockParticipantError,
  BlockParticipantVariables
> => {
  const queryClient = useQueryClient();
  return useMutation<
    GroupParticipantActionResponse,
    BlockParticipantError,
    BlockParticipantVariables
  >({
    mutationFn: ({ groupId, userId }) => blockGroupParticipant(groupId, userId),
    onSuccess: (data, variables) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ['groupParticipants', { groupId: variables.groupId }],
      });
    },
    onError: (error, variables) => {
      toast.error(`Fehler beim Sperren von Benutzer ${variables.userId}: ${error.message}`);
    },
    onSettled: () => {
      if (onSettledCallback) {
        onSettledCallback();
      }
    },
  });
};
