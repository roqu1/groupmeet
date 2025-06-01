import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { unblockMeetingParticipantApi } from '../../api/groups';
import { GroupParticipantActionResponse } from '../../types/group';

type UnblockParticipantError = Error & { statusCode?: number };
interface UnblockParticipantVariables {
  meetingId: string;
  userId: number;
}

export const useUnblockMeetingParticipant = (
  onSettledCallback?: () => void
): UseMutationResult<
  GroupParticipantActionResponse,
  UnblockParticipantError,
  UnblockParticipantVariables
> => {
  const queryClient = useQueryClient();
  return useMutation<
    GroupParticipantActionResponse,
    UnblockParticipantError,
    UnblockParticipantVariables
  >({
    mutationFn: ({ meetingId, userId }) => unblockMeetingParticipantApi(meetingId, userId),
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Sperrung des Benutzers aufgehoben.');
      queryClient.invalidateQueries({
        queryKey: ['groupParticipants', { groupId: variables.meetingId }],
      });
      queryClient.invalidateQueries({ queryKey: ['groupDetails', variables.meetingId] });
    },
    onError: (error, variables) => {
      toast.error(
        `Fehler beim Aufheben der Sperrung für Benutzer ${variables.userId}: ${error.message}`
      );
    },
    onSettled: () => {
      if (onSettledCallback) {
        onSettledCallback();
      }
    },
  });
};
