import { API_CONFIG } from '../config/api';
import { getCookie } from '@/utils/cookies';

interface SendFriendRequestResponse {
  message: string;
}

export const sendFriendRequest = async (userId: number): Promise<SendFriendRequestResponse> => {
  const endpoint = API_CONFIG.endpoints.sendFriendRequest(userId);
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  const csrfToken = getCookie('XSRF-TOKEN');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  } else {
    console.warn(
      'CSRF token (XSRF-TOKEN) not found in cookies for sendFriendRequest. Request might be rejected by backend.'
    );
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Failed to parse error response' }));
    throw {
      message:
        errorData.message || `Fehler beim Senden der Freundschaftsanfrage: ${response.statusText}`,
      statusCode: response.status,
    };
  }

  const data: SendFriendRequestResponse = await response.json();
  return data;
};
