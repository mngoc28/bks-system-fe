import { dashboardApi } from "@/api/dashboardApi";
import { ApiResponse } from "@/api/types";
import {
  AdminDashboardStats,
  AdminOccupancyChartResponse,
  AdminRevenuePerformanceResponse,
  BookingByProperty,
  BookingStatusBreakdownResponse,
  BookingsPerMonthResponse,
  BookingsTrendResponse,
  RevenueByMonthResponse,
  SystemPropertySummary,
  SystemRoom,
  TotalPartner,
  TotalUser,
} from "@/dataHelper/dashboard.dataHelper";
import { useQuery } from "@tanstack/react-query";

/** KPI / work queue — cần tươi hơn nhưng không refetch mỗi lần quay lại trang. */
const DASHBOARD_OPS_STALE_MS = 60_000;
/** Biểu đồ analytics — ít đổi hơn, cache lâu hơn. */
const DASHBOARD_ANALYTICS_STALE_MS = 5 * 60_000;

const dashboardQueryDefaults = {
  refetchOnWindowFocus: false,
} as const;

export const useTotalUser = () => {
  return useQuery<ApiResponse<TotalUser>>(
    {
      queryKey:['dashboard', 'total-user'],
      queryFn: async () => {
        const response = await dashboardApi.getTotalUser();
        return response;
      },
      staleTime: DASHBOARD_OPS_STALE_MS,
      ...dashboardQueryDefaults,
    });
};

export const useTotalPartner = () => {
  return useQuery<ApiResponse<TotalPartner>>(
    {
      queryKey:['dashboard', 'total-partner'],
      queryFn: async () => {
        const response = await dashboardApi.getTotalPartner();
        return response;
      },
      staleTime: DASHBOARD_OPS_STALE_MS,
      ...dashboardQueryDefaults,
    });
};

export const useSystemProperty = () => {
  return useQuery<ApiResponse<SystemPropertySummary>>(
    {
      queryKey:['dashboard', 'system-property'],
      queryFn: async () => {
        const response = await dashboardApi.getSystemProperty();
        return response;
      },
      staleTime: DASHBOARD_OPS_STALE_MS,
      ...dashboardQueryDefaults,
    });
};

export const useSystemRoom = () => {
  return useQuery<ApiResponse<SystemRoom>>(
    {
      queryKey:['dashboard', 'system-room'],
      queryFn: async () => {
        const response = await dashboardApi.getSystemRoom();
        return response;
      },
      staleTime: DASHBOARD_OPS_STALE_MS,
      ...dashboardQueryDefaults,
    });
};

export const useBookingsPerMonthQuery = (startDate?: string, endDate?: string, enabled = true) => {
  return useQuery<ApiResponse<BookingsPerMonthResponse>, Error>({
    queryKey: ["dashboard", "bookings-per-month", startDate ?? null, endDate ?? null],
    queryFn: async () => {
      const response = await dashboardApi.getBookingsPerMonth(startDate, endDate);
      return response;
    },
    enabled,
    staleTime: DASHBOARD_ANALYTICS_STALE_MS,
    ...dashboardQueryDefaults,
  });
};

export const useBookingsTrendQuery = (startDate?: string, endDate?: string, enabled = true) => {
  return useQuery<ApiResponse<BookingsTrendResponse>, Error>({
    queryKey: ["dashboard", "bookings-trend", startDate ?? null, endDate ?? null],
    queryFn: async () => dashboardApi.getBookingsTrend(startDate, endDate),
    enabled,
    staleTime: DASHBOARD_ANALYTICS_STALE_MS,
    ...dashboardQueryDefaults,
  });
};

export const useRevenueByMonthQuery = (startDate?: string, endDate?: string, enabled = true) => {
  return useQuery<ApiResponse<RevenueByMonthResponse>, Error>({
    queryKey: ["dashboard", "revenue-per-month", startDate, endDate],
    queryFn: async () => {
      const response = await dashboardApi.getRevenueByMonth(startDate, endDate);
      return response;
    },
    enabled,
    staleTime: DASHBOARD_ANALYTICS_STALE_MS,
    ...dashboardQueryDefaults,
  });
};

export const useBookingsByPropertyQuery = (startDate?: string, endDate?: string, enabled = true) => {
  return useQuery<ApiResponse<BookingByProperty[]>>({
    queryKey: ["dashboard", "bookings-by-property", startDate ?? null, endDate ?? null],
    queryFn: async () => dashboardApi.getBookingsByProperty(startDate, endDate),
    enabled,
    staleTime: DASHBOARD_ANALYTICS_STALE_MS,
    ...dashboardQueryDefaults,
  });
};

export const useBookingStatusBreakdownQuery = (startDate?: string, endDate?: string, enabled = true) => {
  return useQuery<ApiResponse<BookingStatusBreakdownResponse>, Error>({
    queryKey: ["dashboard", "booking-status-breakdown", startDate ?? null, endDate ?? null],
    queryFn: async () => dashboardApi.getBookingStatusBreakdown(startDate, endDate),
    enabled,
    staleTime: DASHBOARD_ANALYTICS_STALE_MS,
    ...dashboardQueryDefaults,
  });
};

export const useAdminOccupancyChartQuery = (startDate?: string, endDate?: string, enabled = true) => {
  return useQuery<ApiResponse<AdminOccupancyChartResponse>, Error>({
    queryKey: ["dashboard", "occupancy-chart", startDate ?? null, endDate ?? null],
    queryFn: async () => dashboardApi.getOccupancyChart(startDate, endDate),
    enabled,
    staleTime: DASHBOARD_ANALYTICS_STALE_MS,
    ...dashboardQueryDefaults,
  });
};

export const useAdminRevenuePerformanceQuery = (startDate?: string, endDate?: string, enabled = true) => {
  return useQuery<ApiResponse<AdminRevenuePerformanceResponse>, Error>({
    queryKey: ["dashboard", "revenue-performance", startDate ?? null, endDate ?? null],
    queryFn: async () => dashboardApi.getRevenuePerformance(startDate, endDate),
    enabled,
    staleTime: DASHBOARD_ANALYTICS_STALE_MS,
    ...dashboardQueryDefaults,
  });
};

export const useAdminDashboardStatsQuery = () => {
  return useQuery<ApiResponse<AdminDashboardStats>, Error>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => dashboardApi.getStats(),
    staleTime: DASHBOARD_OPS_STALE_MS,
    refetchInterval: 5 * 60 * 1000,
    ...dashboardQueryDefaults,
  });
};

export const useAdminDashboardConsolidatedQuery = (startDate?: string, endDate?: string) => {
  return useQuery<ApiResponse<any>, Error>({
    queryKey: ["dashboard", "consolidated", startDate ?? null, endDate ?? null],
    queryFn: async () => dashboardApi.getConsolidated(startDate, endDate),
    staleTime: DASHBOARD_OPS_STALE_MS,
    ...dashboardQueryDefaults,
  });
};
