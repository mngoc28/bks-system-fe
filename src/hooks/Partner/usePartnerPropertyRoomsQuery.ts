import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { PARTNER_ROOM_LIST_QUERY_OPTIONS } from '@/lib/queryCache';
import { partnerService } from '@/services/partnerService';

export type PartnerPropertyRoomsListParams = {
  propertyId: string;
  page: number;
  per_page: number;
  room_number?: string;
  status?: number;
};

export const partnerPropertyRoomsQueryKey = (params: PartnerPropertyRoomsListParams) =>
  ['partner', 'property-rooms', params] as const;

export const partnerPropertyOccupancyQueryKey = (propertyId: string) =>
  ['partner', 'property-rooms', 'occupancy', propertyId] as const;

export const usePartnerPropertyRoomsQuery = (
  params: PartnerPropertyRoomsListParams,
  enabled = true,
) => {
  return useQuery({
    queryKey: partnerPropertyRoomsQueryKey(params),
    queryFn: async ({ signal }) => {
      const roomsRes: any = await partnerService.getRooms(
        {
          property_id: params.propertyId,
          page: params.page,
          per_page: params.per_page,
          room_number: params.room_number,
          status: params.status,
        },
        { signal },
      );
      const roomData = roomsRes?.data || {};
      const rawRooms = roomData.data || (Array.isArray(roomData) ? roomData : []);
      return {
        rooms: rawRooms,
        totalItems: roomData.total || rawRooms.length,
        totalPages: roomData.last_page || 1,
      };
    },
    enabled: enabled && !!params.propertyId,
    placeholderData: keepPreviousData,
    ...PARTNER_ROOM_LIST_QUERY_OPTIONS,
  });
};

export const usePartnerPropertyOccupancyQuery = (propertyId: string | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: partnerPropertyOccupancyQueryKey(propertyId ?? ''),
    queryFn: async ({ signal }) => {
      const res: any = await partnerService.getRoomsOccupancy(
        { property_id: propertyId },
        { signal },
      );
      if (res?.status === 'success' && res?.data) {
        return {
          rooms: res.data.rooms || [],
          stats: res.data.stats || null,
        };
      }
      return { rooms: [], stats: null, errorMessage: res?.message as string | undefined };
    },
    enabled: enabled && !!propertyId,
    ...PARTNER_ROOM_LIST_QUERY_OPTIONS,
  });
};

export const usePartnerPropertyMetaQuery = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ['partner', 'property-meta', propertyId],
    queryFn: async ({ signal }) => {
      const res: any = await partnerService.getPropertyById(String(propertyId), { signal });
      return res?.data ?? null;
    },
    enabled: !!propertyId,
    staleTime: PARTNER_ROOM_LIST_QUERY_OPTIONS.staleTime,
    gcTime: PARTNER_ROOM_LIST_QUERY_OPTIONS.gcTime,
  });
};

export const useInvalidatePartnerPropertyRooms = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['partner', 'property-rooms'] });
    void queryClient.invalidateQueries({ queryKey: ['partner', 'property-meta'] });
  };
};
