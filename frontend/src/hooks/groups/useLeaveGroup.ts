import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { leaveGroup } from '../../api/groups';

interface LeaveGroupData {
  message: string;
}
type LeaveGroupError = Error;
type LeaveGroupVariables = string;

export const useLeaveGroup = (): UseMutationResult<
  LeaveGroupData,
  LeaveGroupError,
  LeaveGroupVariables
> => {
  const queryClient = useQueryClient();

  return useMutation<LeaveGroupData, LeaveGroupError, LeaveGroupVariables>({
    mutationFn: (groupId: LeaveGroupVariables) => leaveGroup(groupId),
    onSuccess: (data, groupId) => {
      toast.success(data.message || 'Gruppe erfolgreich verlassen!');
      queryClient.invalidateQueries({ queryKey: ['groupDetails', groupId] });
    },
    onError: (error: LeaveGroupError, groupId) => {
      console.error(`Error leaving group ID: ${groupId}`, error);
      toast.error(`Fehler: ${error.message || 'Verlassen der Gruppe fehlgeschlagen.'}`);
    },
  });
};
