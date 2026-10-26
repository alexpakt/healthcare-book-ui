import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : '');

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const SESSION_PROBE_URLS = ['/api/auth/login', '/api/auth/me', '/api/auth/logout'];
const PUBLIC_PATHS = ['/login', '/register'];

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? '';
    const isSessionProbe = SESSION_PROBE_URLS.some((probe) => url.includes(probe));
    if (
      error.response?.status === 401 &&
      !isSessionProbe &&
      !PUBLIC_PATHS.includes(window.location.pathname)
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
