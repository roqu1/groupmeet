import { useCallback } from 'react';
import { useHttp, ApiError } from '../useHttp';
import { API_CONFIG } from '../../config/api';

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  message: string;
}

interface UseResetPasswordReturn {
  submitResetPassword: (token: string, newPassword: string) => Promise<ResetPasswordResponse>;
  isLoading: boolean;
  error: ApiError | null;
  data: ResetPasswordResponse | null;
  clearStatus: () => void;
}

export function useResetPassword(): UseResetPasswordReturn {
  const { sendRequest, isLoading, error, data, clearState } = useHttp<
    ResetPasswordResponse,
    ApiError
  >();

  const submitResetPassword = useCallback(
    async (token: string, newPassword: string): Promise<ResetPasswordResponse> => {
      const requestData: ResetPasswordRequest = { token, newPassword };
      return await sendRequest(API_CONFIG.endpoints.resetPassword, {
        method: 'POST',
        body: requestData,
      });
    },
    [sendRequest]
  );

  const clearStatus = useCallback(() => {
    clearState();
  }, [clearState]);

  return {
    submitResetPassword,
    isLoading,
    error,
    data,
    clearStatus,
  };
}
