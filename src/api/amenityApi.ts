import { Amenity, AmenityResponse, SearchAmenityRequest, SearchAmenityResponse } from "@/dataHelper/amenity.dataHelper";
import axiosClient from "./axiosClient";

export const amenityApi = {
  searchAmenities: (params: SearchAmenityRequest): Promise<SearchAmenityResponse> => axiosClient.get("admin/amenities", { params }),
  getAllAmenities: (): Promise<{ data: Amenity[] }> => axiosClient.get("admin/amenities/all"),
  getAmenityById: (id: number): Promise<AmenityResponse> => axiosClient.get(`admin/amenities/${id}`),
  createAmenity: (data: { name: string }): Promise<AmenityResponse> => axiosClient.post("admin/amenities/store", data),
  updateAmenity: (id: number, data: { name: string }): Promise<AmenityResponse> => axiosClient.put(`admin/amenities/${id}`, data),
  deleteAmenity: (id: number): Promise<{ status: string; message: string | null }> => axiosClient.delete(`admin/amenities/${id}`),
};

