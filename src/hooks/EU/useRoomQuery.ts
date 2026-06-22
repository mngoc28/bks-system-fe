import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PublicRoomListParams, roomApi } from "@/api/EU/roomApi";
import type {
  PublicRoomPageData,
  PublicRoomSegmentedPageData,
  SuggestedRoomsByProvinceGroup,
  SuggestedRoomsByProvinceParams,
  SuggestedRoomsByTouristSpotGroup,
  SuggestedRoomsByTouristSpotParams,
} from "@/dataHelper/EU/room.dataHelper";
import { toastError } from "@/components/ui/toast";
import { HOMEPAGE_QUERY_OPTIONS, PUBLIC_DETAIL_QUERY_OPTIONS, PUBLIC_STATIC_QUERY_OPTIONS, ROOM_SEARCH_QUERY_OPTIONS } from "@/lib/queryCache";

// Fetch rooms with search parameters
export const useRoomsQuery = (params: PublicRoomListParams = {}, options?: { enabled?: boolean }) => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: ["rooms", params],
    queryFn: async () => {
      try {
        const response = await roomApi.getRoomList(params);
        return response.data;
      } catch (error) {
        toastError(t("rooms.error_getting_rooms"));
        throw error;
      }
    },
    enabled: options?.enabled !== false,
    ...PUBLIC_DETAIL_QUERY_OPTIONS,
  });
};

export const usePaginatedRoomsQuery = (params: PublicRoomListParams, options?: { enabled?: boolean }) => {
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["rooms-paginated", params],
    queryFn: async () => {
      try {
        const response = await roomApi.getPaginatedRoomList(params);
        return response.data as PublicRoomPageData;
      } catch (error) {
        toastError(t("rooms.error_getting_rooms"));
        throw error;
      }
    },
    enabled: options?.enabled !== false,
    placeholderData: keepPreviousData,
    ...ROOM_SEARCH_QUERY_OPTIONS,
  });
};

export const useSegmentedPaginatedRoomsQuery = (
  params: Omit<PublicRoomListParams, "rent_type" | "rent_segments">,
  options?: { enabled?: boolean },
) => {
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["rooms-paginated-segmented", params],
    queryFn: async () => {
      try {
        const response = await roomApi.getSegmentedPaginatedRoomList(params);
        return response.data as PublicRoomSegmentedPageData;
      } catch (error) {
        toastError(t("rooms.error_getting_rooms"));
        throw error;
      }
    },
    enabled: options?.enabled !== false,
    placeholderData: keepPreviousData,
    ...ROOM_SEARCH_QUERY_OPTIONS,
  });
};

export const useTopRatedRoomsQuery = () => {
  return useQuery({
    queryKey: ["home-top-rated-rooms"],
    queryFn: async () => {
      const response = await roomApi.getTopRatedRooms();
      return response.data;
    },
    ...HOMEPAGE_QUERY_OPTIONS,
  });
};

export const useSuggestedRoomsByProvinceQuery = (
  params: SuggestedRoomsByProvinceParams = {},
  options?: { enabled?: boolean },
) => {
  const provinceIds = params.province_ids ?? [];

  return useQuery({
    queryKey: ["home-suggested-rooms", provinceIds.join(","), params.limit ?? null],
    queryFn: async () => {
      const response = await roomApi.getSuggestedRoomsByProvince(params);
      return response.data as SuggestedRoomsByProvinceGroup[];
    },
    enabled: (options?.enabled ?? true) && provinceIds.length > 0,
    ...HOMEPAGE_QUERY_OPTIONS,
  });
};

export const useSuggestedRoomsByTouristSpotQuery = (
  params: SuggestedRoomsByTouristSpotParams = {},
  options?: { enabled?: boolean },
) => {
  const spotSlugs = params.tourist_spot_slugs ?? [];
  const spotIds = params.tourist_spot_ids ?? [];

  return useQuery({
    queryKey: ["home-suggested-rooms-by-spot", spotSlugs.join(","), spotIds.join(","), params.limit ?? null],
    queryFn: async () => {
      const response = await roomApi.getSuggestedRoomsByTouristSpot(params);
      return response.data as SuggestedRoomsByTouristSpotGroup[];
    },
    enabled: (options?.enabled ?? true) && (spotSlugs.length > 0 || spotIds.length > 0),
    ...HOMEPAGE_QUERY_OPTIONS,
  });
};

export const usePublicAmenitiesQuery = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["public-amenities"],
    queryFn: async () => {
      const response = await roomApi.getAmenities();
      return response.data;
    },
    enabled: options?.enabled !== false,
    ...PUBLIC_STATIC_QUERY_OPTIONS,
  });
};

export const usePublicServicesQuery = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["public-services"],
    queryFn: async () => {
      const response = await roomApi.getServices();
      return response.data;
    },
    enabled: options?.enabled !== false,
    ...PUBLIC_STATIC_QUERY_OPTIONS,
  });
};