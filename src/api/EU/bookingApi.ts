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
}