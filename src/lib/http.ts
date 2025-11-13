import axios, { AxiosError } from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ENV } from "./env";

export const http = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true, // Required for HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - can be used for adding auth headers if needed in future
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Remove Content-Type header for FormData - browser will set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    
    // Request logging (optional, can be removed in production)
    if (import.meta.env.DEV) {
      console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors, 401 redirects, and response normalization
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // Success response - return as is
    return response;
  },
  (error: AxiosError) => {
    // Error logging
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as { message?: string | string[]; error?: string };
      
      console.error(`[HTTP Error] ${status} ${error.config?.url}`, {
        message: data?.message || error.message,
        error: data?.error,
      });

      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        // Clear any client-side auth state
        import("../store/auth.store").then((module) => {
          module.useAuthStore.getState().logout();
        });
        
        // Redirect to login page
        // Only redirect if not already on login page to avoid infinite loops
        if (window.location.pathname !== "/login") {
          // Use window.location.href for a clean redirect that ensures
          // all state is cleared and the login page loads fresh
          window.location.href = "/login";
        }
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error("[HTTP Error] Network error - no response received", error.request);
    } else {
      // Something else happened
      console.error("[HTTP Error] Request setup error", error.message);
    }

    // Normalize error response
    // Handle both string and array error messages (API can return array for validation errors)
    const apiMessage = (error.response?.data as { message?: string | string[] })?.message;
    let errorMessage: string;
    if (Array.isArray(apiMessage)) {
      // Join array of validation errors
      errorMessage = apiMessage.join(", ");
    } else if (typeof apiMessage === "string") {
      errorMessage = apiMessage;
    } else {
      errorMessage = error.message || "An unexpected error occurred";
    }

    const normalizedError = {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    };

    return Promise.reject(normalizedError);
  }
);


