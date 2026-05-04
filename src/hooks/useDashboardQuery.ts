import { dashboardApi } from "@/api/dashboardApi";
import { ApiResponse } from "@/api/types";
import { BookingByBuilding, BookingsPerMonthResponse, RevenueByMonthResponse, SystemBuilding, SystemRoom, TotalPartner, TotalUser } from "@/dataHelper/dashboard.dataHelper";
import { useQuery } from "@tanstack/react-query";

export const useTotalUser = () => {
  return useQuery<ApiResponse<TotalUser>>(
    {
      queryKey:['dashboard', 'total-user'],
      queryFn: async () => {
        const response = await dashboardApi.getTotalUser();
        return response;
      }
    });
};

export const useTotalPartner = () => {
  return useQuery<ApiResponse<TotalPartner>>(
    {
      queryKey:['dashboard', 'total-partner'],
      queryFn: async () => {
        const response = await dashboardApi.getTotalPartner();
        return response;
      }
    });
};

export const useSystemBuilding = () => {
  return useQuery<ApiResponse<SystemBuilding>>(
    {
      queryKey:['dashboard', 'system-building'],
      queryFn: async () => {
        const response = await dashboardApi.getSystemBuilding();
        return response;
      }
    });
};

export const useSystemRoom = () => {
  return useQuery<ApiResponse<SystemRoom>>(
    {
      queryKey:['dashboard', 'system-room'],
      queryFn: async () => {
        const response = await dashboardApi.getSystemRoom();
        return response;
      }
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
  });
};

export const useRevenueByMonthQuery = (startDate?: string, endDate?: string, enabled = true) => {
  return useQuery<ApiResponse<RevenueByMonthResponse>, Error>({
    queryKey: ["dashboard", "revenue-per-month", startDate, endDate],
    queryFn: async () => {
      const response = await dashboardApi.getRevenueByMonth(startDate, endDate);
      return response;
    },
    enabled
  });
};

export const useBookingsByBuildingQuery = () => {
  return useQuery<ApiResponse<BookingByBuilding[]>>({
    queryKey: ["dashboard", "bookings-by-building"],
    queryFn: async () => {
      const response = await dashboardApi.getBookingsByBuilding();
      return response;
    },
  });
};
