const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const API_CONFIG = {
  baseUrl: BACKEND_URL,
  endpoints: {
    test: '/api/test',
    register: '/api/auth/register',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
} as const;
