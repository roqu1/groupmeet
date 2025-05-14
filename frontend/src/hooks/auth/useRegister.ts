import { useState, useCallback } from 'react';
import { useHttp } from '../useHttp';
import { API_CONFIG } from '../../config/api';

// Registration data types
export interface RegisterFormData {
  gender: 'männlich' | 'weiblich' | 'divers';
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

interface RegisterRequest {
  gender: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  gender: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface RegisterError {
  message: string;
}

interface UseRegisterReturn {
  register: (data: RegisterFormData) => Promise<RegisterResponse>;
  isLoading: boolean;
  error: RegisterError | null;
  data: RegisterResponse | null;
  success: boolean;
  clearStatus: () => void;
}

/**
 * Hook for handling user registration
 *
 * @returns Object with registration function and states
 */
export function useRegister(): UseRegisterReturn {
  const { sendRequest, isLoading, error, data, clearState } = useHttp<
    RegisterResponse,
    RegisterError
  >();
  const [success, setSuccess] = useState(false);

  const register = useCallback(
    async (formData: RegisterFormData): Promise<RegisterResponse> => {
      try {
        setSuccess(false);

        const requestData: RegisterRequest = {
          gender: formData.gender,
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };

        const result = await sendRequest(API_CONFIG.endpoints.register, {
          method: 'POST',
          body: requestData,
        });

        setSuccess(true);
        return result;
      } catch (err) {
        setSuccess(false);
        throw err;
      }
    },
    [sendRequest]
  );

  /**
   * Resets all hook states
   */
  const clearStatus = useCallback(() => {
    clearState();
    setSuccess(false);
  }, [clearState]);

  return {
    register,
    isLoading,
    error,
    data,
    success,
    clearStatus,
  };
}
