import { useQuery, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '@/services/partnerService';

export interface PartnerCalendarBooking {
  id: number;
  room_id: number;
  start_date: string;
  end_date: string;
  status: number;
  stay_status: string | null;
  confirmed_at: string | null;
  property_id?: number | null;
  property_name?: string | null;
  room_label?: string | null;
  room_title?: string | null;
  guest_name?: string | null;
  guest_phone?: string | null;
  total_amount?: number | null;
  note?: string | null;
}

export interface PartnerCalendarBlock {
  id: number;
  room_id: number;
  start_date: string;
  end_date: string;
  block_type: 'maintenance' | 'owner_use' | 'off_market';
  reason: string;
  note: string | null;
}

export interface PartnerCalendarPayload {
  bookings: PartnerCalendarBooking[];
  blocks: PartnerCalendarBlock[];
  property_id: number | null;
  room_id: number | null;
  from: string;
  to: string;
  cached_at: string;
}

export interface UseCalendarParams {
  propertyId?: number | string | null;
  roomId?: number | string | null;
  from: string;
  to: string;
  enabled?: boolean;
}

export const calendarQueryKey = (params: UseCalendarParams) => [
  'partner',
  'calendar',
  String(params.propertyId ?? 'all'),
  String(params.roomId ?? 'any'),
  params.from,
  params.to,
] as const;

/**
 * Hook lấy bookings + room blocks của Partner trong khoảng ngày.
 *
 * Server cap range = 31 ngày. TTL cache 30s phía BE; FE giữ stale 30s để
 * khớp. Realtime listener (`useBookingsRealtime`) sẽ invalidate prefix
 * `['partner','calendar']` qua `useQueryClient` ở caller.
 */
export const useCalendar = (params: UseCalendarParams) => {
  const queryFn = async (): Promise<PartnerCalendarPayload> => {
    const res = await partnerService.getCalendar({
      property_id: params.propertyId ?? null,
      room_id: params.roomId ?? null,
      from: params.from,
      to: params.to,
    });
    const resData = res as { data?: { data?: PartnerCalendarPayload } & PartnerCalendarPayload };
    const payload = (resData?.data?.data ?? resData?.data) as PartnerCalendarPayload | undefined;
    return {
      bookings: payload?.bookings ?? [],
      blocks: payload?.blocks ?? [],
      property_id: payload?.property_id ?? null,
      room_id: payload?.room_id ?? null,
      from: payload?.from ?? params.from,
      to: payload?.to ?? params.to,
      cached_at: payload?.cached_at ?? new Date().toISOString(),
    };
  };

  return useQuery({
    queryKey: calendarQueryKey(params),
    queryFn,
    enabled: params.enabled !== false && Boolean(params.from && params.to),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
};

/**
 * Helper invalidate toàn bộ calendar queries của partner — dùng sau khi
 * tạo/xoá block, confirm/cancel booking, hoặc khi nhận realtime event.
 */
export const useInvalidatePartnerCalendar = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['partner', 'calendar'] });
};

