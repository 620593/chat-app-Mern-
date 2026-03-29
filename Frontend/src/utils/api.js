const rawBackendUrl =
	import.meta.env.VITE_BACKEND_URL ||
	import.meta.env.VITE_URL ||
	"http://localhost:5000";

const backendUrl = rawBackendUrl.replace(/\/+$/, "");

export const getApiUrl = (path) => {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${backendUrl}/api${normalizedPath}`;
};
