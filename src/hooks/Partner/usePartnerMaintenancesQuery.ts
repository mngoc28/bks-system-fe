import { partnerService } from '@/services/partnerService';
import {
  parseMaintenanceListResponse,
  type MaintenanceListResult,
} from '@/utils/partnerMaintenanceDisplay';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';

export interface PartnerMaintenanceFilters {
  page: number;
  perPage: number;
  propertyId?: string | null;
  roomId?: number | string;
  status?: string;
  maintenanceType?: string;
}

export const partnerMaintenancesQueryKey = (filters: PartnerMaintenanceFilters) =>
  ['partner', 'maintenances', filters] as const;

export const fetchPartnerMaintenances = async (
  filters: PartnerMaintenanceFilters,
  signal?: AbortSignal,
): Promise<MaintenanceListResult> => {
  const res = await partnerService.getMaintenances(
    {
      page: filters.page,
      per_page: filters.perPage,
      ...(filters.propertyId ? { property_id: filters.propertyId } : {}),
      ...(filters.roomId ? { room_id: filters.roomId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.maintenanceType ? { maintenance_type: filters.maintenanceType } : {}),
    },
    { signal },
  );

  return parseMaintenanceListResponse(res);
};

export const usePartnerMaintenancesQuery = (filters: PartnerMaintenanceFilters) => {
  return useQuery({
    queryKey: partnerMaintenancesQueryKey(filters),
    queryFn: ({ signal }) => fetchPartnerMaintenances(filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60_000,
    gcTime: 5 * 60_000,
  });
};

export const useUpdateMaintenanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Record<string, unknown>;
    }) => partnerService.updateMaintenance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['partner-urgent-maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['partner', 'properties'] });
      queryClient.invalidateQueries({ queryKey: ['partner', 'calendar'] });
    },
  });
};
