import { useState, useCallback } from 'react';
import { API_CONFIG } from '../config/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface FetchOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  withCredentials?: boolean;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface UseHttpReturn<T, E = ApiError> {
  data: T | null;
  error: E | null;
  isLoading: boolean;
  sendRequest: (endpoint: string, options?: FetchOptions) => Promise<T>;
  clearState: () => void;
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
      try {
        setIsLoading(true);
        setError(null);

        const defaultHeaders = {
          'Content-Type': 'application/json',
        };

        const url = `${API_CONFIG.baseUrl}${endpoint}`;

        const fetchOptions: RequestInit = {
          method: options.method || 'GET',
          headers: {
            ...defaultHeaders,
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          credentials: options.withCredentials ? 'include' : 'same-origin',
        };

        const response = await fetch(url, fetchOptions);

        const responseData =
          response.status !== 204 ? await response.json() : (null as unknown as T);

        if (!response.ok) {
          if (responseData && responseData.message === 'Validation failed' && responseData.errors) {
            const firstErrorKey = Object.keys(responseData.errors)[0];
            const firstErrorMessage = responseData.errors[firstErrorKey];

            const transformedError = {
              message: `${firstErrorKey}: ${firstErrorMessage}`,
              statusCode: response.status,
              validationErrors: responseData.errors,
            } as unknown as E;
            throw transformedError;
          } else if (responseData && !responseData.message && responseData.error) {
            const transformedError = {
              message: responseData.error || 'Validation error',
              statusCode: response.status,
            } as unknown as E;
            throw transformedError;
          }
          throw responseData;
        }

        setData(responseData);
        return responseData;
      } catch (err) {
        setError(err as E);
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
