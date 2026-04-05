import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";
import { RecentBooking, RevenueByMonthResponse } from "@/dataHelper/dashboard.dataHelper";

/**
 * Interface for Summary Stats
 */
export interface PartnerStats {
  totalBuildings: number;
  totalRooms: number;
  vacantRooms: number;
  occupancyRate: number;
  estimatedRevenue: number;
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
  getStats: (): Promise<ApiResponse<PartnerStats>> => 
    axiosClient.get("/partner/dashboard/stats"),
  
  /**
   * Get list of bookings awaiting approval for the partner
   */
  getPendingBookings: (): Promise<ApiResponse<RecentBooking[]>> => 
    axiosClient.get("/partner/dashboard/pending-bookings"),
  
  /**
   * Get list of urgent maintenance tasks for the partner
   */
  getUrgentMaintenances: (): Promise<ApiResponse<UrgentMaintenance[]>> => 
    axiosClient.get("/partner/dashboard/urgent-maintenances"),
    
  /**
   * Get revenue analytics and monthly history for the partner
   */
  getRevenueAnalytics: (): Promise<ApiResponse<RevenueByMonthResponse>> => 
    axiosClient.get("/partner/dashboard/revenue-analytics"),
};
