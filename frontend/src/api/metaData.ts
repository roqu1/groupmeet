import { API_CONFIG } from '../config/api';
import { MultiSelectOption } from '@/components/ui/multi-select';
import { getCookie } from '@/utils/cookies';

interface ApiOptionDto {
  value: string;
  label: string;
}

export const fetchInterestOptions = async (): Promise<MultiSelectOption[]> => {
  const url = `${API_CONFIG.baseUrl}/api/interests`;

  const csrfToken = getCookie('XSRF-TOKEN');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Failed to parse error response' }));
    throw {
      message: errorData.message || `Error fetching interest options: ${response.statusText}`,
      statusCode: response.status,
    };
  }
  const data: ApiOptionDto[] = await response.json();
  return data.map((dto) => ({ value: dto.value, label: dto.label }));
};

export const fetchLocationOptions = async (): Promise<MultiSelectOption[]> => {
  const url = `${API_CONFIG.baseUrl}/api/locations`;

  const csrfToken = getCookie('XSRF-TOKEN');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Failed to parse error response' }));
    throw {
      message: errorData.message || `Error fetching location options: ${response.statusText}`,
      statusCode: response.status,
    };
  }

  const data: ApiOptionDto[] = await response.json();
  return data.map((dto) => ({ value: dto.value, label: dto.label }));
};
