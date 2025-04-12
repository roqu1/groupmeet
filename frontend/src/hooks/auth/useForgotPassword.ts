import { useState, useCallback } from 'react';
import { useHttp, ApiError } from '../useHttp';
import { API_CONFIG } from '../../config/api';

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface UseForgotPasswordReturn {
  sendPasswordResetLink: (email: string) => Promise<void>;
  isLoading: boolean;
  error: ApiError | null;
  successMessage: string | null;
  clearStatus: () => void;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const { sendRequest, isLoading, error, data, clearState } = useHttp<
    ForgotPasswordResponse,
    ApiError
  >();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sendPasswordResetLink = useCallback(
    async (email: string): Promise<void> => {
      try {
        setSuccessMessage(null);
        const requestData: ForgotPasswordRequest = { email };
        const response = await sendRequest(API_CONFIG.endpoints.forgotPassword, {
          method: 'POST',
          body: requestData,
        });
        setSuccessMessage(response.message);
      } catch (err) {
        console.error('Forgot password request failed:', err);
      }
    },
    [sendRequest]
  );

  const clearStatus = useCallback(() => {
    clearState();
    setSuccessMessage(null);
  }, [clearState]);

  return {
    sendPasswordResetLink,
    isLoading,
    error,
    successMessage: successMessage || (data?.message ?? null),
    clearStatus,
  };
}
