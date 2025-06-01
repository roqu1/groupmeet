import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { leaveGroup as leaveGroupApi } from '../../api/groups';
import { ApiError } from '../useHttp';

interface LeaveGroupData {
  message: string;
}

type LeaveGroupError = ApiError;
type LeaveGroupVariables = string;

export const useLeaveGroup = (): UseMutationResult<
  LeaveGroupData,
  LeaveGroupError,
  LeaveGroupVariables
> => {
  const queryClient = useQueryClient();

  return useMutation<LeaveGroupData, LeaveGroupError, LeaveGroupVariables>({
    mutationFn: (groupId: LeaveGroupVariables) => leaveGroupApi(groupId),
    onSuccess: (data, groupId) => {
      toast.success(data.message || 'Gruppe erfolgreich verlassen!');
      queryClient.invalidateQueries({ queryKey: ['groupDetails', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupParticipants', { groupId }] });
      queryClient.invalidateQueries({ queryKey: ['userMeetings', undefined] });
      queryClient.invalidateQueries({ queryKey: ['meetingsSearch'] });
    },
    onError: (error: LeaveGroupError, groupId) => {
      console.error(`Error leaving group ID: ${groupId}`, error);
      toast.error(`Fehler: ${error.message || 'Verlassen der Gruppe fehlgeschlagen.'}`);
    },
  });
};
