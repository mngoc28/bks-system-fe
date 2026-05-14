import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";
import { BookingByProperty, BookingsPerMonthResponse, RevenueByMonthResponse, SystemPropertySummary, SystemRoom, TotalPartner, TotalUser } from "@/dataHelper/dashboard.dataHelper";

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

  getRevenueByMonth: async (startDate?: string, endDate?: string): Promise<ApiResponse<RevenueByMonthResponse>> => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const queryString = params.toString();
    return axiosClient.get(`/admin/dashboard/revenue-per-month${queryString ? `?${queryString}` : ""}`);
  },

  getBookingsByProperty: async (): Promise<ApiResponse<BookingByProperty[]>> => axiosClient.get("/admin/dashboard/properties-bookings-count"),
};
