import { useQuery, UseQueryResult, keepPreviousData } from '@tanstack/react-query';
import { fetchGroupParticipants } from '../../api/groups';
import { GroupParticipantsData, FetchGroupParticipantsParams } from '../../types/group';

type GroupParticipantsError = Error;

/**
 * Custom hook to fetch a paginated list of group participants.
 * @param {string | undefined} groupId The ID of the group.
 * @param {number} page The current page number.
 * @param {number} size The number of items per page.
 * @param {boolean} enabled Whether the query should be enabled.
 * @returns {UseQueryResult<GroupParticipantsData, GroupParticipantsError>} React Query result object.
 */
export const useGroupParticipants = (
  groupId: string | undefined,
  page: number,
  size: number,
  searchTerm?: string,
  enabled: boolean = true
): UseQueryResult<GroupParticipantsData, GroupParticipantsError> => {
  const queryParams: FetchGroupParticipantsParams = { groupId: groupId!, page, size, searchTerm };

  return useQuery<
    GroupParticipantsData,
    GroupParticipantsError,
    GroupParticipantsData,
    readonly [string, FetchGroupParticipantsParams]
  >({
    queryKey: ['groupParticipants', queryParams],
    queryFn: () => fetchGroupParticipants(queryParams),
    enabled: !!groupId && enabled,
    placeholderData: keepPreviousData,
  });
};
