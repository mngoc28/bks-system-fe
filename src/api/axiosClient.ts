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
    const requestConfig = config as typeof config & { skipAbortSignal?: boolean };

    if (!requestConfig.skipAbortSignal && !requestConfig.signal) {
      requestConfig.signal = getAbortSignal();
    }
    const token = getAccessToken();

    const isAuthRequest = config.url && (
      config.url.includes("login") ||
      config.url.includes("register") ||
      config.url.includes("set-password") ||
      config.url.includes("verify-email")
    );

    const isLoginPage = window.location.pathname.includes("/login") ||
                        window.location.pathname.includes("/register") ||
                        window.location.pathname.includes("/set-password");

    if (token && isTokenExpired(token) && !isAuthRequest && !isLoginPage) {
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

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Accept-Language"] = getLanguageStorage();
    
    // If data is FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response.status === 401 || response.data?.code === 401) {
      const isLoginRequest = response.config?.url && (
        response.config.url.includes("login") ||
        response.config.url.includes("register") ||
        response.config.url.includes("set-password")
      );
      if (!isLoginRequest) {
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
    if (error.response?.status === 401 || error.response?.data?.code === 401) {
      const isLoginRequest = error.config?.url && (
        error.config.url.includes("login") ||
        error.config.url.includes("register") ||
        error.config.url.includes("set-password")
      );
      if (!isLoginRequest) {
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
