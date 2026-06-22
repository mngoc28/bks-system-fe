import { partnerService } from '@/services/partnerService';
import { parsePartnerPropertyNamesResponse } from '@/utils/partnerPropertyData';
import { useQuery } from '@tanstack/react-query';

export const partnerPropertyNamesQueryKey = ['partner', 'properties', 'names'] as const;

export const fetchPartnerPropertyNames = async (signal?: AbortSignal) => {
  const res = await partnerService.getPropertyNames({ signal });
  return parsePartnerPropertyNamesResponse(res);
};

export const usePartnerPropertyNamesQuery = (enabled = true) => {
  return useQuery({
    queryKey: partnerPropertyNamesQueryKey,
    queryFn: ({ signal }) => fetchPartnerPropertyNames(signal),
    staleTime: 24 * 60 * 60_000,
    gcTime: 24 * 60 * 60_000 + 5 * 60_000,
    enabled,
  });
};
