import { roomApi } from "@/api/roomApi";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { SearchRoomRequest, UpdateRoomRequest } from "@/dataHelper/room.dataHelper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Fetch rooms with search parameters
export const useRoomsQuery = (params: SearchRoomRequest, options?: { enabled?: boolean }) => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: ["rooms", params],
    queryFn: async () => {
      try {
        const response = await roomApi.searchRooms(params);
        return response.data;
      } catch (error) {
        toastError(t("rooms.error_getting_rooms"));
        throw error;
      }
    },
    enabled: options?.enabled !== false,
  });
};

// Fetch room by ID
export const useRoomQuery = (id: number) => {
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["room", id],
    queryFn: async () => {
      try {
        const response = await roomApi.getRoomById(id);
        return response.data;
      } catch (error) {
        console.error("Error fetching room:", error);
        toastError(t("rooms.error_getting_room"));
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Mutation hooks
export const useCreateRoomMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomApi.createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toastSuccess(t("rooms.room_created_successfully"));
    },
    onError: () => {
      toastError(t("rooms.error_creating_room"));
    },
  });
};

// Delete room mutation
export const useDeleteRoomMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomApi.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toastSuccess(t("rooms.room_deleted_successfully"));
    },
  });
};

// Update room mutation
export const useUpdateRoomMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoomRequest }) => roomApi.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room"] });
    },
    onError: () => {
      toastError(t("rooms.error_updating_room"));
    },
  });
};

// Fetch rooms by property ID
export const useRoomsByPropertyQuery = (propertyId: number, options?: { enabled?: boolean }) => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: ["rooms-by-property", propertyId],
    queryFn: async () => {
      try {
        const response = await roomApi.getRoomsByProperty(propertyId);
        return response.data;
      } catch (error) {
        toastError(t("rooms.error_getting_rooms_by_property"));
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!propertyId,
  });
}

