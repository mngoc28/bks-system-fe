import axiosClient from "../axiosClient";
import type { CreateBookingUserRequest, PublicBookingLookupRequest, PublicBookingSummary } from "@/dataHelper/EU/booking.dataHelper";

export type { CreateBookingUserRequest, PublicBookingLookupRequest, PublicBookingSummary };

export const bookingApi = {
    // Get room details (public)
    getRoomDetails: (roomId: number): Promise<any> =>
        axiosClient.get(`rooms/${roomId}`) as Promise<any>,

    // Create booking for user (public)
    createBookingUser: (roomId: number, data: CreateBookingUserRequest): Promise<any> =>
        axiosClient.post(`bookings/${roomId}/user-create`, data),

    /** To look up your application publicly: email + code (no login required). */
    lookupBooking: (data: PublicBookingLookupRequest): Promise<any> =>
        axiosClient.post(`bookings/lookup`, data),

    /** Update booking email publicly (for pending bookings only). */
    updateBookingEmail: (data: { booking_code?: string; old_email?: string; new_email: string }): Promise<any> =>
        axiosClient.post(`bookings/update-email`, data),
}