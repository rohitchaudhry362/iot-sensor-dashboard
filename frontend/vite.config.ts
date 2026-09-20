import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Same-origin in development, so the SameSite=Strict refresh cookie works without CORS.
    proxy: {
      '/api': { target: process.env.VITE_BACKEND_URL ?? 'http://localhost:4000', changeOrigin: true },
      // ws so the proxy forwards the upgrade request, not just the polling handshake socket.io starts with.
      '/socket.io': { target: process.env.VITE_BACKEND_URL ?? 'http://localhost:4000', changeOrigin: true, ws: true },
    },
  },
});
