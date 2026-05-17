import { ROUTERS } from "@/constant";
import { getLanguageStorage } from "@/store/useLanguage";
import { useUserStore } from "@/store/useUserStore";
import { getAccessToken } from "@/utils/storage";
import { isTokenExpired } from "@/utils/tokenUtils";
import axios, { AxiosError } from "axios";
import { cancelAllRequests, getAbortSignal } from "./abortService";
import { ErrorResponse } from "./types";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    config.signal = getAbortSignal();
    const token = getAccessToken();

    if (token && isTokenExpired(token)) {
      if (useUserStore.getState().isAuthenticated) {
        useUserStore.getState().logout();
        cancelAllRequests();
        const currentPath = window.location.pathname;
        if (currentPath.startsWith("/partner")) {
          window.location.href = ROUTERS.PARTNER_LOGIN;
        } else if (currentPath.startsWith("/bks-stay")) {
          window.location.href = "/bks-stay/login";
        } else {
          window.location.href = ROUTERS.LOGIN;
        }
        return Promise.reject(new Error("Token expired"));
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Accept-Language"] = getLanguageStorage();
    
    // If data is FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response.data?.code === 401) {
      if (useUserStore.getState().isAuthenticated) {
        useUserStore.getState().logout();
        cancelAllRequests();
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
    return response.data ?? response;
  },
  (error: AxiosError<ErrorResponse>) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    if (error.response?.data?.code === 401) {
      if (useUserStore.getState().isAuthenticated) {
        useUserStore.getState().logout();
        cancelAllRequests();
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

export default axiosClient;
