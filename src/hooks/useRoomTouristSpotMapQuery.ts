import {
  roomTouristSpotMapApi,
  SaveRoomTouristSpotMapRequest,
  UpdateRoomTouristSpotMapRequest,
} from "@/api/roomTouristSpotMapApi";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Fetch mappings list for a room
export const useRoomTouristSpotMapsQuery = (
  roomId: number,
  isPartner: boolean = false,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["room-tourist-spot-maps", roomId, isPartner],
    queryFn: async () => {
      const response = await roomTouristSpotMapApi.getMappings({ room_id: roomId, per_page: 100 }, isPartner);
      return response.data?.data ?? [];
    },
    enabled: (options?.enabled ?? true) && !!roomId,
  });
};

// Create a mapping
export const useCreateRoomTouristSpotMapMutation = (isPartner: boolean = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SaveRoomTouristSpotMapRequest) => {
      return roomTouristSpotMapApi.createMapping(data, isPartner);
    },
    onSuccess: (_, variables) => {
      toastSuccess("Gán địa điểm du lịch thành công.");
      queryClient.invalidateQueries({ queryKey: ["room-tourist-spot-maps", variables.room_id, isPartner] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Gán địa điểm du lịch thất bại.";
      toastError(msg);
    },
  });
};

// Update a mapping
export const useUpdateRoomTouristSpotMapMutation = (isPartner: boolean = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateRoomTouristSpotMapRequest; roomId: number }) => {
      return roomTouristSpotMapApi.updateMapping(id, data, isPartner);
    },
    onSuccess: (_, variables) => {
      toastSuccess("Cập nhật địa điểm du lịch thành công.");
      queryClient.invalidateQueries({ queryKey: ["room-tourist-spot-maps", variables.roomId, isPartner] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Cập nhật địa điểm du lịch thất bại.";
      toastError(msg);
    },
  });
};

// Delete a mapping
export const useDeleteRoomTouristSpotMapMutation = (isPartner: boolean = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { id: number; roomId: number; applyToAllRooms?: boolean }) => {
      return roomTouristSpotMapApi.deleteMapping(variables.id, isPartner, !!variables.applyToAllRooms);
    },
    onSuccess: (_, variables) => {
      toastSuccess("Xóa liên kết địa điểm du lịch thành công.");
      queryClient.invalidateQueries({ queryKey: ["room-tourist-spot-maps", variables.roomId, isPartner] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Xóa liên kết địa điểm du lịch thất bại.";
      toastError(msg);
    },
  });
};
