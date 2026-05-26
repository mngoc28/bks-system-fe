import { Ward } from "@/dataHelper/ward.dataHelper";
import { ApiResponse } from "./types";
import axiosClient from "./axiosClient";

export const WardApi = {
    // get wards by province id for admin
    getWardsByProvinceId: (provinceId: number): Promise<ApiResponse<Ward[]>> => 
        axiosClient.get(`/admin/wards/${provinceId}`),
    // get wards for public home view
    getHomeWardsByProvinceId: (provinceId: number, config?: any): Promise<ApiResponse<Ward[]>> =>
        axiosClient.get(`home/wards/${provinceId}`, config),
}
