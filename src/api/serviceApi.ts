import { CreateServiceRequest, ServiceListItem, ServiceFilters, ServiceResponse, SearchServiceResponse } from "@/dataHelper/service.dataHelper";
import axiosClient from "./axiosClient";

export const serviceApi = {
  getAllServices: (params?: any): Promise<SearchServiceResponse> =>
    axiosClient.get("admin/services/search", { params }) as Promise<SearchServiceResponse>,
  getAllServicesAll: (): Promise<{ data: ServiceListItem[] }> => axiosClient.get("admin/services/all"),
  getAllAndSearchServices: (params: ServiceFilters = {}): Promise<ServiceResponse> =>
    axiosClient.get("admin/services/search", { params }),
  createService: (data: CreateServiceRequest): Promise<ServiceResponse> =>
    axiosClient.post("admin/services", data),
  updateService: (id: number, data: CreateServiceRequest): Promise<ServiceResponse> =>
    axiosClient.put(`admin/services/${id}`, data),
  deleteService: (id: number): Promise<ServiceResponse> =>
    axiosClient.delete(`admin/services/${id}`),
};

