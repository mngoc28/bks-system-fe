import { bookingApi } from "@/api/bookingApi";
import type { ErrorResponse } from "@/api/types";
import type { BookingDetailResponse, CreateBookingRequest, SearchBookingRequest, SearchBookingResponse, UpdateBookingRequest } from "@/dataHelper/booking.dataHelper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toastError, toastSuccess } from "@/components/ui/toast";

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

type BookingsQueryOptions = {
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
};

// Hook to fetch bookings with search parameters
export const useBookingsQuery = (params: SearchBookingRequest, options?: BookingsQueryOptions) => {
  const { t } = useTranslation();
  return useQuery<SearchBookingResponse, Error>({
    queryKey: ["bookings", params],
    staleTime: options?.staleTime,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    queryFn: async () => {
      try {
        const res = await bookingApi.searchBookings(params);
        return res;
      } catch (error) {
        toastError(getErrorMessage(error, t("bookings.error_getting_bookings")));
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
      toastSuccess(t("bookings.deleted_successfully"));
    },
    onError: (error) => {
      toastError(getErrorMessage(error, t("error_deleting_booking")));
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
      toastSuccess(t("bookings.confirmed_successfully"));
    },
    onError: (error) => {
      toastError(getErrorMessage(error, t("bookings.error_confirming_booking")));
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
        toastError(getErrorMessage(error, t("bookings.error_getting_details")));
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
      toastSuccess(t("bookings.updated_successfully"));
    },
    onError: (error) => {
      toastError(getErrorMessage(error, t("bookings.error_updating_booking")));
    },
  });
};
