import { useQuery } from "@tanstack/react-query";
import { partnerDashboardApi } from "@/api/partnerDashboardApi";

/**
 * Hook to fetch summary statistics for the partner dashboard
 */
export const usePartnerStatsQuery = () => {
  return useQuery({
    queryKey: ["partner-stats"],
    queryFn: async () => {
      const response = await partnerDashboardApi.getStats();
      return response.data;
    },
  });
};

export const usePartnerHeadlineKpisQuery = () => {
  return useQuery({
    queryKey: ["partner", "dashboard", "kpis"],
    queryFn: async () => {
      const response = await partnerDashboardApi.getHeadlineKpis();
      return response.data;
    },
  });
};

export const usePartnerOccupancyChartQuery = () => {
  return useQuery({
    queryKey: ["partner", "dashboard", "charts", "occupancy"],
    queryFn: async () => {
      const response = await partnerDashboardApi.getOccupancyChart();
      return response.data;
    },
    staleTime: 60_000,
  });
};

export const usePartnerGmvChartQuery = () => {
  return useQuery({
    queryKey: ["partner", "dashboard", "charts", "gmv"],
    queryFn: async () => {
      const response = await partnerDashboardApi.getGmvChart();
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
    queryFn: async () => {
      const response = await partnerDashboardApi.getPendingBookings();
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
    queryFn: async () => {
      const response = await partnerDashboardApi.getUrgentMaintenances();
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
    queryFn: async () => {
      const response = await partnerDashboardApi.getRevenueAnalytics();
      return response.data;
    },
  });
};
