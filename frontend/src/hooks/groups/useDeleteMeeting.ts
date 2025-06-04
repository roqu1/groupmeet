import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { deleteMeetingApi } from '../../api/groups';
import { ApiError } from '../useHttp';

type DeleteMeetingError = ApiError;
type DeleteMeetingVariables = string;

export const useDeleteMeeting = (): UseMutationResult<
  void,
  DeleteMeetingError,
  DeleteMeetingVariables
> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<void, DeleteMeetingError, DeleteMeetingVariables>({
    mutationFn: (meetingId: DeleteMeetingVariables) => deleteMeetingApi(meetingId),

    onSuccess: (_, meetingId) => {
      toast.success('Meeting erfolgreich gelöscht!');
      queryClient.invalidateQueries({ queryKey: ['meetingsSearch'] });
      queryClient.removeQueries({ queryKey: ['groupDetails', meetingId] });
      queryClient.removeQueries({ queryKey: ['groupParticipants', { groupId: meetingId }] });
      queryClient.invalidateQueries({ queryKey: ['userMeetings'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      navigate('/');
    },
    onError: (error: DeleteMeetingError, meetingId) => {
      console.error(`Error deleting meeting ID: ${meetingId}`, error);
      toast.error(`Fehler: ${error.message || 'Meeting konnte nicht gelöscht werden.'}`);
    },
  });
};
