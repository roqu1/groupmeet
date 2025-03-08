const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const API_CONFIG = {
  baseUrl: BACKEND_URL,
  endpoints: {
    test: '/api/test',
  },
} as const;
