import axios from "axios";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🧠 Helper to get tokens safely (avoids SSR/localStorage errors)
function getLocalToken(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

// 🧹 Helper to clear tokens securely
function clearAuthTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
}

// 🪝 Attach token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = getLocalToken("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚀 Function to refresh access token
async function refreshAccessToken() {
  const refreshToken = getLocalToken("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    const newToken = response.data?.accessToken;
    if (newToken) {
      localStorage.setItem("token", newToken);
      return newToken;
    }

    return null;
  } catch {
    return null; // refresh failed
  }
}

// 🧠 Flag to avoid multiple refresh attempts at once
let isRefreshing = false;
let failedQueue: any[] = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
}

// ⚡ Centralized error handling and token refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 🔄 Handle expired token case
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the failed requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(Promise.reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const newToken = await refreshAccessToken();

      if (newToken) {
        processQueue(null, newToken);
        isRefreshing = false;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest); // retry original request
      } else {
        processQueue(error, null);
        isRefreshing = false;
        clearAuthTokens();

        Swal.fire(
          "Session Expired",
          "Please log in again to continue.",
          "info"
        ).then(() => {
          window.location.href = "";
        });

        return Promise.reject(error);
      }
    }

    // 💡 Other common errors
    switch (status) {
      case 400:
        Swal.fire("Bad Request", "Your request could not be processed.", "warning");
        break;
      case 403:
        Swal.fire("Access Denied", "You don’t have permission to perform this action.", "error");
        break;
      case 404:
        Swal.fire("Not Found", "The requested resource doesn’t exist.", "warning");
        break;
      case 408:
        Swal.fire("Timeout", "The server took too long to respond. Try again.", "info");
        break;
      case 500:
        Swal.fire("Server Error", "Something went wrong on our end.", "error");
        break;
      case 502:
      case 503:
      case 504:
        Swal.fire("Service Unavailable", "The server is temporarily unavailable. Try later.", "info");
        break;
      default:
        Swal.fire("Error", "An unexpected error occurred.", "error");
    }

    return Promise.reject(error);
  }
);

interface APIConfig {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
}

// Generic function for protected requests
export async function fetchProtectedData({
  endpoint,
  method = "GET",
  body,
}: APIConfig) {
  const response = await api.request({
    method,
    url: endpoint,
    data: body,
  });

  return response.data;
}

export default api;
