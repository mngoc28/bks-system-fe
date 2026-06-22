import axiosClient from "@/api/axiosClient";
import type { ApiResponse } from "@/api/types";
import type { HomeBootstrapMetadata } from "@/dataHelper/home.dataHelper";

export const homeApi = {
  getBootstrapMetadata: (config?: { signal?: AbortSignal }): Promise<ApiResponse<HomeBootstrapMetadata>> =>
    axiosClient.get("home/bootstrap-metadata", config),
};
