import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchInterestOptions } from '@/api/metaData';
import { MultiSelectOption } from '@/components/ui/multi-select';

type InterestOptionsError = Error & { statusCode?: number };

export const useInterestOptions = (): UseQueryResult<MultiSelectOption[], InterestOptionsError> => {
  return useQuery<MultiSelectOption[], InterestOptionsError>({
    queryKey: ['interestOptions'],
    queryFn: fetchInterestOptions,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 + 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
