import { useState, useCallback } from 'react';
import { API_CONFIG } from '../config/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface FetchOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  validationErrors?: Record<string, string>;
}

export interface UseHttpReturn<T, E = ApiError> {
  data: T | null;
  error: E | null;
  isLoading: boolean;
  sendRequest: (endpoint: string, options?: FetchOptions) => Promise<T>;
  clearState: () => void;
}

// Helper function to get CSRF token from cookies
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    // For safety, it splits by `;` and takes the first part
    return parts.pop()?.split(';').shift() ?? null;
  }
  return null;
}

/**
 * Base hook for making HTTP requests to the API
 *
 * @template T - Response data type
 * @template E - Error type (defaults to ApiError)
 * @returns Object with request function and states
 */
export function useHttp<T, E = ApiError>(): UseHttpReturn<T, E> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Sends HTTP request to the specified endpoint
   *
   * @param endpoint - API endpoint (without base URL)
   * @param options - Request options (method, headers, body, etc.)
   * @returns Promise with response data
   * @throws Error if request fails
   */
  const sendRequest = useCallback(
    async (endpoint: string, options: FetchOptions = {}): Promise<T> => {
      let currentError: E | null = null;
      try {
        setIsLoading(true);
        setError(null);
        setData(null);

        const method = options.method || 'GET';
        const defaultHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };

        // Add CSRF token header for non-safe methods
        if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
          const csrfToken = getCookie('XSRF-TOKEN');
          if (csrfToken) {
            defaultHeaders['X-XSRF-TOKEN'] = csrfToken;
          } else {
            console.warn(
              'CSRF token (XSRF-TOKEN) not found in cookies. Request might be rejected by backend.'
            );
          }
        }

        const url = `${API_CONFIG.baseUrl}${endpoint}`;

        const fetchOptions: RequestInit = {
          method: method,
          headers: {
            ...defaultHeaders,
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          credentials: 'include',
        };

        const response = await fetch(url, fetchOptions);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let responseData: any = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          responseData = await response.json();
        } else if (response.status !== 204 && response.status !== 205) {
          console.warn(
            `Received non-JSON response with status ${response.status} for ${method} ${endpoint}`
          );
          if (!response.ok) {
            responseData = { message: `HTTP error! status: ${response.status}` };
          }
        }

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          let validationErrors: Record<string, string> | undefined = undefined;

          if (responseData) {
            if (responseData.message) {
              errorMessage = responseData.message;
            } else if (responseData.error) {
              errorMessage = responseData.error;
            }
            if (responseData.errors && typeof responseData.errors === 'object') {
              errorMessage = 'Validation failed';
              validationErrors = responseData.errors;
            }
          }

          const errorPayload = {
            message: errorMessage,
            statusCode: response.status,
            validationErrors: validationErrors,
          } as E;

          currentError = errorPayload;
          throw errorPayload;
        }

        setData(responseData as T);
        return responseData as T;
      } catch (err) {
        if (!currentError) {
          currentError = {
            message: (err as Error).message || 'An unknown network error occurred',
          } as E;
        }
        setError(currentError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Resets all hook states
   */
  const clearState = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    sendRequest,
    clearState,
  };
}
