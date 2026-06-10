export interface TotalUser{
  totalUsers: number,
  newUserThisMonth: number,
  userPending: number,
  userBlock: number
}

export interface TotalPartner{
  totalPartners: number,
  newUPartnerThisMonth: number,
  partnerPending: number,
  partnerBlock: number
}

export interface SystemPropertySummary {
  totalProperties: number;
}

export interface SystemRoom{
  totalRooms: number,
  totalPrivateRooms: number,
  totalPublicRooms: number,
  totalAvailableRooms: number
}

export interface AdminDashboardStats {
  totalRooms: number;
  vacantRooms: number;
  occupancyRate: number;
  pendingBookingsCount: number;
  pendingCancellationCount: number;
  todayCheckInCount: number;
  todayCheckOutCount: number;
  inStayCount: number;
  totalBookingsCount: number;
}
export interface BookingPerMonth {
  month: string;
  total: number;
}

export interface BookingByStatus {
  status: number;
  total: number;
}

export interface BookingStatusBreakdownResponse {
  breakdown: BookingByStatus[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface OccupancyChartPoint {
  date: string;
  occupancyRate: number;
}

export interface AdminOccupancyChartResponse {
  points: OccupancyChartPoint[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totalRooms: number;
}

export interface AdminRevenueKpis {
  adr: number;
  revpar: number;
  occupancy_rate: number;
  total_revenue: number;
  nights_sold: number;
  capacity: number;
  booking_count: number;
  total_rooms: number;
}

export interface AdminRevenuePerformanceResponse {
  current: AdminRevenueKpis;
  previous: AdminRevenueKpis;
  previousPeriod: {
    startDate: string;
    endDate: string;
  };
  change: {
    adr: number | null;
    revpar: number | null;
    occupancy_rate: number | null;
    total_revenue: number | null;
    nights_sold: number | null;
    booking_count: number | null;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface BookingByProperty {
  property_id: number;
  property_name: string;
  partner_name?: string;
  province_name?: string;
  total: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
}

export interface RoomOccupancyRate {
  room_id: number;
  room_number: string;
  booking_count: number;
  occupied_days: number;
}

export interface RecentBooking {
  id: number;
  user_name: string;
  room_number: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

export interface BookingsPerMonthResponse {
  bookingsPerMonth: BookingPerMonth[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface BookingTrendPoint {
  date: string;
  total: number;
}

export interface BookingsTrendResponse {
  points: BookingTrendPoint[];
  granularity: "day";
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface RevenueByMonthResponse {
  revenueByMonth: RevenueByMonth[];
  totalRevenue: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}
