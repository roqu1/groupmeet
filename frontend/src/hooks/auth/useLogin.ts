import { useCallback } from 'react';
import { useHttp, ApiError } from '../useHttp';
import { API_CONFIG } from '../../config/api';
import { AuthUser, useAuth } from '@/lib/auth/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

// Matches backend LoginRequestDto
interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

// Matches backend AuthResponseDto
type LoginResponse = AuthUser;

interface UseLoginReturn {
  loginUser: (credentials: LoginRequest) => Promise<LoginResponse>;
  isLoading: boolean;
  error: ApiError | null;
  clearError: () => void;
}

export function useLogin(): UseLoginReturn {
  const { sendRequest, isLoading, error, clearState } = useHttp<LoginResponse, ApiError>();
  const { login: setAuthUser } = useAuth();
  const queryClient = useQueryClient();

  const loginUser = useCallback(
    async (credentials: LoginRequest): Promise<LoginResponse> => {
      const userData = await sendRequest(API_CONFIG.endpoints.login, {
        method: 'POST',
        body: credentials,
      });
      setAuthUser(userData); // Update auth context on successful login
      queryClient.removeQueries();
      return userData;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendRequest, setAuthUser]
  );

  return {
    loginUser,
    isLoading,
    error,
    clearError: clearState,
  };
}
