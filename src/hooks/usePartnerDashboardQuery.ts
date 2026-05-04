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
