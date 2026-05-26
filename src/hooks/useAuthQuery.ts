import { authApi } from "@/api/authApi";
import { cancelAllRequests } from "@/api/abortService";
import { ApiResponse } from "@/api/types";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { CheckPermissionResponse, LoginPayload, RegisterPayload } from "@/dataHelper/auth.dataHelper";
import { clearAllDashboardDateRanges } from "@/utils/storage";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { ErrorResponse } from "react-router";

const prepareLogout = async (queryClient: QueryClient) => {
  await queryClient.cancelQueries();
  cancelAllRequests();
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {},
  });
};

export const useStayLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.stayLogin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {},
  });
};

export const usePartnerLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.partnerLogin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {},
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data: RegisterPayload) => authApi.register(data),
    onSuccess: () => {},
    onError: () => {},
  });
};

export const useLogoutMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onMutate: () => prepareLogout(queryClient),
    onSuccess: () => {
      localStorage.removeItem("token");
      queryClient.removeQueries({ queryKey: ["profile"] });
      clearAllDashboardDateRanges();
      toastSuccess(t("auth.logout_success"));
    },
    onError: () => {
      toastError(t("auth.logout_failed"));
    },
  });
};

export const useStayLogoutMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.stayLogout,
    onMutate: () => prepareLogout(queryClient),
    onSuccess: () => {
      localStorage.removeItem("token");
      queryClient.removeQueries({ queryKey: ["profile"] });
      clearAllDashboardDateRanges();
      toastSuccess(t("auth.logout_success"));
    },
    onError: () => {
      toastError(t("auth.logout_failed"));
    },
  });
};

export const usePartnerLogoutMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.partnerLogout,
    onMutate: () => prepareLogout(queryClient),
    onSuccess: () => {
      localStorage.removeItem("token");
      queryClient.removeQueries({ queryKey: ["profile"] });
      clearAllDashboardDateRanges();
      toastSuccess(t("partner_auth.logout_success") || "Đã đăng xuất khỏi cổng Đối tác");
    },
    onError: () => {
      toastError(t("partner_auth.logout_failed") || "Đăng xuất thất bại");
    },
  });
};

export const useCheckPermissionQuery = () => {
  return useQuery<ApiResponse<CheckPermissionResponse>>({
    queryKey: ["check-permission"],
    queryFn: async () => {
      const response = await authApi.checkPermission();
      return response;
    },
  });
};

// verify email token
export const useVerifyEmailTokenQuery = (token: string) => {
  return useQuery<ApiResponse<{data: string}> | ErrorResponse>({
    queryKey: ['verify-email-token', token],
    queryFn: async (): Promise<ApiResponse<{data: string}> | ErrorResponse> => {
      try {
        const response = await authApi.verifyEmail(token);
        return response;
      } catch (error) {
        return (error as AxiosError<ErrorResponse>)?.response?.data as ErrorResponse;
      }
    },
    enabled: !!token,
  });
}

// reset token verify email
export const useResetTokenVerifyEmailQuery = (token: string) => {
  return useMutation({
    mutationFn: () => authApi.resetTokenVerifyEmail(token),
    onSuccess: () => {
      return true;
    },
    onError: () => {
      return false;
    },
  });
}

// set password for the first time
export const useSetPasswordMutation = () => {
  return useMutation({
    mutationFn: ({ token, password, confirmPassword }: { token: string; password: string; confirmPassword: string }) => authApi.setPassword(token, password, confirmPassword),
    onSuccess: () => {
      return true;
    },
    onError: () => {
      return false;
    },
  });
}
