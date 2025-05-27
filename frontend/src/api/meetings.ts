import {
  MeetingsSearchPage,
  MeetingsSearchParams,
  MeetingCardData,
  MeetingCreationPayload,
} from '../types/meeting';
import { API_CONFIG } from '../config/api';
import { getCookie } from '@/utils/cookies';

export const fetchMeetings = async (
  params: MeetingsSearchParams = {}
): Promise<MeetingsSearchPage> => {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.searchTerm?.trim()) queryParams.append('searchTerm', params.searchTerm.trim());

  params.types?.forEach((type) => queryParams.append('types', type));

  if (params.location?.trim()) queryParams.append('location', params.location.trim());
  if (params.format) queryParams.append('format', params.format);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.searchMeetings}?${queryParams.toString()}`;

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
      .catch(() => ({ message: 'Failed to parse error response from meeting search' }));
    throw {
      message: errorData.message || `Error searching meetings: ${response.statusText}`,
      statusCode: response.status,
    };
  }
  const data: MeetingsSearchPage = await response.json();
  return data;
};

export const createMeeting = async (payload: MeetingCreationPayload): Promise<MeetingCardData> => {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.createMeeting}`;
  const csrfToken = getCookie('XSRF-TOKEN');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  } else {
    console.warn('CSRF token not found for createMeeting');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Failed to parse error response from create meeting' }));
    throw {
      message: errorData.message || `Error creating meeting: ${response.statusText}`,
      statusCode: response.status,
      validationErrors: errorData.errors,
    };
  }
  const data: MeetingCardData = await response.json();
  return data;
};
