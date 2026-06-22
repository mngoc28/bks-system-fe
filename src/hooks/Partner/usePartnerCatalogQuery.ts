import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CATALOG_QUERY_OPTIONS } from '@/lib/queryCache';
import { partnerService } from '@/services/partnerService';

export const partnerServicesCatalogQueryKey = ['partner', 'catalog', 'services'] as const;
export const partnerAmenitiesCatalogQueryKey = ['partner', 'catalog', 'amenities'] as const;

export const usePartnerServicesCatalogQuery = () => {
  return useQuery({
    queryKey: partnerServicesCatalogQueryKey,
    queryFn: ({ signal }) => partnerService.getAllServices({ signal }),
    ...CATALOG_QUERY_OPTIONS,
  });
};

export const usePartnerAmenitiesCatalogQuery = () => {
  return useQuery({
    queryKey: partnerAmenitiesCatalogQueryKey,
    queryFn: ({ signal }) => partnerService.getAllAmenities({ signal }),
    ...CATALOG_QUERY_OPTIONS,
  });
};

export const useInvalidatePartnerServicesCatalog = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: partnerServicesCatalogQueryKey });
};

export const useInvalidatePartnerAmenitiesCatalog = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: partnerAmenitiesCatalogQueryKey });
};
