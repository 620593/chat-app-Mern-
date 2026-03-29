import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // If a backend URL is explicitly set, use it; otherwise default to localhost:5000
  const backendUrl =
    env.VITE_BACKEND_URL && env.VITE_BACKEND_URL.trim()
      ? env.VITE_BACKEND_URL.trim().replace(/\/+$/, "")
      : "http://localhost:5000";

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        // REST API — proxy /api/* to backend
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        // Socket.io — proxy WebSocket upgrades to backend
        "/socket.io": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
