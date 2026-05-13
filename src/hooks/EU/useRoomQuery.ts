import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PublicRoomListParams, roomApi } from "@/api/EU/roomApi";
import { toastError } from "@/components/ui/toast";

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
  });
};

export const useLatestRoomsQuery = () => {
  return useQuery({
    queryKey: ["home-latest-rooms"],
    queryFn: async () => {
      const response = await roomApi.getLatestRooms();
      return response.data;
    },
  });
};