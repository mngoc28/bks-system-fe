import { ApiResponse } from "@/api/types";
import { WardApi } from "@/api/wardApi";
import { Ward } from "@/dataHelper/ward.dataHelper";
import { useQuery } from "@tanstack/react-query";

// get wards by province id
export const useGetWardsByProvinceId = (provinceId: number) => {
  return useQuery<ApiResponse<Ward[]>, Error>({
    queryKey: ["admin-wards", provinceId],
    queryFn: async () => {
      const response = await WardApi.getWardsByProvinceId(provinceId);
      return response;
    },
    enabled: !!provinceId,
  });
};

export const useGetHomeWardsByProvinceId = (provinceId: number) => {
  return useQuery<ApiResponse<Ward[]>, Error>({
    queryKey: ["home-wards", provinceId],
    queryFn: async ({ signal }) => {
      const response = await WardApi.getHomeWardsByProvinceId(provinceId, { signal });
      return response;
    },
    enabled: !!provinceId,
  });
};
