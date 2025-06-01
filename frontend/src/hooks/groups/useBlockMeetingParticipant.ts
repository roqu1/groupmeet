import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { blockMeetingParticipantApi } from '../../api/groups';
import { GroupParticipantActionResponse } from '../../types/group';

type BlockParticipantError = Error & { statusCode?: number };
interface BlockParticipantVariables {
  meetingId: string;
  userId: number;
}

export const useBlockMeetingParticipant = (
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
    mutationFn: ({ meetingId, userId }) => blockMeetingParticipantApi(meetingId, userId),
    onSuccess: (data, variables) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ['groupParticipants', { groupId: variables.meetingId }],
      });
      queryClient.invalidateQueries({ queryKey: ['groupDetails', variables.meetingId] });
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
