import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PARTNER_CONTRACT_QUERY_OPTIONS, PARTNER_OPERATIONAL_QUERY_OPTIONS } from '@/lib/queryCache';
import { partnerService } from '@/services/partnerService';

export const partnerContractsQueryKey = ['partner', 'contracts', 'list'] as const;
export const partnerContractDetailQueryKey = (id: string | number) =>
  ['partner', 'contracts', 'detail', String(id)] as const;
export const partnerConfirmedBookingsForContractQueryKey =
  ['partner', 'contracts', 'confirmed-bookings'] as const;

export const usePartnerContractsQuery = () => {
  return useQuery({
    queryKey: partnerContractsQueryKey,
    queryFn: async ({ signal }) => {
      const res: any = await partnerService.getContracts({ signal });
      return (res?.data ?? []) as unknown[];
    },
    ...PARTNER_CONTRACT_QUERY_OPTIONS,
  });
};

export interface PartnerContractDetail {
  id: number;
  title: string;
  content: string;
  status: number;
  contract_type: string;
  signature_date: string | null;
  renewal_reminder_at: string | null;
  terminated_at: string | null;
  termination_reason: string | null;
  created_at: string;
  booking?: {
    id: number;
    start_date: string;
    end_date: string;
    user?: { id?: number; name?: string; phone?: string; email?: string };
    room?: {
      id?: number;
      title?: string;
      name?: string;
      utility_fees?: Array<{
        id: number;
        fee_type: string;
        calc_method: string;
        unit_price: number | string;
        is_included: boolean | number;
      }>;
      property?: { id?: number; name?: string };
    };
    price?: { price?: number };
  };
}

export const usePartnerContractDetailQuery = (contractId: string | undefined) => {
  return useQuery<PartnerContractDetail | null>({
    queryKey: partnerContractDetailQueryKey(contractId ?? ''),
    queryFn: async ({ signal }) => {
      const res: any = await partnerService.getContractDetail(contractId!, { signal });
      return (res?.data?.data ?? res?.data ?? null) as PartnerContractDetail | null;
    },
    enabled: !!contractId,
    ...PARTNER_CONTRACT_QUERY_OPTIONS,
  });
};

export const usePartnerConfirmedBookingsForContractQuery = (enabled = true) => {
  return useQuery({
    queryKey: partnerConfirmedBookingsForContractQueryKey,
    queryFn: async ({ signal }) => {
      const res: any = await partnerService.getBookings({ status: 1 }, { signal });
      const data = res?.data?.data || res?.data || res || [];
      return Array.isArray(data) ? data : [];
    },
    enabled,
    ...PARTNER_OPERATIONAL_QUERY_OPTIONS,
  });
};

export const useInvalidatePartnerContracts = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['partner', 'contracts'] });
};
