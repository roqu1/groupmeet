import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchFriends } from '../../api/friends';
import { FriendsPage } from '../../types/pagination';

type FriendsListError = Error;

interface UseFriendsListParams {
  page: number;
  pageSize?: number;
}

/**
 * Custom hook to fetch a paginated list of friends.
 * Uses React Query for caching, background updates, and request state management.
 * @param {UseFriendsListParams} params Object containing the current page and optional page size.
 * @returns {UseQueryResult<FriendsPage, FriendsListError>} React Query result object.
 */
export const useFriendsList = ({
  page,
  pageSize = 5,
}: UseFriendsListParams): UseQueryResult<FriendsPage, FriendsListError> => {
  const queryResult = useQuery<FriendsPage, FriendsListError>({
    queryKey: ['friends', page, pageSize],

    queryFn: () => fetchFriends({ page: page, size: pageSize }),
  });

  return queryResult;
};
