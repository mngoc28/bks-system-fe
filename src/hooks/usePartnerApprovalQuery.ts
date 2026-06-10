import { partnerApprovalApi } from "@/api/partnerApprovalApi";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const PENDING_APPROVAL_STATUS = 3;

const pendingListQueryKey = ["partner-approval", "pending-list"] as const;

const pendingListQueryOptions = {
  queryKey: pendingListQueryKey,
  queryFn: async () => {
    const response = await partnerApprovalApi.getPendingList();
    return response.data ?? [];
  },
  staleTime: 30_000,
  refetchOnWindowFocus: false,
} as const;

export const usePendingApprovalListQuery = () => useQuery(pendingListQueryOptions);

export const usePendingPartnersQuery = (enabled = true) =>
  useQuery({
    ...pendingListQueryOptions,
    enabled,
    select: (data) =>
      data.filter((item) => item.status === PENDING_APPROVAL_STATUS).slice(0, 5),
  });

export const usePartnerApprovalDetailQuery = (partnerId: number | null, enabled = true) =>
  useQuery({
    queryKey: ["partner-approval", "detail", partnerId],
    queryFn: async () => {
      if (partnerId == null) {
        return null;
      }
      const response = await partnerApprovalApi.getDetail(partnerId);
      return response.data ?? null;
    },
    enabled: enabled && partnerId != null,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

export const useVerifyPartnerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action, rejection_reason }: { id: number; action: "approve" | "reject"; rejection_reason?: string }) =>
      partnerApprovalApi.verify(id, { action, rejection_reason }),
    onSuccess: (response) => {
      toastSuccess(response.message || "Xử lý đối tác thành công.");
      queryClient.invalidateQueries({ queryKey: ["partner-approval"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "total-partner"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toastError(error?.response?.data?.message || "Không thể xử lý đối tác.");
    },
  });
};
