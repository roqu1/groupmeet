import { useQuery, UseQueryResult, keepPreviousData } from '@tanstack/react-query';
import { fetchMeetings } from '../../api/meetings';
import { MeetingsSearchPage, MeetingsSearchParams } from '../../types/meeting';

type MeetingsSearchError = Error & { statusCode?: number };

export const useMeetingsSearch = (
  params: MeetingsSearchParams,
  enabled: boolean = true
): UseQueryResult<MeetingsSearchPage, MeetingsSearchError> => {
  return useQuery<
    MeetingsSearchPage,
    MeetingsSearchError,
    MeetingsSearchPage,
    readonly [string, MeetingsSearchParams]
  >({
    queryKey: ['meetingsSearch', { ...params, types: params.types?.slice().sort() }],
    queryFn: () => fetchMeetings(params),
    enabled: enabled,
    placeholderData: keepPreviousData,
  });
};
