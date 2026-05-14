import { useQuery, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '@/services/partnerService';

export interface ExpiringContract {
  id: number;
  title: string;
  contract_type: string;
  renewal_reminder_at: string | null;
  terminated_at: string | null;
  booking_id: number | null;
  booking_end_date: string | null;
  room_label?: string | null;
  property_name?: string | null;
  guest_name?: string | null;
}

const QUERY_KEY = ['partner', 'contracts', 'expiring-soon'] as const;

/**
 * Hook lấy danh sách hợp đồng `LEASE_AGREEMENT` đã đặt nhắc gia hạn nhưng
 * chưa terminated cho Alert Center (Phase 5 T5.5). Stale 60s để cân giữa
 * fresh và số request — listener realtime `contract.renewal_reminder` sẽ
 * invalidate prefix khi scheduler gắn marker mới.
 */
export const useExpiringContracts = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<ExpiringContract[]> => {
      const res: any = await partnerService.getExpiringContracts();
      const payload = (res?.data?.data ?? res?.data ?? []) as ExpiringContract[];
      return Array.isArray(payload) ? payload : [];
    },
    staleTime: 60_000,
  });
};

export const useInvalidateExpiringContracts = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['partner', 'contracts'] });
};
