import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewApi, SubmitReviewParams } from "@/api/reviewApi";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { HOMEPAGE_QUERY_OPTIONS, PUBLIC_DETAIL_QUERY_OPTIONS } from "@/lib/queryCache";

export const useLandingReviewsQuery = (enabled = true) => {
  return useQuery({
    queryKey: ["landingReviews"],
    queryFn: async () => {
      const response = await reviewApi.getLandingReviews();
      return response.data;
    },
    enabled,
    ...HOMEPAGE_QUERY_OPTIONS,
  });
};

export const useRoomReviewsQuery = (roomId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["roomReviews", roomId],
    queryFn: async () => {
      const response = await reviewApi.getRoomReviews(roomId);
      return response.data;
    },
    enabled: (options?.enabled ?? true) && !!roomId,
    ...PUBLIC_DETAIL_QUERY_OPTIONS,
  });
};

export const usePartnerReviewsQuery = (partnerId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["partnerReviews", partnerId],
    queryFn: async () => {
      const response = await reviewApi.getPartnerReviews(partnerId);
      return response.data;
    },
    enabled: (options?.enabled ?? true) && !!partnerId,
    ...PUBLIC_DETAIL_QUERY_OPTIONS,
  });
};

export const useBookingReviewsQuery = (bookingId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["bookingReviews", bookingId],
    queryFn: async () => {
      const response = await reviewApi.getBookingReviews(bookingId);
      return response.data;
    },
    enabled: (options?.enabled ?? true) && !!bookingId,
  });
};

export const useSubmitReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubmitReviewParams) => {
      const response = await reviewApi.submitReview(data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      toastSuccess("Đánh giá của bạn đã được gửi thành công!");
      // Invalidate related review queries so the UI updates
      void queryClient.invalidateQueries({ queryKey: ["bookingReviews", variables.booking_id] });
      void queryClient.invalidateQueries({ queryKey: ["landingReviews"] });
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại.";
      toastError(errorMsg);
    },
  });
};
