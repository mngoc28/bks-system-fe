import { dashboardApi } from "@/api/dashboardApi";
import { ApiResponse } from "@/api/types";
import { BookingByBuilding, BookingsPerMonthResponse, RevenueByMonthResponse, SystemBuilding, SystemRoom, TotalPartner, TotalUser } from "@/dataHelper/dashboard.dataHelper";
import { useQuery } from "@tanstack/react-query";

export const useTotalUser = () => {
  return useQuery<ApiResponse<TotalUser>>(
    {
      queryKey:['dashboard', 'total-user'],
      queryFn: async () => {
        try{
          const response = await dashboardApi.getTotalUser();
          return response;
        }catch(error) {
          throw error;
        }
      }
    });
};

export const useTotalPartner = () => {
  return useQuery<ApiResponse<TotalPartner>>(
    {
      queryKey:['dashboard', 'total-partner'],
      queryFn: async () => {
        try{
          const response = await dashboardApi.getTotalPartner();
          return response;
        }catch(error) {
          throw error;
        }
      }
    });
};

export const useSystemBuilding = () => {
  return useQuery<ApiResponse<SystemBuilding>>(
    {
      queryKey:['dashboard', 'system-building'],
      queryFn: async () => {
        try{
          const response = await dashboardApi.getSystemBuilding();
          return response;
        }catch(error){
          throw error;
        }
      }
    });
};

export const useSystemRoom = () => {
  return useQuery<ApiResponse<SystemRoom>>(
    {
      queryKey:['dashboard', 'system-room'],
      queryFn: async () => {
        try{
          const response = await dashboardApi.getSystemRoom();
          return response;
        }catch(error) {
          throw error;
        }
      }
    });
};

export const useBookingsPerMonthQuery = (startDate?: string, endDate?: string, enabled = true) => {
  return useQuery<ApiResponse<BookingsPerMonthResponse>, Error>({
    queryKey: ["dashboard", "bookings-per-month", startDate ?? null, endDate ?? null],
    queryFn: async () => {
      try {
        const response = await dashboardApi.getBookingsPerMonth(startDate, endDate);
        return response;
      } catch (error) {
        throw error;
      }
    },
    enabled,
  });
};

export const useRevenueByMonthQuery = (startDate?: string, endDate?: string, enabled = true) => {
  return useQuery<ApiResponse<RevenueByMonthResponse>, Error>({
    queryKey: ["dashboard", "revenue-per-month", startDate, endDate],
    queryFn: async () => {
      try {
        const response = await dashboardApi.getRevenueByMonth(startDate, endDate);
        return response;
      } catch (error) {
        throw error;
      }
    },
    enabled
  });
};

export const useBookingsByBuildingQuery = () => {
  return useQuery<ApiResponse<BookingByBuilding[]>>({
    queryKey: ["dashboard", "bookings-by-building"],
    queryFn: async () => {
      try {
        const response = await dashboardApi.getBookingsByBuilding();
        return response;
      } catch (error) {
        throw error;
      }
    },
  });
};
