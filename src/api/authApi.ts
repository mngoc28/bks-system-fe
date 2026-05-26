import { User } from "@/components/type";
import { CheckPermissionResponse, LoginResponse, LogoutResponse, RefreshTokenResponse } from "@/dataHelper/auth.dataHelper";
import { ErrorResponse } from "react-router";
import { AxiosRequestConfig } from "axios";
import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";

const logoutRequestConfig: AxiosRequestConfig & { skipAbortSignal: boolean } = {
  skipAbortSignal: true,
};

export const authApi = {
  login: (data: User): Promise<LoginResponse> => axiosClient.post("admin/auth/login", data),
  stayLogin: (data: User): Promise<LoginResponse> => axiosClient.post("stay/auth/login", data),
  partnerLogin: (data: User): Promise<LoginResponse> => axiosClient.post("partner/auth/login", data),
  register: (data: User): Promise<LoginResponse> => axiosClient.post("admin/auth/register", data),
  logout: (): Promise<LogoutResponse> => axiosClient.post("admin/auth/logout", undefined, logoutRequestConfig),
  /** Đăng xuất cổng Stay (end user) — JWT chung, không gọi admin/auth/logout. */
  stayLogout: (): Promise<LogoutResponse> => axiosClient.post("stay/auth/logout", undefined, logoutRequestConfig),
  partnerLogout: (): Promise<LogoutResponse> => axiosClient.post("partner/auth/logout", undefined, logoutRequestConfig),
  refresh: (): Promise<RefreshTokenResponse> => axiosClient.post("auth/refresh"),
  checkPermission: (): Promise<ApiResponse<CheckPermissionResponse>> => axiosClient.get("auth/check-permission"),
  // Verify email token
  verifyEmail: (token: string): Promise<ApiResponse<{data: string}> | ErrorResponse> => 
    axiosClient.get(`admin/auth/verify-email/${token}`),
  // Reset token verify email
  resetTokenVerifyEmail: (token: string): Promise<ApiResponse<{data: string}>> => 
    axiosClient.post(`admin/auth/reset-token-verify-email`, { token }),

  // Set password for the first time
  setPassword: (token: string, password: string, confirmPassword: string): Promise<ApiResponse<{ status_code: string; role: string }> | ErrorResponse> => 
    axiosClient.post(`set-password/${token}`, { token, password, password_confirmation: confirmPassword }),
};
