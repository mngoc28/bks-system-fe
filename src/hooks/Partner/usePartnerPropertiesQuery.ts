import { partnerService } from '@/services/partnerService';
import {
  parsePartnerPropertiesListResponse,
  parsePartnerPropertyRoomPreviewResponse,
  PartnerPropertiesListResult,
} from '@/utils/partnerPropertyData';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';

export interface PartnerPropertiesFilters {
  page: number;
  perPage: number;
  name?: string;
  propertyTypeId?: number;
}

export const partnerPropertiesQueryKey = (filters: PartnerPropertiesFilters) =>
  ['partner', 'properties', 'list', filters] as const;

export const partnerPropertyRoomPreviewQueryKey = (propertyId: string) =>
  ['partner', 'properties', propertyId, 'rooms-preview'] as const;

export const fetchPartnerPropertiesList = async (
  filters: PartnerPropertiesFilters,
  signal?: AbortSignal,
): Promise<PartnerPropertiesListResult> => {
  const res = await partnerService.getProperties(
    {
      page: filters.page,
      per_page: filters.perPage,
      with_rooms: 0,
      ...(filters.name ? { name: filters.name } : {}),
      ...(filters.propertyTypeId ? { property_type_id: filters.propertyTypeId } : {}),
    },
    { signal },
  );

  return parsePartnerPropertiesListResponse(res);
};

export const fetchPartnerPropertyRoomPreview = async (
  propertyId: string,
  propertyName: string,
  limit = 6,
  signal?: AbortSignal,
) => {
  const res = await partnerService.getPropertyRoomPreview(propertyId, limit, { signal });
  return parsePartnerPropertyRoomPreviewResponse(res, propertyName);
};

export const usePartnerPropertiesQuery = (filters: PartnerPropertiesFilters) => {
  return useQuery({
    queryKey: partnerPropertiesQueryKey(filters),
    queryFn: ({ signal }) => fetchPartnerPropertiesList(filters, signal),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
};

export const usePartnerPropertyRoomPreviewQuery = (
  propertyId: string,
  propertyName: string,
  enabled: boolean,
  limit = 6,
) => {
  return useQuery({
    queryKey: partnerPropertyRoomPreviewQueryKey(propertyId),
    queryFn: ({ signal }) => fetchPartnerPropertyRoomPreview(propertyId, propertyName, limit, signal),
    enabled: enabled && !!propertyId,
    staleTime: 60_000,
  });
};

export const useInvalidatePartnerPropertyQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidateList: () =>
      queryClient.invalidateQueries({ queryKey: ['partner', 'properties', 'list'] }),
    invalidatePreview: (propertyId: string) =>
      queryClient.invalidateQueries({ queryKey: partnerPropertyRoomPreviewQueryKey(propertyId) }),
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: ['partner', 'properties'] }),
  };
};
