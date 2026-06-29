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
  overbookingCount: number;
  calculatedAt: string;
}

export interface PartnerDashboardQueryParams {
  property_id?: number;
  limit?: number;
  signal?: AbortSignal;
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
  roomId?: number;
  roomName: string;
  issueDescription: string;
  customerName: string;
  status: string;
  maintenanceType?: string;
  createdAt: string;
}

const buildDashboardParams = (params?: PartnerDashboardQueryParams) => {
  const { property_id, limit, signal } = params ?? {};
  return {
    params: {
      ...(property_id !== undefined ? { property_id } : {}),
      ...(limit !== undefined ? { limit } : {}),
    },
    ...(signal ? { signal } : {}),
  };
};

export const partnerDashboardApi = {
  /**
   * Get summary stats for the partner
   */
  getStats: (params?: PartnerDashboardQueryParams): Promise<ApiResponse<PartnerStats>> =>
    axiosClient.get("/partner/dashboard/stats", buildDashboardParams(params)),

  getHeadlineKpis: (params?: PartnerDashboardQueryParams): Promise<ApiResponse<PartnerHeadlineKpis>> =>
    axiosClient.get("/partner/dashboard/kpis", buildDashboardParams(params)),

  getOccupancyChart: (params?: PartnerDashboardQueryParams): Promise<ApiResponse<OccupancyChartPoint[]>> =>
    axiosClient.get("/partner/dashboard/charts/occupancy", buildDashboardParams(params)),

  getGmvChart: (params?: PartnerDashboardQueryParams): Promise<ApiResponse<GmvChartPoint[]>> =>
    axiosClient.get("/partner/dashboard/charts/gmv", buildDashboardParams(params)),

  /**
   * Get list of bookings awaiting approval for the partner
   */
  getPendingBookings: (params?: PartnerDashboardQueryParams): Promise<ApiResponse<RecentBooking[]>> =>
    axiosClient.get("/partner/dashboard/pending-bookings", buildDashboardParams({ ...params, limit: params?.limit ?? 10 })),
  
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

  /**
   * Get consolidated partner dashboard data in a single request.
   */
  getConsolidated: (params?: PartnerDashboardQueryParams): Promise<ApiResponse<PartnerDashboardConsolidatedData>> =>
    axiosClient.get("/partner/dashboard/consolidated", buildDashboardParams({ ...params, limit: params?.limit ?? 10 })),
};

export interface PartnerDashboardConsolidatedData {
  stats: PartnerStats | null;
  kpis: PartnerHeadlineKpis | null;
  occupancyChart: OccupancyChartPoint[] | null;
  gmvChart: GmvChartPoint[] | null;
  pendingBookings: RecentBooking[] | null;
  urgentMaintenances: UrgentMaintenance[] | null;
}
