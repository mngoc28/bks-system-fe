import { SystemStats, Building, Room, Booking, MaintenanceRequest, RevenueRecord, TransactionRecord } from './types';

export const mockStats: SystemStats = {
  totalBuildings: 3,
  totalRooms: 45,
  vacantRooms: 8,
  occupancyRate: 82.2,
  estimatedRevenue: 125000000,
};

export const mockBuildings: Building[] = [
  { id: 'b1', name: 'Tòa nhà Alpha', address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM', totalRooms: 15 },
  { id: 'b2', name: 'Khu trọ Beta', address: '45 Lê Văn Sỹ, Phú Nhuận, TP.HCM', totalRooms: 20 },
  { id: 'b3', name: 'Căn hộ Mini Gamma', address: '89 Điện Biên Phủ, Bình Thạnh, TP.HCM', totalRooms: 10 },
];

export const mockRooms: Room[] = [
  { id: 'r1', buildingId: 'b1', name: 'Phòng 101', area: 25, amenities: ['Máy lạnh', 'Máy giặt', 'Giường', 'Tủ lạnh'], price1Month: 4500000, price6Months: 4200000, status: 'Đang thuê' },
  { id: 'r2', buildingId: 'b1', name: 'Phòng 102', area: 30, amenities: ['Máy lạnh', 'Giường', 'Ban công'], price1Month: 5000000, price6Months: 4800000, status: 'Trống' },
  { id: 'r3', buildingId: 'b2', name: 'Phòng 201', area: 20, amenities: ['Giường', 'Tủ quần áo'], price1Month: 3000000, price6Months: 2800000, status: 'Đang bảo trì' },
  { id: 'r4', buildingId: 'b3', name: 'Căn hộ 3A', area: 45, amenities: ['Máy lạnh', 'Bếp', 'Máy giặt', 'Smart TV'], price1Month: 8000000, price6Months: 7500000, status: 'Đang thuê' },
];

export const mockBookings: Booking[] = [
  { id: 'bk1', customerName: 'Nguyễn Văn A', roomName: 'Phòng 102 - Alpha', checkInDate: '2026-04-01', checkOutDate: '2026-10-01', services: ['Dọn dẹp', 'Internet'], totalAmount: 30000000, status: 'Chờ duyệt' },
  { id: 'bk2', customerName: 'Trần Thị B', roomName: 'Căn hộ 3A - Gamma', checkInDate: '2026-03-15', checkOutDate: '2027-03-15', services: ['Gửi xe oto'], totalAmount: 96000000, status: 'Đang ở' },
  { id: 'bk3', customerName: 'Lê Văn C', roomName: 'Phòng 205 - Beta', checkInDate: '2026-03-25', checkOutDate: '2026-09-25', services: [], totalAmount: 18000000, status: 'Đã đặt cọc' },
];

export const mockMaintenances: MaintenanceRequest[] = [
  { id: 'm1', customerName: 'Trần Thị B', roomName: 'Căn hộ 3A - Gamma', issueDescription: 'Hỏng máy lạnh không mát', status: 'Chờ xử lý', createdAt: '2026-03-30T10:00:00Z' },
  { id: 'm2', customerName: 'Phạm Đức D', roomName: 'Phòng 101 - Alpha', issueDescription: 'Nghẹt bồn cầu', status: 'Đang sửa', createdAt: '2026-03-29T14:30:00Z' },
  { id: 'm3', customerName: 'Hoàng Lan', roomName: 'Phòng 201 - Beta', issueDescription: 'Bóng đèn cháy', status: 'Đã hoàn thành', createdAt: '2026-03-25T08:15:00Z' },
];

export const mockRevenueData: RevenueRecord[] = [
  { month: 'Tháng 10', revenue: 85000000, commission: 4250000, netIncome: 80750000 },
  { month: 'Tháng 11', revenue: 92000000, commission: 4600000, netIncome: 87400000 },
  { month: 'Tháng 12', revenue: 110000000, commission: 5500000, netIncome: 104500000 },
  { month: 'Tháng 1', revenue: 105000000, commission: 5250000, netIncome: 99750000 },
  { month: 'Tháng 2', revenue: 98000000, commission: 4900000, netIncome: 93100000 },
  { month: 'Tháng 3', revenue: 125000000, commission: 6250000, netIncome: 118750000 },
];

export const mockTransactions: TransactionRecord[] = [
  { id: 'tx1', type: 'Booking', amount: 30000000, date: '2026-04-01', status: 'Thành công', description: 'Nguyễn Văn A đặt cọc Phòng 102 - Alpha' },
  { id: 'tx2', type: 'Payout', amount: 118750000, date: '2026-03-31', status: 'Đang xử lý', description: 'Nền tảng thanh toán doanh thu Tháng 3' },
  { id: 'tx3', type: 'Booking', amount: 18000000, date: '2026-03-25', status: 'Thành công', description: 'Lê Văn C thanh toán Phòng 205 - Beta' },
  { id: 'tx4', type: 'Payout', amount: 93100000, date: '2026-02-28', status: 'Thành công', description: 'Nền tảng thanh toán doanh thu Tháng 2' },
];
