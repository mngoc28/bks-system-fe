import React from 'react';
import { Building, DoorOpen, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { mockStats, mockBookings, mockMaintenances } from './mockData';

const Dashboard: React.FC = () => {
  const pendingBookings = mockBookings.filter(b => b.status === 'Chờ duyệt');
  const urgentMaintenances = mockMaintenances.filter(m => m.status === 'Chờ xử lý');

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-500 mt-1">Theo dõi hoạt động kinh doanh và trạng thái tài sản của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard title="Tòa nhà/Khu" value={mockStats.totalBuildings} icon={Building} colorClass="bg-blue-100 text-blue-600" />
        <StatCard title="Tổng số phòng" value={mockStats.totalRooms} icon={DoorOpen} colorClass="bg-indigo-100 text-indigo-600" />
        <StatCard title="Phòng trống" value={mockStats.vacantRooms} icon={AlertCircle} colorClass="bg-amber-100 text-amber-600" />
        <StatCard title="Tỷ lệ lấp đầy" value={`${mockStats.occupancyRate}%`} icon={TrendingUp} colorClass="bg-emerald-100 text-emerald-600" />
        <StatCard title="Doanh thu (Ước tính)" value={`${mockStats.estimatedRevenue.toLocaleString('vi-VN')} ₫`} icon={DollarSign} colorClass="bg-purple-100 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Booking Cần Duyệt</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">Xem tất cả</button>
          </div>
          {pendingBookings.length === 0 ? (
            <p className="text-gray-500 text-sm">Không có booking mới nào chờ duyệt.</p>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map(bk => (
                <div key={bk.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800">{bk.customerName}</p>
                    <p className="text-sm text-gray-500">{bk.roomName} • {bk.checkInDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">Duyệt</button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200">Từ chối</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Maintenances */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Yêu cầu bảo trì khẩn</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">Xem tất cả</button>
          </div>
          {urgentMaintenances.length === 0 ? (
            <p className="text-gray-500 text-sm">Tuyệt vời! Không có sự cố nào cần xử lý ngay.</p>
          ) : (
            <div className="space-y-4">
              {urgentMaintenances.map(mt => (
                <div key={mt.id} className="flex flex-col gap-2 p-4 border border-red-100 bg-red-50/30 rounded-lg">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-800">{mt.roomName}</p>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">Chờ xử lý</span>
                  </div>
                  <p className="text-sm text-gray-600">{mt.issueDescription}</p>
                  <p className="text-xs text-gray-400 mt-1">Báo cáo bởi: {mt.customerName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
