import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewApi, SubmitReviewParams } from "@/api/reviewApi";
import { toastError, toastSuccess } from "@/components/ui/toast";

export const useLandingReviewsQuery = () => {
  return useQuery({
    queryKey: ["landingReviews"],
    queryFn: async () => {
      const response = await reviewApi.getLandingReviews();
      return response.data;
    },
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
