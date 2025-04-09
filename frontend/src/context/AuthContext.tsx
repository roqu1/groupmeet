import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useHttp, ApiError } from '../hooks/useHttp';
import { API_CONFIG } from '../config/api';

// Use the AuthResponseDto structure from the backend
export interface AuthUser {
  id: number;
  gender: string;
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
  login: (user: AuthUser) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const initialCheckDone = useRef(false);
  const isChecking = useRef(false);

  const { sendRequest: checkAuthRequest, error: authError } = useHttp<AuthUser, ApiError>();

  const checkAuthStatus = useCallback(async () => {
    if (isChecking.current) {
      return;
    }
    isChecking.current = true;
    setIsAuthLoading(true);

    try {
      const user = await checkAuthRequest(API_CONFIG.endpoints.me);
      setCurrentUser(user);
    } catch (err) {
      if ((err as ApiError).statusCode !== 401) {
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
  }, []);

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
    if (authError && authError.statusCode !== 401) {
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
