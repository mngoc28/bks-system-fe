import { useQuery } from "@tanstack/react-query";
import { partnerDashboardApi } from "@/api/partnerDashboardApi";

export type PartnerDashboardPropertyScope = number | null | undefined;

const scopeKey = (propertyId: PartnerDashboardPropertyScope) =>
  propertyId != null ? String(propertyId) : "all";

/**
 * Hook to fetch summary statistics for the partner dashboard
 */
export const usePartnerStatsQuery = (propertyId?: PartnerDashboardPropertyScope) => {
  return useQuery({
    queryKey: ["partner-stats", scopeKey(propertyId)],
    queryFn: async ({ signal }) => {
      const response = await partnerDashboardApi.getStats({
        signal,
        ...(propertyId != null ? { property_id: propertyId } : {}),
      });
      return response.data;
    },
  });
};

export const usePartnerHeadlineKpisQuery = (propertyId?: PartnerDashboardPropertyScope) => {
  return useQuery({
    queryKey: ["partner", "dashboard", "kpis", scopeKey(propertyId)],
    queryFn: async ({ signal }) => {
      const response = await partnerDashboardApi.getHeadlineKpis({
        signal,
        ...(propertyId != null ? { property_id: propertyId } : {}),
      });
      return response.data;
    },
  });
};

export const usePartnerOccupancyChartQuery = (propertyId?: PartnerDashboardPropertyScope) => {
  return useQuery({
    queryKey: ["partner", "dashboard", "charts", "occupancy", scopeKey(propertyId)],
    queryFn: async ({ signal }) => {
      const response = await partnerDashboardApi.getOccupancyChart({
        signal,
        ...(propertyId != null ? { property_id: propertyId } : {}),
      });
      return response.data;
    },
    staleTime: 60_000,
  });
};

export const usePartnerGmvChartQuery = (propertyId?: PartnerDashboardPropertyScope) => {
  return useQuery({
    queryKey: ["partner", "dashboard", "charts", "gmv", scopeKey(propertyId)],
    queryFn: async ({ signal }) => {
      const response = await partnerDashboardApi.getGmvChart({
        signal,
        ...(propertyId != null ? { property_id: propertyId } : {}),
      });
      return response.data;
    },
    staleTime: 60_000,
  });
};

/**
 * Hook to fetch bookings awaiting approval
 */
export const usePartnerPendingBookingsQuery = (propertyId?: PartnerDashboardPropertyScope) => {
  return useQuery({
    queryKey: ["partner-pending-bookings", scopeKey(propertyId)],
    queryFn: async ({ signal }) => {
      const response = await partnerDashboardApi.getPendingBookings({
        signal,
        limit: 10,
        ...(propertyId != null ? { property_id: propertyId } : {}),
      });
      return response.data;
    },
  });
};

/**
 * Hook to fetch urgent maintenance requests
 */
export const usePartnerUrgentMaintenancesQuery = () => {
  return useQuery({
    queryKey: ["partner-urgent-maintenances"],
    queryFn: async ({ signal }) => {
      const response = await partnerDashboardApi.getUrgentMaintenances({ signal });
      return response.data;
    },
  });
};

/**
 * Hook to fetch revenue analytics
 */
export const usePartnerRevenueAnalyticsQuery = () => {
  return useQuery({
    queryKey: ["partner-revenue-analytics"],
    queryFn: async ({ signal }) => {
      const response = await partnerDashboardApi.getRevenueAnalytics({ signal });
      return response.data;
    },
  });
};
