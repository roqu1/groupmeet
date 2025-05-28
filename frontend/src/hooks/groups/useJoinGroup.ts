import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { joinGroup } from '../../api/groups';

interface JoinGroupData {
  message: string;
}

type JoinGroupError = Error;

type JoinGroupVariables = string;

/**
 * Custom hook to join a group.
 * Uses React Query's useMutation.
 */
export const useJoinGroup = (): UseMutationResult<
  JoinGroupData,
  JoinGroupError,
  JoinGroupVariables
> => {
  const queryClient = useQueryClient();

  return useMutation<JoinGroupData, JoinGroupError, JoinGroupVariables>({
    mutationFn: (groupId: JoinGroupVariables) => joinGroup(groupId),

    onSuccess: (data, groupId) => {
      toast.success(data.message || 'Erfolgreich der Gruppe beigetreten!');
      queryClient.invalidateQueries({ queryKey: ['groupDetails', groupId] });
    },
    onError: (error: JoinGroupError, groupId) => {
      console.error('[useJoinGroup] onError triggered for groupId:', groupId, 'Error:', error);
      toast.error(`Fehler: ${error.message || 'Beitritt zur Gruppe fehlgeschlagen.'}`);
    },
  });
};
