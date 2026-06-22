import { useQuery } from '@tanstack/react-query';
import { PARTNER_REPORTS_QUERY_OPTIONS } from '@/lib/queryCache';
import { partnerService } from '@/services/partnerService';

export const partnerReportsQueryKey = (timeRange: string) =>
  ['partner', 'reports', timeRange] as const;

export const usePartnerReportsQuery = (timeRange: string) => {
  return useQuery({
    queryKey: partnerReportsQueryKey(timeRange),
    queryFn: async ({ signal }) => {
      const res: any = await partnerService.getPartnerReports({ range: timeRange }, { signal });
      return res?.data ?? null;
    },
    ...PARTNER_REPORTS_QUERY_OPTIONS,
  });
};
