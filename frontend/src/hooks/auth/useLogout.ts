import { useCallback } from 'react';
import { useHttp, ApiError } from '../useHttp';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/api';

interface LogoutResponse {
  message: string; // Matches backend MessageResponse
}

interface UseLogoutReturn {
  logoutUser: () => Promise<void>;
  isLoading: boolean;
  error: ApiError | null;
  clearError: () => void;
}

export function useLogout(): UseLogoutReturn {
  const { sendRequest, isLoading, error, clearState } = useHttp<LogoutResponse, ApiError>();
  const { logout: clearAuthUser } = useAuth();

  const logoutUser = useCallback(async (): Promise<void> => {
    try {
      await sendRequest(API_CONFIG.endpoints.logout, {
        method: 'POST',
      });
      clearAuthUser(); // Update auth context on successful logout
    } catch (err) {
      console.error('Logout failed:', err);
      throw err;
    }
  }, [sendRequest, clearAuthUser]);

  return {
    logoutUser,
    isLoading,
    error,
    clearError: clearState,
  };
}
