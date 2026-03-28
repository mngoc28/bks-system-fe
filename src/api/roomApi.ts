import { CreateRoomRequest, Room, RoomResponse, SearchRoomRequest, SearchRoomResponse, UpdateRoomRequest } from "@/dataHelper/room.dataHelper";
import axiosClient from "./axiosClient";

export const roomApi = {
  searchRooms: (params: SearchRoomRequest): Promise<SearchRoomResponse> => axiosClient.get("admin/rooms/search", { params }),
  getRoomById: (id: number): Promise<RoomResponse> => axiosClient.get(`admin/rooms/${id}`),
  createRoom: (data: CreateRoomRequest): Promise<RoomResponse> => axiosClient.post("admin/rooms/store", data),
  updateRoom: (id: number, data: UpdateRoomRequest): Promise<RoomResponse> => axiosClient.put(`admin/rooms/${id}`, data),
  deleteRoom: (id: number): Promise<{ status: string; message: string | null }> => axiosClient.delete(`admin/rooms/${id}`),
  getRoomsByBuilding: (buildingId: number): Promise<{ data: Room[] }> => axiosClient.get(`admin/rooms/building/${buildingId}`),
};