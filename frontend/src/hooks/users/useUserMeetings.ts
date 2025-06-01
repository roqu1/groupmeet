import { useInfiniteQuery, UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
import { fetchUserMeetings } from '@/api/users';
import { UserProfileMeetingsPage } from '@/types/meeting';
import { ApiError } from '@/hooks/useHttp';

interface UseUserMeetingsParams {
  userId: string | undefined;
  pageSize?: number;
}

const useUserMeetings = ({
  userId,
  pageSize = 5,
}: UseUserMeetingsParams): UseInfiniteQueryResult<
  InfiniteData<UserProfileMeetingsPage, number>,
  ApiError
> => {
  return useInfiniteQuery<
    UserProfileMeetingsPage,
    ApiError,
    InfiniteData<UserProfileMeetingsPage, number>,
    (string | undefined)[],
    number
  >({
    queryKey: ['userMeetings', userId],
    queryFn: ({ pageParam }) => {
      if (!userId) {
        throw new Error('User ID is required to fetch meetings.');
      }
      return fetchUserMeetings({ userId, page: pageParam as number, size: pageSize });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.last) {
        return undefined;
      }
      return lastPage.number + 1;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.first) {
        return undefined;
      }
      return firstPage.number - 1;
    },
    initialPageParam: 0,
    enabled: !!userId,
    retry: (failureCount, error) => {
      if (error.statusCode === 404) return false;
      return failureCount < 2;
    },
  });
};

export default useUserMeetings;
