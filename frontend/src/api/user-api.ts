import { API_CONFIG } from '../config/api';
import { getCookie } from '@/utils/cookies.ts';

export interface UserProfile {
  firstName: string;
  lastName: string;
  location: string | null;
  aboutMe: string | null;
  interests: string[];
  avatarUrl?: string | null; // Changed from profileImageUrl
}

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.currentUserProfile}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Failed to parse error response' }));
    throw {
      message: errorData.message || `Error fetching profile: ${response.statusText}`,
      statusCode: response.status,
    };
  }

  return await response.json();
};

export const updateUserProfile = async (profileData: FormData): Promise<UserProfile> => {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.currentUserProfile}`;

  // Add CSRF token handling for security - this is required for data modification operations
  const csrfToken = getCookie('XSRF-TOKEN');
  const headers: HeadersInit = {};
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: headers, // Include the CSRF token in headers
    credentials: 'include',
    body: profileData,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Failed to parse error response' }));
    throw {
      message: errorData.message || `Error updating profile: ${response.statusText}`,
      statusCode: response.status,
    };
  }

  return await response.json();
};
