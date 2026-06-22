import { homeApi } from "@/api/EU/homeApi";
import type { ApiResponse } from "@/api/types";
import type { HomeBootstrapMetadata } from "@/dataHelper/home.dataHelper";
import { MASTER_DATA_QUERY_OPTIONS } from "@/lib/queryCache";
import { useQuery } from "@tanstack/react-query";

export const useHomeBootstrapMetadataQuery = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<HomeBootstrapMetadata>, Error>({
    queryKey: ["home-bootstrap-metadata"],
    queryFn: async ({ signal }) => {
      const response = await homeApi.getBootstrapMetadata({ signal });
      return response;
    },
    enabled: options?.enabled !== false,
    ...MASTER_DATA_QUERY_OPTIONS,
  });
};
