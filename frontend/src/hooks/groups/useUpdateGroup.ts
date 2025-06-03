import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_CONFIG } from '@/config/api';
import { getCookie } from '@/utils/cookies';

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

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, groupData }: UpdateGroupParams) => {
      let isoDateTime;
      if (groupData.dateTime) {
        const date = new Date(groupData.dateTime);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        isoDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      }
      const meetingTypeNames = groupData.meetingTypeNames;

      const formattedData = {
        ...groupData,
        dateTime: isoDateTime,
        meetingTypeNames: meetingTypeNames,
        meetingTypeIds: undefined,
      };

      const csrfToken = getCookie('XSRF-TOKEN');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
      }

      const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.meetingDetails(groupId)}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(formattedData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Failed to parse error response' }));
        throw new Error(errorData.message || `Error updating group: ${response.statusText}`);
      }

      return await response.json();
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
