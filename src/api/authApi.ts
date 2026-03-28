import { User } from "@/components/type";
import { CheckPermissionResponse, LoginResponse, LogoutResponse, RefreshTokenResponse } from "@/dataHelper/auth.dataHelper";
import { ErrorResponse } from "react-router";
import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";

export const authApi = {
  login: (data: User): Promise<LoginResponse> => axiosClient.post("admin/auth/login", data),
  register: (data: User): Promise<LoginResponse> => axiosClient.post("admin/auth/register", data),
  logout: (): Promise<LogoutResponse> => axiosClient.post("admin/auth/logout"),
  refresh: (): Promise<RefreshTokenResponse> => axiosClient.post("auth/refresh"),
  checkPermission: (): Promise<ApiResponse<CheckPermissionResponse>> => axiosClient.get("auth/check-permission"),
  // Verify email token
  verifyEmail: (token: string): Promise<ApiResponse<{data: string}> | ErrorResponse> => 
    axiosClient.get(`admin/auth/verify-email/${token}`),
  // Reset token verify email
  resetTokenVerifyEmail: (token: string): Promise<ApiResponse<{data: string}>> => 
    axiosClient.post(`admin/auth/reset-token-verify-email`, { token }),

  // Set password for the first time
  setPassword: (token: string, password: string, confirmPassword: string): Promise<ApiResponse<{data: string}> | ErrorResponse> => 
    axiosClient.post(`set-password/${token}`, { token, password, password_confirmation: confirmPassword }),
};
