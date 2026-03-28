import { PricePackage } from "@/dataHelper/pricePackage.dataHelper";
import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";

export const pricePackageApi = {
  getAllPricePackages: (): Promise<ApiResponse<PricePackage[]>> => axiosClient.get("admin/price-packages"),
  getPricePackagesByRoom: (roomId: number): Promise<ApiResponse<PricePackage[]>> => axiosClient.get(`admin/price-packages/room/${roomId}`),
};

