import { useQuery, UseQueryResult, keepPreviousData } from '@tanstack/react-query';
import { searchUsers } from '../../api/users';
import { UserSearchPage, SearchUsersParams } from '../../types/user';

type UserSearchError = Error;

export const useUserSearch = (
  params: SearchUsersParams,
  enabled: boolean = true
): UseQueryResult<UserSearchPage, UserSearchError> => {
  const queryResult = useQuery<UserSearchPage, UserSearchError, UserSearchPage, readonly unknown[]>(
    {
      queryKey: [
        'userSearch',
        {
          ...params,
          genders: params.genders?.slice().sort(),
          interests: params.interests?.slice().sort(),
        },
      ],
      queryFn: () => searchUsers(params),
      enabled: enabled,
      placeholderData: keepPreviousData,
    }
  );

  return queryResult;
};
