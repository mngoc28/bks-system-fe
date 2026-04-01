export interface SystemStats {
  totalBuildings: number;
  totalRooms: number;
  vacantRooms: number;
  occupancyRate: number;
  estimatedRevenue: number;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  totalRooms: number;
}

export interface Room {
  id: string;
  buildingId: string;
  name: string;
  area: number; // m2
  amenities: string[];
  price1Month: number;
  price6Months: number;
  status: 'Trống' | 'Đang thuê' | 'Đang bảo trì';
}

export interface Booking {
  id: string;
  customerName: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  services: string[];
  totalAmount: number;
  status: 'Chờ duyệt' | 'Đã đặt cọc' | 'Đang ở' | 'Đã trả phòng';
}

export interface MaintenanceRequest {
  id: string;
  customerName: string;
  roomName: string;
  issueDescription: string;
  imageUrl?: string;
  status: 'Chờ xử lý' | 'Đang sửa' | 'Đã hoàn thành';
  createdAt: string;
}

export interface RevenueRecord {
  month: string;
  revenue: number;
  commission: number;
  netIncome: number;
}

export interface TransactionRecord {
  id: string;
  type: 'Booking' | 'Payout';
  amount: number;
  date: string;
  status: 'Thành công' | 'Đang xử lý';
  description: string;
}
