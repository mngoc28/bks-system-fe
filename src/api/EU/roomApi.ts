import axiosClient from "@/api/axiosClient";
import type { ApiResponse } from "@/api/types";
import {
    Room,
    type PublicRoomPageData,
    type SuggestedRoomsByProvinceParams,
    type SuggestedRoomsByTouristSpotParams,
} from "@/dataHelper/EU/room.dataHelper";

export interface PublicRoomListParams {
    partner_id?: number;
    province_id?: number;
    ward_id?: number;
    property_type_id?: number;
    keyword?: string;
    page?: number;
    per_page?: number;
    sort_by?: "cheapest_daily_price" | "people";
    sort_direction?: "asc" | "desc";
    with_details?: boolean;
    start_date?: string;
    end_date?: string;
    guests?: number;
    tourist_spot_slug?: string;
}

export const roomApi = {
    getRoomList: (params: PublicRoomListParams = {}): Promise<ApiResponse<Room[]>> => {
        return axiosClient.get<Room[]>("rooms/search", { params }) as unknown as Promise<ApiResponse<Room[]>>;
    },

    getPaginatedRoomList: (params: PublicRoomListParams): Promise<ApiResponse<PublicRoomPageData>> => {
        return axiosClient.get<PublicRoomPageData>("rooms/search", { params }) as unknown as Promise<ApiResponse<PublicRoomPageData>>;
    },

    getRoomDetail: (id: number): Promise<ApiResponse<any>> => {
        return axiosClient.get(`rooms/${id}`);
    },

    getTopRatedRooms: (limit = 12): Promise<ApiResponse<any>> => {
        return axiosClient.get("home/rooms/getTopRatedRoom", { params: { limit } });
    },

    getSuggestedRoomsByProvince: (
        params: SuggestedRoomsByProvinceParams = {},
    ): Promise<ApiResponse<any>> => {
        return axiosClient.get("home/rooms/rooms-by-province", { params });
    },

    getSuggestedRoomsByTouristSpot: (
        params: SuggestedRoomsByTouristSpotParams = {},
    ): Promise<ApiResponse<any>> => {
        return axiosClient.get("home/rooms/rooms-by-tourist-spot", { params });
    },

    getBookedDates: (id: number, params?: { start_date?: string; end_date?: string }): Promise<ApiResponse<string[]>> => {
        return axiosClient.get(`rooms/${id}/booked-dates`, { params });
    },
}