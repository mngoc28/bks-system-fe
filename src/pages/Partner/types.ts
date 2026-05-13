export interface SystemStats {
  totalBuildings: number;
  totalRooms: number;
  vacantRooms: number;
  occupancyRate: number;
  estimatedRevenue: number;
}

export interface Building {
  id: string | number;
  name: string;
  address: string;
  totalRooms: number;
  rooms_count?: number;
  property_type_id?: number;
  rent_category?: number;
  province_id?: number;
  ward_id?: number;
  description?: string;
  property_type_name?: string;
  type?: string; 
}

export interface Amenity {
  id: string | number;
  name: string;
  icon?: any;
  category?: string;
}

export interface Service {
  id: string | number;
  name: string;
  unit: string;
  price: number;
  category?: string;
  status?: string;
  description?: string;
}

export interface RoomPrice {
  id: string | number;
  packageName: string;
  price: number;
  duration: number; 
  unit: 'day' | 'month';
  deposit_amount?: number;
  minimum_stay?: number;
}

export interface UtilityFee {
  id?: number;
  type: 'electricity' | 'water' | 'service';
  method: 'per_unit' | 'per_person' | 'fixed';
  price: number;
  included: boolean;
}

export interface Room {
  id: string | number;
  buildingId: string | number;
  buildingName?: string;
  name: string;
  title?: string;
  floor_number?: number;
  people?: number;
  room_type?: string | number;
  area: number; // m2
  amenities: any[]; 
  services: any[]; 
  prices: any[];
  utility_fees?: UtilityFee[];
  cheapest_daily_price?: number;
  cheapest_monthly_price?: number;
  all_prices?: string;
  status: 'Trống' | 'Đang thuê' | 'Đang bảo trì';
}

export interface Booking {
  id: string | number;
  guestName: string;
  roomName: string;
  buildingName?: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  services?: string[];
  customerName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  note?: string;
  rawStatus?: number;
  totalAmount: number;
  stay_status?: 'pending' | 'checked_in' | 'checked_out' | 'no_show';
  booking_status?: number;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Đã hủy' | 'Đã đặt cọc' | 'Đang ở' | 'Đã trả phòng' | 'Đã hoàn thành';
}

export interface MaintenanceRequest {
  id: string | number;
  roomName: string;
  roomId?: string | number;
  buildingName?: string;
  type?: string; 
  description?: string; 
  status: 'Đang chờ' | 'Đang xử lý' | 'Đã hoàn thành' | 'Chờ xử lý' | 'Đang sửa';
  createdAt: string;
  customerName?: string; 
  issueDescription?: string;
}

export interface NewsPost {
  id: string | number;
  title: string;
  content: string;
  thumbnail: string;
  imageUrl?: string;
  excerpt?: string;
  createdAt: string;
  status: 'Nháp' | 'Đã đăng';
}

export interface RevenueRecord {
  month: string;
  revenue: number;
  commission: number;
  netIncome: number;
}
