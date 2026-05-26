import { ApiResponse } from "./types";
import axiosClient from "./axiosClient";

export interface Review {
  id: number;
  user_id: number;
  booking_id?: number;
  room_id?: number;
  partner_id?: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  room?: {
    id: number;
    title: string;
  };
  partner?: {
    id: number;
    partner_info?: {
      id: number;
      company_name: string;
    };
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  average_rating: number;
  total_count: number;
}

export interface SubmitReviewParams {
  booking_id: number;
  room_rating?: number;
  room_comment?: string;
  partner_rating?: number;
  partner_comment?: string;
}

export const reviewApi = {
  submitReview: async (data: SubmitReviewParams): Promise<ApiResponse<any>> => {
    return axiosClient.post("stay/reviews", data);
  },

  getBookingReviews: async (bookingId: number): Promise<ApiResponse<Review[]>> => {
    return axiosClient.get(`stay/reviews/booking/${bookingId}`);
  },

  getLandingReviews: async (): Promise<ApiResponse<Review[]>> => {
    return axiosClient.get("home/reviews");
  },

  getRoomReviews: async (roomId: number): Promise<ApiResponse<ReviewsResponse>> => {
    return axiosClient.get(`rooms/${roomId}/reviews`);
  },

  getPartnerReviews: async (partnerId: number): Promise<ApiResponse<ReviewsResponse>> => {
    return axiosClient.get(`partners/detail/${partnerId}/reviews`);
  },
};
