import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { API_CONFIG } from '@/config/api';
import { ApiError, useHttp } from '@/hooks/useHttp';
import { Gender } from '@/types/user';

// Define the structure of the user object based on AuthResponseDto
export interface AuthUser {
  id: number;
  gender: Gender;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void; // Function called after successful backend login
  logout: () => void; // Function called after successful backend logout
  checkAuthStatus: () => Promise<void>; // Function to manually re-check auth status
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const initialCheckDone = useRef(false);

  const isChecking = useRef(false);

  const { sendRequest: checkAuthRequest, error: authError } = useHttp<AuthUser, ApiError>();

  // Check the user's authentication status by calling the /me endpoint
  const checkAuthStatus = useCallback(async () => {
    if (isChecking.current) {
      console.log('Auth check already in progress, skipping.');
      return;
    }
    isChecking.current = true;
    setIsAuthLoading(true);

    try {
      const user = await checkAuthRequest(API_CONFIG.endpoints.me);
      setCurrentUser(user);
    } catch (err) {
      const statusCode = (err as ApiError)?.statusCode;
      if (statusCode !== 401 && statusCode !== 403) {
        console.error('Error checking auth status:', err);
      }
      setCurrentUser(null);
    } finally {
      setIsAuthLoading(false);
      isChecking.current = false;
      initialCheckDone.current = true;
    }
  }, [checkAuthRequest]);

  useEffect(() => {
    if (!initialCheckDone.current) {
      checkAuthStatus();
    }
  }, [checkAuthStatus]);

  const login = (user: AuthUser) => {
    setCurrentUser(user);
    initialCheckDone.current = true;
    setIsAuthLoading(false);
  };

  const logout = () => {
    setCurrentUser(null);
    initialCheckDone.current = true;
    setIsAuthLoading(false);
  };

  const isAuthenticated = !!currentUser;

  useEffect(() => {
    const statusCode = authError?.statusCode;
    if (authError && statusCode !== 401 && statusCode !== 403) {
      console.error('Auth Provider Error (/me check):', authError);
    }
  }, [authError]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading: isAuthLoading,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
