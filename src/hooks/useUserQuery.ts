import { userApi } from "@/api/userApi";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { ResetPasswordRequest, UpdateUserProfileRequest, UserFilters } from "@/dataHelper/user.dataHelper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// get user profile
export const useGetUserProfileQuery = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async ({ signal }) => {
      const response = await userApi.getProfile({ signal });
      return response;
    },
    retry: 1,
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
};

// get user profile by id
export const useGetUserProfileByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const response = await userApi.getProfileById(id);
      return response;
    },
    enabled: !!id,
  });
};

// Update user profile mutation
export const useUpdateUserProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
    },
  });
};

// Change password mutation
export const useChangePasswordMutation = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string; new_password_confirmation: string }) => userApi.changePassword(data),
    onSuccess: () => {
      toastSuccess(t("user.change_password_success"));
    },
    onError: () => {
      toastError(t("user.change_password_failed"));
    },
  });
};

// create user mutation
export const useCreateUserMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => userApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toastSuccess(t("user.create_user_success"));
    },
    onError: (error: any) => {
      if (!error?.response?.data?.errors?.email) {
        toastError(t("user.create_user_failed"));
      }
      throw error;
    },
  });
};

// get all users
export const useGetAllUsersQuery = (data: UserFilters) => {
  return useQuery({
    queryKey: ["users", data],
    queryFn: async () => {
      const response = await userApi.getAllUsers(data);
      return response;
    },
  });
};

// get user by id
export const useGetUserByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await userApi.getUserById(id);
      return response;
    },
    enabled: !!id,
  });
};

// delete user mutation
export const useDeleteUserMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toastSuccess(t("user.delete_user_success"));
    },
    onError: () => {
      toastError(t("user.delete_user_failed"));
    },
  });
};

export const useUpdateUserStatusMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 1 | 2 }) => userApi.updateUserStatus(id, status),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["users", "pending-queue"] });
      queryClient.invalidateQueries({ queryKey: ["users", "blocked-queue"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "total-user"] });
      toastSuccess(response.message || t("user.status_update_success", { defaultValue: "Cập nhật trạng thái thành công." }));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toastError(error?.response?.data?.message || t("user.update_user_failed"));
    },
  });
};

export const usePendingUsersQuery = (enabled = true) => {
  return useQuery({
    queryKey: ["users", "pending-queue"],
    queryFn: async () => {
      const response = await userApi.getAllUsers({ status: "0", role: "user", page: 1, per_page: 5 });
      return response.data?.data ?? [];
    },
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};

export const useBlockedUsersQuery = (enabled = true) => {
  return useQuery({
    queryKey: ["users", "blocked-queue"],
    queryFn: async () => {
      const response = await userApi.getAllUsers({ status: "2", role: "user", page: 1, per_page: 3 });
      return response.data?.data ?? [];
    },
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};

// reset password mutation
export const useUpdateUserMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserProfileRequest }) => userApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toastSuccess(t("user.update_user_success"));
    },
    onError: () => {
      toastError(t("user.update_user_failed"));
    },
  });
};

// Reset password mutation
export const useResetPasswordMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResetPasswordRequest }) => 
      userApi.resetPassword(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toastSuccess(t("user.reset_password_success"));
    },
    onError: () => {
      toastError(t("user.reset_password_failed"));
    },
  });
};

// Upload avatar mutation
export const useUploadAvatarMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: FormData }) => userApi.uploadAvatar(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
};
