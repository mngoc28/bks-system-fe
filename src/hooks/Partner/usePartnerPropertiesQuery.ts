import { partnerService } from '@/services/partnerService';
import {
  parsePartnerPropertiesListResponse,
  parsePartnerPropertyRoomPreviewResponse,
  PartnerPropertiesListResult,
} from '@/utils/partnerPropertyData';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';

export interface PartnerPropertySort {
  field: string;
  order: 'asc' | 'desc';
}

export interface PartnerPropertiesFilters {
  page: number;
  perPage: number;
  keyword?: string;
  propertyTypeId?: number;
  rentCategory?: number;
  provinceName?: string;
  wardName?: string;
  sort?: PartnerPropertySort;
  includeCover?: boolean;
  occupancyFilter?: 'vacant' | 'occupied' | 'maintenance';
  minRating?: number;
  hasRooms?: 0 | 1;
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
      ...(filters.includeCover ? { include: 'cover' } : {}),
      ...(filters.keyword ? { keyword: filters.keyword } : {}),
      ...(filters.propertyTypeId ? { property_type_id: filters.propertyTypeId } : {}),
      ...(filters.rentCategory ? { rent_category: filters.rentCategory } : {}),
      ...(filters.provinceName ? { province_name: filters.provinceName } : {}),
      ...(filters.wardName ? { ward_name: filters.wardName } : {}),
      ...(filters.sort
        ? { sort: [{ field: filters.sort.field, order: filters.sort.order }] }
        : {}),
      ...(filters.occupancyFilter ? { occupancy_filter: filters.occupancyFilter } : {}),
      ...(filters.minRating !== undefined ? { min_rating: filters.minRating } : {}),
      ...(filters.hasRooms !== undefined ? { has_rooms: filters.hasRooms } : {}),
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
    staleTime: 24 * 60 * 60_000,
    gcTime: 24 * 60 * 60_000 + 5 * 60_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
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
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
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
