import { ProvinceDetailApiResponse, ProvinceFilter, ProvinceResponse, ProvinceTypes } from "@/dataHelper/province.dataHelper";
import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";

export const provinceApi = {
    getProvinceById: (id: number): Promise<ProvinceDetailApiResponse> =>
        axiosClient.get(`admin/provinces/${id}`),
    getAllProvinces: (data: ProvinceFilter): Promise<ProvinceResponse> =>
        axiosClient.get("admin/provinces", { params: data }),
    // get all provinces types
    getAllProvincesTypes: (): Promise<ApiResponse<ProvinceTypes[]>> =>
        axiosClient.get('admin/provinces/types'),
    getHomeProvinces: (config?: any): Promise<ApiResponse<ProvinceTypes[]>> =>
        axiosClient.get('home/provinces', config),
}