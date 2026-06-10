import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";
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

export const dashboardApi = {

  getTotalUser: async (): Promise<ApiResponse<TotalUser>> => axiosClient.get("/admin/dashboard/total-user"),

  getTotalPartner: async (): Promise<ApiResponse<TotalPartner>> => axiosClient.get("/admin/dashboard/total-partner"),

  getSystemProperty: async (): Promise<ApiResponse<SystemPropertySummary>> => axiosClient.get("/admin/dashboard/system-property"),

  getSystemRoom: async (): Promise<ApiResponse<SystemRoom>> => axiosClient.get("/admin/dashboard/system-room"),

  getBookingsPerMonth: async (startDate?: string, endDate?: string): Promise<ApiResponse<BookingsPerMonthResponse>> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const queryString = params.toString();
    return axiosClient.get(`/admin/dashboard/bookings-per-month${queryString ? `?${queryString}` : ""}`);
  },

  getBookingsTrend: async (startDate?: string, endDate?: string): Promise<ApiResponse<BookingsTrendResponse>> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const queryString = params.toString();
    return axiosClient.get(`/admin/dashboard/bookings-trend${queryString ? `?${queryString}` : ""}`);
  },

  getRevenueByMonth: async (startDate?: string, endDate?: string): Promise<ApiResponse<RevenueByMonthResponse>> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const queryString = params.toString();
    return axiosClient.get(`/admin/dashboard/revenue-per-month${queryString ? `?${queryString}` : ""}`);
  },

  getBookingsByProperty: async (startDate?: string, endDate?: string): Promise<ApiResponse<BookingByProperty[]>> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const queryString = params.toString();
    return axiosClient.get(`/admin/dashboard/properties-bookings-count${queryString ? `?${queryString}` : ""}`);
  },

  getBookingStatusBreakdown: async (startDate?: string, endDate?: string): Promise<ApiResponse<BookingStatusBreakdownResponse>> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const queryString = params.toString();
    return axiosClient.get(`/admin/dashboard/booking-status-breakdown${queryString ? `?${queryString}` : ""}`);
  },

  getOccupancyChart: async (startDate?: string, endDate?: string): Promise<ApiResponse<AdminOccupancyChartResponse>> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const queryString = params.toString();
    return axiosClient.get(`/admin/dashboard/charts/occupancy${queryString ? `?${queryString}` : ""}`);
  },

  getRevenuePerformance: async (startDate?: string, endDate?: string): Promise<ApiResponse<AdminRevenuePerformanceResponse>> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const queryString = params.toString();
    return axiosClient.get(`/admin/dashboard/revenue-performance${queryString ? `?${queryString}` : ""}`);
  },

  getStats: async (): Promise<ApiResponse<AdminDashboardStats>> => axiosClient.get("/admin/dashboard/stats"),
};
