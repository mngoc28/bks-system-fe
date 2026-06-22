import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PARTNER_OPERATIONAL_QUERY_OPTIONS } from '@/lib/queryCache';
import { partnerService } from '@/services/partnerService';

export const partnerStayServicesQueryKey = ['partner', 'stay-services'] as const;

export const usePartnerStayServicesQuery = () => {
  return useQuery<Array<Record<string, unknown>>>({
    queryKey: partnerStayServicesQueryKey,
    queryFn: async ({ signal }) => {
      const res: any = await partnerService.getStayServiceRequests({ signal });
      return (res?.data ?? []) as Array<Record<string, unknown>>;
    },
    ...PARTNER_OPERATIONAL_QUERY_OPTIONS,
  });
};

export const useInvalidatePartnerStayServices = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: partnerStayServicesQueryKey });
};
