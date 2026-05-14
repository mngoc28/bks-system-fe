import {
  Property,
  PropertyListDataResponse,
  PropertyDetail,
  PropertyType,
  CreatePropertyRequest,
  SearchPropertyRequest,
  UpdatePropertyRequest,
} from "@/dataHelper/property.dataHelper";
import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";

export const propertyApi = {
  searchProperties: (params: SearchPropertyRequest): Promise<ApiResponse<PropertyListDataResponse>> =>
    axiosClient.get("admin/properties/searchAll", { params }),
  getAllProperties: (): Promise<{ data: Property[] }> => axiosClient.get("admin/properties/all"),
  getPropertyTypes: (): Promise<ApiResponse<PropertyType[]>> => axiosClient.get("home/property-types"),
  createProperty: (data: CreatePropertyRequest): Promise<ApiResponse<string>> => axiosClient.post("admin/properties", data),
  getPropertyById: (id: number): Promise<ApiResponse<PropertyDetail>> => axiosClient.get(`admin/properties/${id}`),
  getBookingsByProperty: (id: number): Promise<ApiResponse<string>> => axiosClient.get(`admin/properties/bookings/${id}`),
  updateProperty: (id: number, data: UpdatePropertyRequest): Promise<ApiResponse<string>> =>
    axiosClient.put(`admin/properties/${id}`, data),
  deleteProperty: (id: number): Promise<ApiResponse<string>> => axiosClient.delete(`admin/properties/${id}`),
};
