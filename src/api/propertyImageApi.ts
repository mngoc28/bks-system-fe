import { propertyImage, RequestPropertyImage } from "@/dataHelper/propertyImage.dataHelper";
import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";

export const propertyImageApi = {
  getPropertyImagesById: (propertyId: number): Promise<ApiResponse<propertyImage>> =>
    axiosClient.get(`/admin/property-images/property/${propertyId}`),
  getImagesByPropertyId: (propertyId: number): Promise<ApiResponse<propertyImage[]>> =>
    axiosClient.get(`/admin/property-images/property/${propertyId}`),
  createPropertyImage: (data: RequestPropertyImage): Promise<ApiResponse<propertyImage>> =>
    axiosClient.post(`/admin/property-images`, data),
  updatePropertyImage: (id: number, data: RequestPropertyImage): Promise<ApiResponse<propertyImage>> =>
    axiosClient.put(`/admin/property-images/${id}`, data),
  deletePropertyImage: (id: number): Promise<ApiResponse<propertyImage>> =>
    axiosClient.delete(`/admin/property-images/${id}`),
  updatePropertyImageSort: (propertyId: number, ids: number[]): Promise<ApiResponse<string>> =>
    axiosClient.put(`/admin/property-images/sort/${propertyId}`, { ids }),
};
