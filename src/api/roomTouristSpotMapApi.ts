import axiosClient from "./axiosClient";
import { Paginator, ApiResponse } from "./types";

export interface RoomTouristSpotMap {
  id: number;
  room_id: number;
  tourist_spot_id: number;
  distance_km: number | string | null;
  travel_time_minutes: number;
  priority_order: number;
  is_primary: boolean;
  source_type: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  room?: {
    id: number;
    title: string;
  };
  tourist_spot?: {
    id: number;
    name: string;
    slug: string;
    is_featured: boolean;
  };
}

export interface SaveRoomTouristSpotMapRequest {
  room_id: number;
  tourist_spot_id: number;
  distance_km?: number | null;
  travel_time_minutes: number;
  is_primary?: boolean;
  priority_order?: number;
  note?: string | null;
  apply_to_all_rooms?: boolean;
}

export interface UpdateRoomTouristSpotMapRequest {
  distance_km?: number | null;
  travel_time_minutes?: number;
  is_primary?: boolean;
  priority_order?: number;
  note?: string | null;
  apply_to_all_rooms?: boolean;
}

export const roomTouristSpotMapApi = {
  getMappings: (
    params: { room_id?: number; tourist_spot_id?: number; per_page?: number; page?: number },
    isPartner: boolean = false
  ): Promise<ApiResponse<Paginator<RoomTouristSpotMap>>> => {
    const prefix = isPartner ? "partner" : "admin";
    return axiosClient.get(`${prefix}/room-tourist-spot-maps`, { params });
  },

  getMappingDetail: (
    id: number,
    isPartner: boolean = false
  ): Promise<ApiResponse<RoomTouristSpotMap>> => {
    const prefix = isPartner ? "partner" : "admin";
    return axiosClient.get(`${prefix}/room-tourist-spot-maps/${id}`);
  },

  createMapping: (
    data: SaveRoomTouristSpotMapRequest,
    isPartner: boolean = false
  ): Promise<ApiResponse<RoomTouristSpotMap>> => {
    const prefix = isPartner ? "partner" : "admin";
    return axiosClient.post(`${prefix}/room-tourist-spot-maps`, data);
  },

  updateMapping: (
    id: number,
    data: UpdateRoomTouristSpotMapRequest,
    isPartner: boolean = false
  ): Promise<ApiResponse<RoomTouristSpotMap>> => {
    const prefix = isPartner ? "partner" : "admin";
    return axiosClient.put(`${prefix}/room-tourist-spot-maps/${id}`, data);
  },

  deleteMapping: (
    id: number,
    isPartner: boolean = false,
    applyToAllRooms: boolean = false
  ): Promise<ApiResponse<null>> => {
    const prefix = isPartner ? "partner" : "admin";
    return axiosClient.delete(`${prefix}/room-tourist-spot-maps/${id}`, {
      params: { apply_to_all_rooms: applyToAllRooms ? 1 : 0 }
    });
  },
};
