import { AvatarResponse, ChangePasswordRequest, ChangePasswordResponse, DeleteUserResponse, ResetPasswordRequest, UpdateUserProfileRequest, UserFilters, UserProfile, UserProfileDetailResponse, UserProfileResponse } from "@/dataHelper/user.dataHelper";
import axiosClient from "./axiosClient";
import { AxiosResponse } from "axios";
import { ApiResponse } from "./types";

export const userApi = {
  getProfile: (config?: any): Promise<ApiResponse<UserProfile>> => axiosClient.get(`admin/user/profile`, config),

  getProfileById: (id: number): Promise<UserProfileDetailResponse> => axiosClient.get(`admin/user/profile/${id}`),

  updateProfile: (data: UpdateUserProfileRequest): Promise<AxiosResponse<string>> => axiosClient.put(`admin/user/profile`, data),

  changePassword: (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => axiosClient.put("admin/user/profile/change-password", data),

  getAllUsers: (data: UserFilters): Promise<UserProfileResponse> => axiosClient.get("admin/users", { params: data }),

  getUserById: (id: number): Promise<UserProfileDetailResponse> => axiosClient.get(`admin/users/${id}`),

  createUser: (data: UpdateUserProfileRequest): Promise<UserProfileResponse> => axiosClient.post(`admin/users/create`, data),

  deleteUser: (id: number): Promise<DeleteUserResponse> => axiosClient.delete(`admin/users/${id}`),

  updateUser: (id: number, data: UpdateUserProfileRequest): Promise<UserProfileResponse> => axiosClient.put(`admin/users/${id}`, data),

  updateUserStatus: (id: number, status: 1 | 2): Promise<UserProfileDetailResponse> =>
    axiosClient.put(`admin/users/${id}/status`, { status }),

  resetPassword: (id: number, data: ResetPasswordRequest): Promise<UserProfileResponse> => axiosClient.post(`admin/users/reset-password/${id}`, data),

  uploadAvatar: (id: number, data: FormData): Promise<AvatarResponse> => axiosClient.post(`admin/users/avatar/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
