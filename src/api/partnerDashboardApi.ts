import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";
import { RecentBooking, RevenueByMonthResponse } from "@/dataHelper/dashboard.dataHelper";

/**
 * Interface for Summary Stats
 */
export interface PartnerStats {
  totalProperties: number;
  totalRooms: number;
  vacantRooms: number;
  occupancyRate: number;
  estimatedRevenue: number;
  pendingBookingsCount: number;
  confirmedBookingsCount: number;
  cancelledBookingsCount: number;
  todayCheckInCount: number;
  todayCheckOutCount: number;
  inStayCount: number;
  completedBookingsCount: number;
  pendingCancellationCount: number;
  totalBookingsCount: number;
}

export interface PartnerHeadlineKpis {
  occupancyRate: number;
  occupiedRooms: number;
  totalRooms: number;
  gmvMtd: number;
  netRevenueMtd: number;
  commissionRate: number;
  avgConfirmSeconds: number | null;
  pendingCount: number;
  calculatedAt: string;
}

export interface OccupancyChartPoint {
  date: string;
  occupancyRate: number;
}

export interface GmvChartPoint {
  date: string;
  gmv: number;
  netRevenue: number;
}

/**
 * Interface for Urgent Maintenance request
 */
export interface UrgentMaintenance {
  id: number;
  roomName: string;
  issueDescription: string;
  customerName: string;
  status: string;
  createdAt: string;
}

export const partnerDashboardApi = {
  /**
   * Get summary stats for the partner
   */
  getStats: (config?: any): Promise<ApiResponse<PartnerStats>> => 
    axiosClient.get("/partner/dashboard/stats", config),

  getHeadlineKpis: (config?: any): Promise<ApiResponse<PartnerHeadlineKpis>> =>
    axiosClient.get("/partner/dashboard/kpis", config),

  getOccupancyChart: (config?: any): Promise<ApiResponse<OccupancyChartPoint[]>> =>
    axiosClient.get("/partner/dashboard/charts/occupancy", config),

  getGmvChart: (config?: any): Promise<ApiResponse<GmvChartPoint[]>> =>
    axiosClient.get("/partner/dashboard/charts/gmv", config),
  
  /**
   * Get list of bookings awaiting approval for the partner
   */
  getPendingBookings: (config?: any): Promise<ApiResponse<RecentBooking[]>> => 
    axiosClient.get("/partner/dashboard/pending-bookings", config),
  
  /**
   * Get list of urgent maintenance tasks for the partner
   */
  getUrgentMaintenances: (config?: any): Promise<ApiResponse<UrgentMaintenance[]>> => 
    axiosClient.get("/partner/dashboard/urgent-maintenances", config),
    
  /**
   * Get revenue analytics and monthly history for the partner
   */
  getRevenueAnalytics: (config?: any): Promise<ApiResponse<RevenueByMonthResponse>> => 
    axiosClient.get("/partner/dashboard/revenue-analytics", config),
};
