import { getAccessToken } from "@/utils/storage";
import axios, { AxiosRequestConfig } from "axios";

import { useUserStore } from "@/store/useUserStore";
import { ROUTERS } from "@/constant";
import { getLanguageStorage } from "@/store/useLanguage";

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_URL || "http://localhost:8000";

// Tạo instance Axios với các cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor cho request
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token chuẩn từ storage utility
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Set Accept-Language header
    config.headers["Accept-Language"] = getLanguageStorage();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Thêm interceptor cho response
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data ?? response;
  },
  (error) => {
    // Xử lý lỗi: 401 Unauthorized, 403 Forbidden, v.v.
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const isLoginRequest = error.config?.url && (
        error.config.url.includes("login") ||
        error.config.url.includes("register") ||
        error.config.url.includes("set-password")
      );
      if (!isLoginRequest) {
        useUserStore.getState().logout();
        const currentPath = window.location.pathname;
        if (currentPath.startsWith("/partner")) {
          window.location.href = ROUTERS.PARTNER_LOGIN;
        } else if (currentPath.startsWith("/bks-stay")) {
          window.location.href = "/bks-stay/login";
        } else {
          window.location.href = ROUTERS.LOGIN;
        }
      }
    }
    return Promise.reject(error);
  },
);

const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    return axiosInstance.get<T>(url, config);
  },
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return axiosInstance.post<T>(url, data, config);
  },
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return axiosInstance.put<T>(url, data, config);
  },
  delete: <T>(url: string, config?: AxiosRequestConfig) => {
    return axiosInstance.delete<T>(url, config);
  },
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return axiosInstance.patch<T>(url, data, config);
  },
};

export default apiService;
