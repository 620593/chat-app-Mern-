// In LOCAL DEV  → backendUrl is "" → fetch("/api/...") is handled by Vite proxy → backend at localhost:5000
// In PRODUCTION → backendUrl is the full Render/Railway URL from VITE_BACKEND_URL env var
const backendUrl = (() => {
  const url =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_URL ||
    "";
  // Strip any trailing slashes
  return url.replace(/\/+$/, "");
})();

export const getApiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${backendUrl}/api${normalizedPath}`;
};

// Export the base socket URL for SocketContext
// In dev: "" means connect to current host (Vite dev server, which won't proxy socket.io)
// so we return the explicit localhost:5000 for socket only in dev
export const getSocketUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "");
  }
  if (import.meta.env.VITE_URL) {
    return import.meta.env.VITE_URL.replace(/\/+$/, "");
  }
  // Local dev fallback — socket.io must connect directly (Vite cannot proxy WebSocket upgrades)
  return "http://localhost:5000";
};
