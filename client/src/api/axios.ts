import axios, { isAxiosError } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? "";
      const isAuthEndpoint =
        requestUrl.includes("/api/auth/login") ||
        requestUrl.includes("/api/auth/register");

      if (!isAuthEndpoint) {
        localStorage.removeItem("token");
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
