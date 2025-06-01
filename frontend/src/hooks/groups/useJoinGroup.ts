import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { joinGroup as joinGroupApi } from '../../api/groups';
import { ApiError } from '../useHttp';

interface JoinGroupData {
  message: string;
}

type JoinGroupError = ApiError;

type JoinGroupVariables = string;

export const useJoinGroup = (): UseMutationResult<
  JoinGroupData,
  JoinGroupError,
  JoinGroupVariables
> => {
  const queryClient = useQueryClient();

  return useMutation<JoinGroupData, JoinGroupError, JoinGroupVariables>({
    mutationFn: (groupId: JoinGroupVariables) => joinGroupApi(groupId),

    onSuccess: (data, groupId) => {
      toast.success(data.message || 'Erfolgreich der Gruppe beigetreten!');
      queryClient.invalidateQueries({ queryKey: ['groupDetails', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupParticipants', { groupId }] });
      queryClient.invalidateQueries({ queryKey: ['userMeetings', undefined] });
      queryClient.invalidateQueries({ queryKey: ['meetingsSearch'] });
    },
    onError: (error: JoinGroupError, groupId) => {
      console.error('[useJoinGroup] onError triggered for groupId:', groupId, 'Error:', error);
      toast.error(`Fehler: ${error.message || 'Beitritt zur Gruppe fehlgeschlagen.'}`);
    },
  });
};
