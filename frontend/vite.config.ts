import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Same origin for the browser, so no CORS. `vite preview` in Docker reuses these rules (preview.proxy defaults
    // to server.proxy), with VITE_BACKEND_URL pointing at the backend container.
    proxy: {
      '/api': { target: process.env.VITE_BACKEND_URL ?? 'http://localhost:4000', changeOrigin: true },
      // ws so the proxy forwards the upgrade request, not just the polling handshake socket.io starts with.
      '/socket.io': { target: process.env.VITE_BACKEND_URL ?? 'http://localhost:4000', changeOrigin: true, ws: true },
    },
  },
});
