import { getAccessToken } from "@/utils/storage";
import axios, { AxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
      // Redirect đến trang đăng nhập hoặc xử lý lỗi xác thực
      localStorage.removeItem("token");
      window.location.href = "/login";
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
