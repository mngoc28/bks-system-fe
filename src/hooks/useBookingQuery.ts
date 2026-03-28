import { bookingApi } from "@/api/bookingApi";
import type { ErrorResponse } from "@/api/types";
import type { BookingDetailResponse, CreateBookingRequest, SearchBookingRequest, SearchBookingResponse, UpdateBookingRequest } from "@/dataHelper/booking.dataHelper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Helper to extract error message from AxiosError
const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as AxiosError<ErrorResponse>;
  return err?.response?.data?.message || (typeof err?.message === "string" ? err.message : undefined) || fallback;
};

// Hook to create a new booking
export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateBookingRequest) => bookingApi.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

// Hook to fetch bookings with search parameters
export const useBookingsQuery = (params: SearchBookingRequest) => {
  const { t } = useTranslation();
  return useQuery<SearchBookingResponse, Error>({
    queryKey: ["bookings", params],
    queryFn: async () => {
      try {
        const res = await bookingApi.searchBookings(params);
        return res;
      } catch (error) {
        toast.error(getErrorMessage(error, t("bookings.error_getting_bookings")), { style: { background: "#EF4444", color: "#FFFFFF" }, className: "border-red-500" });
        throw error as Error;
      }
    },
  });
};

// Hook to delete a booking
export const useDeleteBookingMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => bookingApi.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success(t("bookings.deleted_successfully"), {
        style: { background: "#10B981", color: "#FFFFFF" },
        className: "border-green-500",
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("error_deleting_booking")), { style: { background: "#EF4444", color: "#FFFFFF" }, className: "border-red-500" });
    },
  });
};

// Hook to confirm a booking
export const useConfirmBookingMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => bookingApi.confirmBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success(t("bookings.confirmed_successfully"), {
        style: { background: "#10B981", color: "#FFFFFF" },
        className: "border-green-500",
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("bookings.error_confirming_booking")), { style: { background: "#EF4444", color: "#FFFFFF" }, className: "border-red-500" });
    },
  });
};

// Hook to fetch detailed information of a booking
export const useBookingDetailQuery = (id: number | null, enabled: boolean = true) => {
  const { t } = useTranslation();
  return useQuery<BookingDetailResponse, Error>({
    queryKey: ["bookings", id],
    enabled: !!id && enabled,
    queryFn: async () => {
      try {
        const res = await bookingApi.getBookingDetail(id as number);
        return res;
      } catch (error) {
        toast.error(getErrorMessage(error, t("bookings.error_getting_details")), { style: { background: "#EF4444", color: "#FFFFFF" }, className: "border-red-500" });
        throw error as Error;
      }
    },
  });
};

// Hook to update a booking
export const useUpdateBookingMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateBookingRequest }) => bookingApi.updateBooking(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success(t("bookings.updated_successfully"), {
        style: { background: "#10B981", color: "#FFFFFF" },
        className: "border-green-500",
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("bookings.error_updating_booking")), { style: { background: "#EF4444", color: "#FFFFFF" }, className: "border-red-500" });
    },
  });
};
