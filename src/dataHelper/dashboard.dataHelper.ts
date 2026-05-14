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
export interface BookingPerMonth {
  month: string;
  total: number;
}

export interface BookingByStatus {
  status: string;
  total: number;
}

export interface BookingByProperty {
  property_id: number;
  property_name: string;
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

export interface RevenueByMonthResponse {
  revenueByMonth: RevenueByMonth[];
  totalRevenue: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}
