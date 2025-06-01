import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchGroupDetails } from '../../api/groups';
import { GroupDetails } from '../../types/group';

type GroupDetailsError = Error;

/**
 * Custom hook to fetch group details by ID.
 * Uses React Query for caching and state management.
 * @param {string | undefined} groupId The ID of the group to fetch. Query disabled if undefined.
 * @param {boolean} enabled Explicitly enable/disable the query.
 * @returns {UseQueryResult<GroupDetails, GroupDetailsError>} React Query result object.
 */
export const useGroupDetails = (
  groupId: string | undefined,
  enabled: boolean = true
): UseQueryResult<GroupDetails, GroupDetailsError> => {
  const queryResult = useQuery<
    GroupDetails,
    GroupDetailsError,
    GroupDetails,
    readonly [string, string | undefined]
  >({
    queryKey: ['groupDetails', groupId],

    queryFn: () => {
      if (!groupId) {
        return Promise.reject(new Error('Group ID is required'));
      }
      return fetchGroupDetails(groupId);
    },

    enabled: !!groupId && enabled,
  });

  return queryResult;
};
