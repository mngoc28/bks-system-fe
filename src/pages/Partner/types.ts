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
  property_type_id: number;
  rent_category: number;
  description?: string;
  property_type_name?: string;
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
  duration: number; // in months
}

export interface Room {
  id: string | number;
  buildingId: string | number;
  name: string;
  area: number; // m2
  amenities: string[]; 
  services: string[]; 
  prices: RoomPrice[];
  status: 'Trống' | 'Đang thuê' | 'Đang bảo trì';
}

export interface Booking {
  id: string | number;
  guestName: string; // Đồng bộ với UI
  roomName: string;
  checkIn: string; // Đồng bộ với UI
  checkOut: string; // Đồng bộ với UI
  totalAmount: number;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Đã hủy' | 'Đã đặt cọc' | 'Đang ở' | 'Đã trả phòng' | 'Đã hoàn thành';
}

export interface MaintenanceRequest {
  id: string | number;
  roomName: string;
  type: string; // Loại sự cố
  description: string;
  status: 'Đang chờ' | 'Đang xử lý' | 'Đã hoàn thành' | 'Chờ xử lý' | 'Đang sửa';
  createdAt: string;
}

export interface NewsPost {
  id: string | number;
  title: string;
  content: string;
  thumbnail: string;
  createdAt: string;
  status: 'Nháp' | 'Đã đăng';
}

export interface RevenueRecord {
  month: string;
  revenue: number;
  commission: number;
  netIncome: number;
}
