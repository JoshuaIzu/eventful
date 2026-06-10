import axios from "axios";
import { queryClient } from "./query-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Standard API: uses Bearer JWT
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Scan API: uses x-scan-id (no JWT)
export const scanApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach JWT to standard API
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("eventful_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Attach scan password to scan API
scanApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    let scanPassword = localStorage.getItem("eventful_scan_password");
    // Fallback to env variable if present
    if (!scanPassword && process.env.SCAN_PASSWORD) {
      scanPassword = process.env.SCAN_PASSWORD;
    }
    if (scanPassword) config.headers["x-scan-id"] = scanPassword;
  }
  return config;
});

// Global 401 handler for standard API
// Skip redirect for /auth/me — that just means the user isn't logged in,
// and useAuth's catch block already handles it gracefully.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthCheck = error.config?.url?.endsWith("/auth/me");
    if (error.response?.status === 401 && !isAuthCheck) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("eventful_token");
        localStorage.removeItem("eventful_user");
        queryClient.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Helpers

export const post = <T>(url: string, data?: any) =>
  api.post<T>(url, data).then((r) => r.data);

export default api;
