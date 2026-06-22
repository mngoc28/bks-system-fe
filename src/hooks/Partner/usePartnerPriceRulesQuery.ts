import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PARTNER_PRICE_RULES_QUERY_OPTIONS } from '@/lib/queryCache';
import { partnerService } from '@/services/partnerService';

export const partnerPriceRulesQueryKey = ['partner', 'price-rules'] as const;

export const usePartnerPriceRulesQuery = () => {
  return useQuery<Array<Record<string, unknown>>>({
    queryKey: partnerPriceRulesQueryKey,
    queryFn: async ({ signal }) => {
      const res: any = await partnerService.getPriceRules(undefined, { signal });
      return (res?.data ?? []) as Array<Record<string, unknown>>;
    },
    ...PARTNER_PRICE_RULES_QUERY_OPTIONS,
  });
};

export const useInvalidatePartnerPriceRules = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: partnerPriceRulesQueryKey });
};
