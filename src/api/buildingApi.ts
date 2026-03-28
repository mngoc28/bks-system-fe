import { Building, BuildingListDataResponse, BuildingDetail, BuildingType, CreateBuildingRequest, SearchBuildingRequest, UpdateBuildingRequest } from "@/dataHelper/building.dataHelper";
import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";

export const buildingApi = {
  // Admin list is the intended source for management UI
  searchBuildings: (params: SearchBuildingRequest): Promise<ApiResponse<BuildingListDataResponse>> => axiosClient.get("admin/buildings/searchAll", { params }),
  // Get all buildings no pagination
  getAllBuildings: (): Promise<{ data: Building[] }> => axiosClient.get("admin/buildings/all"),
  // Get building types
  getBuildingTypes: (): Promise<ApiResponse<BuildingType[]>> => axiosClient.get("admin/buildings/types"),
  // Create building (protected - admin only)
  createBuilding: (data: CreateBuildingRequest): Promise<ApiResponse<string>> => axiosClient.post("admin/buildings", data),
  // Get building by id (protected - admin only)
  getBuildingById: (id: number): Promise<ApiResponse<BuildingDetail>> => axiosClient.get(`admin/buildings/${id}`),
  // Get bookings by building id (protected - admin only)
  getBookingsByBuilding: (id: number): Promise<ApiResponse<string>> => axiosClient.get(`admin/buildings/${id}/bookings`),
  // Update building (protected - admin only)
  updateBuilding: (id: number, data: UpdateBuildingRequest): Promise<ApiResponse<string>> => axiosClient.put(`admin/buildings/${id}`, data),
  // Delete building (protected - admin only)
  deleteBuilding: (id: number): Promise<ApiResponse<string>> => axiosClient.delete(`admin/buildings/${id}`),
};
