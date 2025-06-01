import { API_CONFIG } from '../config/api';
import { UserSearchPage, SearchUsersParams } from '../types/user';
import { UserProfileMeetingsPage } from '../types/meeting';

export const searchUsers = async (params: SearchUsersParams = {}): Promise<UserSearchPage> => {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.searchTerm?.trim()) queryParams.append('searchTerm', params.searchTerm.trim());

  params.genders?.forEach((gender) => queryParams.append('genders', gender));

  if (params.location?.trim()) queryParams.append('location', params.location.trim());
  if (params.minAge !== null && params.minAge !== undefined)
    queryParams.append('minAge', params.minAge.toString());
  if (params.maxAge !== null && params.maxAge !== undefined)
    queryParams.append('maxAge', params.maxAge.toString());

  params.interests?.forEach((interest) => queryParams.append('interests', interest));

  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.userSearch}?${queryParams.toString()}`;

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
      .catch(() => ({ message: 'Failed to parse error response from user search' }));
    throw {
      message: errorData.message || `Error searching users: ${response.statusText}`,
      statusCode: response.status,
    };
  }
  const data: UserSearchPage = await response.json();
  return data;
};

interface FetchUserMeetingsParams {
  userId: string;
  page: number;
  size: number;
}

export const fetchUserMeetings = async ({
  userId,
  page,
  size,
}: FetchUserMeetingsParams): Promise<UserProfileMeetingsPage> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: 'dateTime,asc',
  });

  const url = `${API_CONFIG.baseUrl}/api/users/${userId}/meetings?${queryParams.toString()}`;

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
      .catch(() => ({ message: 'Failed to parse error response from fetching user meetings' }));
    throw {
      message: errorData.message || `Error fetching user meetings: ${response.statusText}`,
      statusCode: response.status,
    };
  }
  const data: UserProfileMeetingsPage = await response.json();
  return data;
};
