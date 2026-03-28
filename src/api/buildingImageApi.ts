import { buildingImage, RequestBuildingImage } from "@/dataHelper/buildingImage.dataHelper";
import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";

export const buildingImageApi = {
    // get building images by building id
    getBuildingImagesById: (buildingId: number): Promise<ApiResponse<buildingImage>> => 
        axiosClient.get(`/admin/building-images/${buildingId}`),
    // get image by building id
    getImagesByBuildingId: (buildingId: number): Promise<ApiResponse<buildingImage[]>> =>
        axiosClient.get(`/admin/building-images/building/${buildingId}`),
    // create building image
    createBuildingImage: (data: RequestBuildingImage): Promise<ApiResponse<buildingImage>> =>
        axiosClient.post(`/admin/building-images`, data),
    // update building image
    updateBuildingImage: (id: number, data: RequestBuildingImage): Promise<ApiResponse<buildingImage>> =>
        axiosClient.put(`/admin/building-images/${id}`, data),
    // delete building image
    deleteBuildingImage: (id: number): Promise<ApiResponse<buildingImage>> =>
        axiosClient.delete(`/admin/building-images/${id}`),
    // update building image sort
    updateBuildingImageSort:(buildingId: number, ids: number[]): Promise<ApiResponse<string>> =>
        axiosClient.put(`/admin/building-images/sort/${buildingId}`, { ids }),
}