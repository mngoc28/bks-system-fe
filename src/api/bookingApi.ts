import type { BookingDetailResponse, BookingResponse, CreateBookingRequest, SearchBookingRequest, SearchBookingResponse, UpdateBookingRequest } from "@/dataHelper/booking.dataHelper";
import axiosClient from "./axiosClient";

export const bookingApi = {
  // Admin list is the intended source for management UI
  searchBookings: (params: SearchBookingRequest): Promise<SearchBookingResponse> => axiosClient.get("admin/bookings", { params }) as Promise<SearchBookingResponse>,

  // Create booking (public)
  createBooking: (data: CreateBookingRequest): Promise<BookingResponse> => axiosClient.post("admin/bookings", data) as Promise<BookingResponse>,

  // Get detail for a booking (public)
  getBookingDetail: (id: number): Promise<BookingDetailResponse> => axiosClient.get(`admin/bookings/${id}`) as Promise<BookingDetailResponse>,

  // Cancel booking (public)
  cancelBooking: (id: number): Promise<BookingResponse> => axiosClient.put(`admin/bookings/${id}/cancel`) as Promise<BookingResponse>,

  // Update booking (protected - admin & partner)
  updateBooking: (id: number, payload: UpdateBookingRequest): Promise<BookingResponse> => axiosClient.put(`admin/bookings/${id}`, payload) as Promise<BookingResponse>,

  // Partner confirm endpoint (protected - admin & partner)
  confirmBooking: (id: number): Promise<BookingResponse> => axiosClient.put(`admin/bookings/${id}/confirm`) as Promise<BookingResponse>,

  // Cancel booking by admin (protected - admin & partner)
  cancelBookingByAdmin: (id: number): Promise<BookingResponse> => axiosClient.put(`admin/bookings/${id}/cancel`) as Promise<BookingResponse>,

  // Delete booking (protected - admin only)
  deleteBooking: (id: number): Promise<BookingResponse> => axiosClient.delete(`admin/bookings/${id}`) as Promise<BookingResponse>,
};
