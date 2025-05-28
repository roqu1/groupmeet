import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchLocationOptions } from '@/api/metaData';
import { MultiSelectOption } from '@/components/ui/multi-select';

type LocationOptionsError = Error & { statusCode?: number };

export const useLocationOptions = (): UseQueryResult<MultiSelectOption[], LocationOptionsError> => {
  return useQuery<MultiSelectOption[], LocationOptionsError>({
    queryKey: ['locationOptions'],
    queryFn: fetchLocationOptions,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 + 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
