/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { updateGroupApi } from '@/api/groups';
import { ApiError } from '@/hooks/useHttp';

export interface UpdateGroupData {
  title?: string;
  description?: string;
  location?: string;
  maxParticipants?: number;
  dateTime?: Date;
  format?: string;
  meetingTypeNames?: string[];
}

interface UpdateGroupParams {
  groupId: string;
  groupData: UpdateGroupData;
}

type UpdateGroupError = ApiError;

export const useUpdateGroup = (): UseMutationResult<any, UpdateGroupError, UpdateGroupParams> => {
  const queryClient = useQueryClient();

  return useMutation<any, UpdateGroupError, UpdateGroupParams>({
    mutationFn: ({ groupId, groupData }: UpdateGroupParams) => updateGroupApi(groupId, groupData),

    onSuccess: ({ groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['userMeetings'] });
      queryClient.invalidateQueries({ queryKey: ['meetingsSearch'] });
      queryClient.invalidateQueries({ queryKey: ['groupDetails', groupId] });
    },

    onError: (error: UpdateGroupError) => {
      console.error('Error updating group:', error);

      if (error.validationErrors) {
        const validationErrorMessages = error.validationErrors as Record<string, string>;
        const messages = Object.values(validationErrorMessages).join('\n');
        toast.error(`Fehler bei der Aktualisierung:\n${messages}`);
      } else {
        toast.error(`Fehler: ${error.message || 'Gruppe konnte nicht aktualisiert werden.'}`);
      }
    },
  });
};
