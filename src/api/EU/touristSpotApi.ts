import axiosClient from "@/api/axiosClient";
import type { ApiResponse } from "@/api/types";
import type { TouristSpotListParams, TouristSpotSuggestion } from "@/dataHelper/EU/touristSpot.dataHelper";

function serializeTouristSpotParams(params: TouristSpotListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};

  if (params.keyword?.trim()) {
    query.keyword = params.keyword.trim();
  }

  if (params.limit != null) {
    query.limit = params.limit;
  }

  if (params.featured_only) {
    query.featured_only = 1;
  }

  if (params.province_id != null) {
    query.province_id = params.province_id;
  }

  return query;
}

export const touristSpotApi = {
  getPublicTouristSpots: (
    params: TouristSpotListParams = {},
  ): Promise<ApiResponse<TouristSpotSuggestion[]>> => {
    return axiosClient.get<TouristSpotSuggestion[]>("home/tourist-spots", {
      params: serializeTouristSpotParams(params),
    }) as unknown as Promise<ApiResponse<TouristSpotSuggestion[]>>;
  },
};
