import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";
import {BookingByBuilding, BookingsPerMonthResponse, RevenueByMonthResponse,SystemBuilding,SystemRoom,TotalPartner,TotalUser } from "@/dataHelper/dashboard.dataHelper";

export const dashboardApi = {

  getTotalUser: async (): Promise<ApiResponse<TotalUser>> => axiosClient.get("/admin/dashboard/total-user"),

  getTotalPartner: async (): Promise<ApiResponse<TotalPartner>> => axiosClient.get("/admin/dashboard/total-partner"),

  getSystemBuilding: async (): Promise<ApiResponse<SystemBuilding>> => axiosClient.get("/admin/dashboard/system-building"),

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

  getBookingsByBuilding: async (): Promise<ApiResponse<BookingByBuilding[]>> => axiosClient.get("/admin/dashboard/buildings-bookings-count"),
};
