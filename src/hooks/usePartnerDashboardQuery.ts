import { useQuery } from "@tanstack/react-query";
import { partnerDashboardApi } from "@/api/partnerDashboardApi";

/**
 * Hook to fetch summary statistics for the partner dashboard
 */
export const usePartnerStatsQuery = () => {
  return useQuery({
    queryKey: ["partner-stats"],
    queryFn: async ({ signal }) => {
      const response = await partnerDashboardApi.getStats({ signal });
      return response.data;
    },
  });
};

export const usePartnerHeadlineKpisQuery = () => {
  return useQuery({
    queryKey: ["partner", "dashboard", "kpis"],
    queryFn: async ({ signal }) => {
      const response = await partnerDashboardApi.getHeadlineKpis({ signal });
      return response.data;
    },
  });
};

export const usePartnerOccupancyChartQuery = () => {
  return useQuery({
    queryKey: ["partner", "dashboard", "charts", "occupancy"],
    queryFn: async ({ signal }) => {
      const response = await partnerDashboardApi.getOccupancyChart({ signal });
      return response.data;
    },
    staleTime: 60_000,
  });
};

export const usePartnerGmvChartQuery = () => {
  return useQuery({
    queryKey: ["partner", "dashboard", "charts", "gmv"],
    queryFn: async ({ signal }) => {
      const response = await partnerDashboardApi.getGmvChart({ signal });
      return response.data;
    },
    staleTime: 60_000,
  });
};

/**
 * Hook to fetch bookings awaiting approval
 */
export const usePartnerPendingBookingsQuery = () => {
  return useQuery({
    queryKey: ["partner-pending-bookings"],
    queryFn: async ({ signal }) => {
      const response = await partnerDashboardApi.getPendingBookings({ signal });
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
