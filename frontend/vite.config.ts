import { defineConfig, loadEnv  } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { URL } from 'url'

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 5173,
      watch: {
        usePolling: true,
      },
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
      allowedHosts: env.VITE_BACKEND_URL ? [new URL(env.VITE_BACKEND_URL).hostname] : []
    },
  };
});
