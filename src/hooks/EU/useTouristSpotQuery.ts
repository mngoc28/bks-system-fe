import { useQuery } from "@tanstack/react-query";
import { touristSpotApi } from "@/api/EU/touristSpotApi";
import type { TouristSpotListParams, TouristSpotSuggestion } from "@/dataHelper/EU/touristSpot.dataHelper";

export const usePublicTouristSpotsQuery = (
  params: TouristSpotListParams = {},
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: [
      "public-tourist-spots",
      params.keyword ?? "",
      params.featured_only ?? false,
      params.limit ?? 20,
      params.province_id ?? "",
    ],
    queryFn: async () => {
      const response = await touristSpotApi.getPublicTouristSpots(params);
      return (response.data ?? []) as TouristSpotSuggestion[];
    },
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
};
