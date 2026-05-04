import React from 'react';
import { Building, DoorOpen, DollarSign, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  usePartnerStatsQuery, 
  usePartnerPendingBookingsQuery, 
  usePartnerUrgentMaintenancesQuery 
} from '@/hooks/usePartnerDashboardQuery';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = usePartnerStatsQuery();
  const { data: pendingBookings, isLoading: bookingsLoading } = usePartnerPendingBookingsQuery();
  const { data: urgentMaintenances, isLoading: maintenanceLoading } = usePartnerUrgentMaintenancesQuery();

  const StatCard = ({ title, value, icon: Icon, colorClass, isLoading }: any) => (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className={`rounded-xl p-4 ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <p className="mb-1 text-sm font-medium text-gray-500">{title}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-8 w-24" />
        ) : (
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="mt-1 text-gray-500">Theo dõi hoạt động kinh doanh và trạng thái tài sản của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard 
          title="Tòa nhà/Khu" 
          value={stats?.totalBuildings || 0} 
          icon={Building} 
          colorClass="bg-blue-100 text-blue-600" 
          isLoading={statsLoading}
        />
        <StatCard 
          title="Tổng số phòng" 
          value={stats?.totalRooms || 0} 
          icon={DoorOpen} 
          colorClass="bg-indigo-100 text-indigo-600" 
          isLoading={statsLoading}
        />
        <StatCard 
          title="Phòng trống" 
          value={stats?.vacantRooms || 0} 
          icon={AlertCircle} 
          colorClass="bg-amber-100 text-amber-600" 
          isLoading={statsLoading}
        />
        <StatCard 
          title="Tỷ lệ lấp đầy" 
          value={`${stats?.occupancyRate || 0}%`} 
          icon={TrendingUp} 
          colorClass="bg-emerald-100 text-emerald-600" 
          isLoading={statsLoading}
        />
        <StatCard 
          title="Doanh thu (Ước tính)" 
          value={`${(stats?.estimatedRevenue || 0).toLocaleString('vi-VN')} ₫`} 
          icon={DollarSign} 
          colorClass="bg-purple-100 text-purple-600" 
          isLoading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Booking Cần Duyệt</h2>
            <button type="button" onClick={() => navigate('/partner/bookings')} className="text-sm font-medium text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          
          {bookingsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : !pendingBookings || pendingBookings.length === 0 ? (
            <p className="text-sm text-gray-500">Không có booking mới nào chờ duyệt.</p>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((bk: any) => (
                <div key={`bk-${bk.id}`} className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-800">{bk.user_name || "Khách hàng"}</p>
                    <p className="text-sm text-gray-500">{bk.room_number} • {bk.start_date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">Duyệt</button>
                    <button className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200">Từ chối</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Maintenances */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Yêu cầu bảo trì khẩn</h2>
            <button type="button" onClick={() => navigate('/partner/maintenances')} className="text-sm font-medium text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          
          {maintenanceLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : !urgentMaintenances || urgentMaintenances.length === 0 ? (
            <p className="text-sm text-gray-500">Tuyệt vời! Không có sự cố nào cần xử lý ngay.</p>
          ) : (
            <div className="space-y-4">
              {urgentMaintenances.map((mt: any) => (
                <div key={`mt-${mt.id}`} className="flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50/30 p-4">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-gray-800">{mt.roomName}</p>
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">{mt.status || 'Chờ xử lý'}</span>
                  </div>
                  <p className="text-sm text-gray-600">{mt.issueDescription}</p>
                  <p className="mt-1 text-xs text-gray-400">Báo cáo bởi: {mt.customerName}</p>
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
