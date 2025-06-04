import { getCookie } from '@/utils/cookies';
import { API_CONFIG } from '../config/api';
import { FriendsPage } from '../types/pagination';

interface FetchFriendsParams {
  page: number;
  size: number;
  searchTerm?: string;
}

export const fetchFriends = async ({
  page = 0,
  size = 10,
  searchTerm,
}: FetchFriendsParams): Promise<FriendsPage> => {
  let url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.friends}?page=${page}&size=${size}`;
  if (searchTerm && searchTerm.trim() !== '') {
    url += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Failed to parse error response' }));
    throw {
      message: errorData.message || `Error fetching friends: ${response.statusText}`,
      statusCode: response.status,
    };
  }
  const data: FriendsPage = await response.json();
  return data;
};

export const removeFriend = async (friendId: number): Promise<void> => {
  const endpoint = API_CONFIG.endpoints.friendById(friendId);
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  const csrfToken = getCookie('XSRF-TOKEN');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers: headers,
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 204) {
      return;
    }
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Failed to parse error response' }));
    throw {
      message: errorData.message || `Error removing friend: ${response.statusText}`,
      statusCode: response.status,
    };
  }
};
