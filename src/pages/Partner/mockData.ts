import { SystemStats, Building, Room, Booking, MaintenanceRequest, RevenueRecord, NewsPost } from './types';

export const mockStats: SystemStats = {
  totalBuildings: 3,
  totalRooms: 45,
  vacantRooms: 8,
  occupancyRate: 82.2,
  estimatedRevenue: 125000000,
};

export const mockBuildings: Building[] = [
  { id: 'b1', name: 'Alpha Resort & Spa', address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM', totalRooms: 15, type: 'Resort' },
  { id: 'b2', name: 'Villa Sunny', address: '45 Lê Văn Sỹ, Phú Nhuận, TP.HCM', totalRooms: 5, type: 'Villa' },
  { id: 'b3', name: 'Căn hộ Mini BKS', address: '89 Điện Biên Phủ, Bình Thạnh, TP.HCM', totalRooms: 20, type: 'Căn hộ' },
];

export const mockRooms: Room[] = [
  { 
    id: 'r1', 
    buildingId: 'b1', 
    name: 'Phòng Deluxe 101', 
    area: 35, 
    amenities: ['Máy lạnh', 'Máy giặt', 'Giường King', 'Tủ lạnh', 'Ban công'], 
    services: ['Dọn phòng (miễn phí)', 'Wifi', 'Ăn sáng'],
    prices: [
      { id: 'p1', packageName: 'Gói 1 tháng', price: 12000000, duration: 1 },
      { id: 'p2', packageName: 'Gói 6 tháng', price: 10000000, duration: 6 }
    ],
    status: 'Đang thuê' 
  },
  { 
    id: 'r2', 
    buildingId: 'b1', 
    name: 'Phòng Suite 102', 
    area: 50, 
    amenities: ['Máy lạnh', 'Bồn tắm', 'Giường King', 'View biển'], 
    services: ['Dọn phòng', 'Wifi', 'Dịch vụ Spa', 'Ăn sáng'],
    prices: [
      { id: 'p3', packageName: 'Gói 1 tháng', price: 25000000, duration: 1 },
      { id: 'p4', packageName: 'Gói 3 tháng', price: 22000000, duration: 3 }
    ],
    status: 'Trống' 
  },
  { 
    id: 'r3', 
    buildingId: 'b2', 
    name: 'Phòng Master 01', 
    area: 40, 
    amenities: ['Bếp riêng', 'Tủ quần áo', 'Giường Queen'], 
    services: ['Internet chất lượng cao', 'Giặt là'],
    prices: [
      { id: 'p5', packageName: 'Hợp đồng 1 năm', price: 15000000, duration: 12 }
    ],
    status: 'Đang bảo trì' 
  },
];

export const mockBookings: Booking[] = [
  { id: 'bk1', guestName: 'Nguyễn Văn A', roomName: 'Phòng 101 - Alpha', checkIn: '2026-04-01', checkOut: '2026-10-01', services: ['Dọn dẹp', 'Internet'], totalAmount: 30000000, status: 'Chờ duyệt' },
  { id: 'bk2', guestName: 'Trần Thị B', roomName: 'Phòng Master 01 - Sunny', checkIn: '2026-03-15', checkOut: '2027-03-15', services: ['Internet'], totalAmount: 180000000, status: 'Đang ở' },
];

export const mockMaintenances: MaintenanceRequest[] = [
  { id: 'm1', customerName: 'Trần Thị B', roomName: 'Phòng Master 01 - Sunny', issueDescription: 'Hỏng vòi sen nhà tắm', status: 'Chờ xử lý', createdAt: '2026-03-30T10:00:00Z' },
];

export const mockRevenueData: RevenueRecord[] = [
  { month: 'Tháng 1', revenue: 105000000, commission: 5250000, netIncome: 99750000 },
  { month: 'Tháng 2', revenue: 98000000, commission: 4900000, netIncome: 93100000 },
  { month: 'Tháng 3', revenue: 125000000, commission: 6250000, netIncome: 118750000 },
];

export const mockNews: NewsPost[] = [
  {
    id: 'n1',
    title: 'Khuyến mãi mùa hè tại Alpha Resort',
    excerpt: 'Giảm giá cực sốc lên đến 30% cho khách hàng đặt phòng trên 3 tháng.',
    content: 'Chi tiết nội dung bài viết khuyến mãi...',
    thumbnail: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-03-25T08:15:00Z',
    status: 'Đã đăng'
  },
  {
    id: 'n2',
    title: 'Cập nhật bảng giá dịch vụ dọn phòng',
    excerpt: 'Điều chỉnh giá dịch vụ dọn phòng chuyên nghiệp từ tháng 4/2026.',
    content: 'Nội dung thông báo điều chỉnh giá...',
    thumbnail: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-03-28T14:30:00Z',
    status: 'Nháp'
  }
];

export const mockTransactions = [
  { id: 'tx1', type: 'Thu nhập', amount: 15000000, date: '2026-04-05', description: 'Tiền thuê phòng 101 - Alpha' },
  { id: 'tx2', type: 'Phí dịch vụ', amount: -500000, date: '2026-04-04', description: 'Phí dọn dẹp tháng 3' },
  { id: 'tx3', type: 'Thu nhập', amount: 22000000, date: '2026-04-02', description: 'Tiền thuê phòng Master 01 - Sunny' },
];
