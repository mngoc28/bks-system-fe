import { partnerService } from '@/services/partnerService';
import { useQuery } from '@tanstack/react-query';
import { PARTNER_ROOM_DETAIL_QUERY_OPTIONS } from '@/lib/queryCache';
import { parseMaintenanceListResponse } from '@/utils/partnerMaintenanceDisplay';
import { normalizePartnerBookings } from '@/utils/partnerBookingNormalize';
import { normalizeHousekeepingStatus } from '@/utils/partnerRoomDisplay';
import { Room, Booking, MaintenanceRequest } from '../../types';

export const useRoomDetailQuery = (roomId: string) => {
  return useQuery<Room>({
    queryKey: ['partnerRoomDetail', roomId],
    queryFn: async () => {
      const roomRes = (await partnerService.getRoomDetail(roomId)) as any;
      const rawRoom = roomRes?.status === 'success' ? roomRes.data : (roomRes?.data ?? roomRes);
      if (!rawRoom) throw new Error('Không tìm thấy thông tin phòng');
      
      return {
        ...rawRoom,
        id: rawRoom.id,
        propertyId: rawRoom.property_id ?? rawRoom.propertyId,
        propertyName: rawRoom.propertyName ?? rawRoom.property_name,
        name: rawRoom.name ?? rawRoom.title ?? 'N/A',
        area: rawRoom.area || 0,
        floor_number: rawRoom.floor_number || 0,
        people: rawRoom.people || 0,
        room_type: rawRoom.room_type || 1,
        status: rawRoom.status === 1 ? 'Trống' : rawRoom.status === 2 ? 'Đang thuê' : 'Đang bảo trì',
        housekeeping_status: normalizeHousekeepingStatus(rawRoom.housekeeping_status),
        amenities: rawRoom.amenities || [],
        services: rawRoom.services || [],
        prices: rawRoom.prices || [],
        reviews_count: rawRoom.reviews_count,
        reviews_avg_rating: rawRoom.reviews_avg_rating,
        province_id: rawRoom.province_id,
        partner_phone: rawRoom.partner_phone ?? null,
        partner_email: rawRoom.partner_email ?? null,
        support_phone: rawRoom.support_phone ?? null,
        support_email: rawRoom.support_email ?? null,
      };
    },
    enabled: !!roomId,
    ...PARTNER_ROOM_DETAIL_QUERY_OPTIONS,
  });
};

export const useRoomBookingsQuery = (roomId: string, isEnabled: boolean) => {
  return useQuery<Booking[]>({
    queryKey: ['partnerRoomBookings', roomId],
    queryFn: async () => {
      const bookingsRes = (await partnerService.getBookings({ room_id: roomId, per_page: 50 })) as any;
      const paginator = bookingsRes?.data?.data && typeof bookingsRes.data.data === 'object' && !Array.isArray(bookingsRes.data.data)
        ? bookingsRes.data.data
        : bookingsRes?.data ?? bookingsRes;
      const rawBookings = Array.isArray(paginator?.data)
        ? paginator.data
        : Array.isArray(paginator)
          ? paginator
          : [];

      return normalizePartnerBookings(rawBookings) as Booking[];
    },
    enabled: !!roomId && isEnabled,
    ...PARTNER_ROOM_DETAIL_QUERY_OPTIONS,
  });
};

export const useRoomMaintenancesQuery = (roomId: string, isEnabled: boolean) => {
  return useQuery<MaintenanceRequest[]>({
    queryKey: ['partnerRoomMaintenances', roomId],
    queryFn: async () => {
      const maintRes = await partnerService.getMaintenances({ room_id: roomId });
      const maintenanceList = parseMaintenanceListResponse(maintRes);
      return maintenanceList.items as MaintenanceRequest[];
    },
    enabled: !!roomId && isEnabled,
    ...PARTNER_ROOM_DETAIL_QUERY_OPTIONS,
  });
};

export const useRoomImagesQuery = (roomId: string, isEnabled: boolean) => {
  return useQuery<any[]>({
    queryKey: ['partnerRoomImages', roomId],
    queryFn: async () => {
      const imagesRes = (await partnerService.getRoomImages(roomId)) as any;
      return imagesRes?.data || [];
    },
    enabled: !!roomId && isEnabled,
    ...PARTNER_ROOM_DETAIL_QUERY_OPTIONS,
  });
};
