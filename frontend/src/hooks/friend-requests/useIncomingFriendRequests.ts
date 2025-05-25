import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { API_CONFIG } from '@/config/api';
import { FriendRequestPage } from '@/types/friendRequest';
import { useHttp, ApiError } from '@/hooks/useHttp';

interface FetchIncomingRequestsParams {
  page: number;
  size: number;
}

export const useIncomingFriendRequests = ({
  page,
  size,
}: FetchIncomingRequestsParams): UseQueryResult<FriendRequestPage, ApiError> => {
  const { sendRequest } = useHttp<FriendRequestPage, ApiError>();

  const fetchRequests = async (): Promise<FriendRequestPage> => {
    const endpoint = `${API_CONFIG.endpoints.incomingFriendRequests}?page=${page}&size=${size}&sort=createdAt,desc`;
    return sendRequest(endpoint);
  };

  return useQuery<FriendRequestPage, ApiError, FriendRequestPage, (string | number)[]>({
    queryKey: ['incomingFriendRequests', page, size],
    queryFn: fetchRequests,
  });
};
