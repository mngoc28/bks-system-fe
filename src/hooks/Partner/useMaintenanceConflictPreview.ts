import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { partnerService } from '@/services/partnerService';
import {
  parseMaintenanceConflictPreviewResponse,
  type MaintenanceConflictPreview,
} from '@/utils/partnerMaintenanceDisplay';

export interface MaintenanceConflictPreviewParams {
  roomId?: number | string | null;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

const EMPTY_PREVIEW: MaintenanceConflictPreview = {
  hasConflict: false,
  bookings: [],
  blocks: [],
  currentStay: null,
};

export const maintenanceConflictPreviewQueryKey = (
  roomId: number | string,
  startDate: string,
  endDate: string,
) => ['partner', 'maintenances', 'conflict-preview', roomId, startDate, endDate] as const;

export const useMaintenanceConflictPreview = ({
  roomId,
  startDate,
  endDate,
  enabled = true,
}: MaintenanceConflictPreviewParams) => {
  const [debouncedRange, setDebouncedRange] = useState({ startDate: '', endDate: '' });

  const hasRange = Boolean(roomId && startDate && endDate && startDate <= endDate);
  const isEnabled = enabled && hasRange;

  useEffect(() => {
    if (!hasRange) {
      setDebouncedRange({ startDate: '', endDate: '' });
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedRange({ startDate: startDate!, endDate: endDate! });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [hasRange, startDate, endDate]);

  const query = useQuery({
    queryKey: maintenanceConflictPreviewQueryKey(
      roomId ?? 'unknown',
      debouncedRange.startDate,
      debouncedRange.endDate,
    ),
    queryFn: async ({ signal }) => {
      const res = await partnerService.previewMaintenanceConflicts(
        {
          room_id: roomId!,
          start_date: debouncedRange.startDate,
          end_date: debouncedRange.endDate,
        },
        { signal },
      );
      return parseMaintenanceConflictPreviewResponse(res);
    },
    enabled: isEnabled && Boolean(debouncedRange.startDate && debouncedRange.endDate),
    staleTime: 30_000,
  });

  const currentStayQuery = useQuery({
    queryKey: ['partner', 'maintenances', 'current-stay', roomId],
    queryFn: async ({ signal }) => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
      const res = await partnerService.previewMaintenanceConflicts(
        {
          room_id: roomId!,
          start_date: today,
          end_date: tomorrow,
        },
        { signal },
      );
      return parseMaintenanceConflictPreviewResponse(res).currentStay;
    },
    enabled: enabled && Boolean(roomId),
    staleTime: 60_000,
  });

  const preview: MaintenanceConflictPreview = query.data ?? {
    ...EMPTY_PREVIEW,
    currentStay: currentStayQuery.data ?? null,
  };

  if (query.data && currentStayQuery.data && !query.data.currentStay) {
    preview.currentStay = currentStayQuery.data;
  } else if (query.data?.currentStay) {
    preview.currentStay = query.data.currentStay;
  } else if (currentStayQuery.data) {
    preview.currentStay = currentStayQuery.data;
  }

  return {
    preview,
    isLoading: query.isFetching || currentStayQuery.isFetching,
    isFetching: query.isFetching,
    hasRange,
  };
};
