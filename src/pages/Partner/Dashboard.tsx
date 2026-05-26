import React from 'react';
import { 
  Building2, 
  DoorOpen, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CalendarClock,
  ArrowRight,
  User,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  usePartnerStatsQuery, 
  usePartnerPendingBookingsQuery, 
  usePartnerUrgentMaintenancesQuery,
  usePartnerRevenueAnalyticsQuery,
  usePartnerHeadlineKpisQuery,
  usePartnerOccupancyChartQuery,
  usePartnerGmvChartQuery
} from '@/hooks/usePartnerDashboardQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuickConfirm } from '@/hooks/Partner/useQuickConfirm';
import CancelBookingDialog from './components/CancelBookingDialog';
import { partnerService } from '@/services/partnerService';
import { Undo2 } from 'lucide-react';
import { useState } from 'react';
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OccupancyChart from './components/OccupancyChart';
import GmvChart from './components/GmvChart';
import AlertCenter from './components/AlertCenter';
import { Spinner } from '@/components/ui/spinner';



interface RevenueAnalytics {
  month: string;
  revenue: number;
  commission: number;
  netIncome: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = usePartnerStatsQuery();
  const { data: pendingBookings, isLoading: bookingsLoading } = usePartnerPendingBookingsQuery();
  const { data: urgentMaintenances, isLoading: maintenanceLoading } = usePartnerUrgentMaintenancesQuery();
  const { data: revenueAnalytics, isLoading: revenueLoading } = usePartnerRevenueAnalyticsQuery() as { data: RevenueAnalytics[] | undefined, isLoading: boolean };
  const { data: headlineKpis, isLoading: kpisLoading } = usePartnerHeadlineKpisQuery();
  const { data: occupancyChart, isLoading: occupancyChartLoading } = usePartnerOccupancyChartQuery();
  const { data: gmvChart, isLoading: gmvChartLoading } = usePartnerGmvChartQuery();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(value);
  };

  const formatCompactNumber = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} tỷ`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)} tr`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)} k`;
    return value.toString();
  };

  const formatDuration = (seconds?: number | null) => {
    if (seconds === null || seconds === undefined) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} phút`;
    return `${(seconds / 3600).toFixed(1)} giờ`;
  };

  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const { confirm: quickConfirm, undo: undoConfirm, isPending: isPendingConfirm, remainingMs } = useQuickConfirm();

  const handleApprove = (id: number) => {
    quickConfirm(id);
  };

  const handleReject = (id: number) => {
    setCancelTargetId(id);
  };

  const handleCancelSubmit = async (reason: string) => {
    if (cancelTargetId === null) return;
    try {
      await partnerService.cancelBooking(cancelTargetId, reason);
      toastSuccess('Đã huỷ booking.');
    } catch (e) {
      toastError('Huỷ booking thất bại.');
      throw e;
    }
  };

  const StatItem = ({ title, value, rawValue, icon: Icon, colorClass, isLoading, tooltip }: any) => (
    <Card className="overflow-hidden transition-all hover:shadow-md border-none bg-slate-50/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`rounded-lg p-2.5 ${colorClass}`}>
            <Icon size={20} />
          </div>
          {isLoading ? (
            <Skeleton className="h-4 w-12" />
          ) : (
            <span className="text-xs font-medium text-slate-400">Hiện tại</span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-500" title={tooltip}>{title}</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-9 w-3/4" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
              {rawValue && (
                <span className="text-[10px] text-slate-400" title={rawValue.toString()}>
                  Full: {formatCurrency(rawValue)}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Chào mừng trở lại! Đây là những gì đang diễn ra với hệ thống của bạn.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white px-3 py-1.5 font-medium text-slate-600 shadow-sm">
            <History size={14} className="mr-1.5" />
            Cập nhật: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
        <StatItem 
          title="Cơ sở lưu trú" 
          value={stats?.totalProperties || 0} 
          icon={Building2} 
          colorClass="bg-blue-100 text-blue-700" 
          isLoading={statsLoading}
        />
        <StatItem 
          title="Tổng số phòng" 
          value={stats?.totalRooms || 0} 
          icon={DoorOpen} 
          colorClass="bg-indigo-100 text-indigo-700" 
          isLoading={statsLoading}
        />
        <StatItem 
          title="Phòng trống" 
          value={stats?.vacantRooms || 0} 
          icon={AlertCircle} 
          colorClass="bg-rose-100 text-rose-700" 
          isLoading={statsLoading}
        />
        <StatItem 
          title="Tỷ lệ lấp đầy" 
          value={`${stats?.occupancyRate || 0}%`} 
          icon={TrendingUp} 
          colorClass="bg-emerald-100 text-emerald-700" 
          isLoading={statsLoading}
        />
        <StatItem 
          title="Doanh thu dự kiến" 
          value={formatCompactNumber(stats?.estimatedRevenue || 0)} 
          rawValue={stats?.estimatedRevenue || 0}
          icon={DollarSign} 
          colorClass="bg-amber-100 text-amber-700" 
          isLoading={statsLoading}
        />
        <StatItem
          title="Time-to-confirm TB"
          value={formatDuration(headlineKpis?.avgConfirmSeconds)}
          icon={CalendarClock}
          colorClass="bg-cyan-100 text-cyan-700"
          isLoading={kpisLoading}
          tooltip="Trung bình thời gian từ lúc booking được tạo đến lúc partner xác nhận, loại trừ dữ liệu backfill."
        />
        <StatItem
          title="Net Revenue"
          value={formatCompactNumber(headlineKpis?.netRevenueMtd || 0)}
          rawValue={headlineKpis?.netRevenueMtd || 0}
          icon={DollarSign}
          colorClass="bg-emerald-100 text-emerald-700"
          isLoading={kpisLoading}
          tooltip="Net Revenue = GMV tháng hiện tại × (1 - commission rate 5%)."
        />
      </div>

      <AlertCenter
        pendingCount={headlineKpis?.pendingCount ?? (pendingBookings?.length || 0)}
        overbookingCount={0}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <OccupancyChart data={occupancyChart} isLoading={occupancyChartLoading} />
        <GmvChart data={gmvChart} isLoading={gmvChartLoading} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Analytics Card */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Phân tích doanh thu</CardTitle>
              <CardDescription>Thống kê doanh thu thực tế so với thực nhận hàng tháng.</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span> Tổng thu
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Thực nhận
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="h-[400px] w-full mt-auto">
              {revenueLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner size="md" spinnerClassName="border-y-blue-600" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueAnalytics} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="net" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`}
                    />
                    <Tooltip 
                      formatter={(v: any) => formatCurrency(v)}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#revenue)" />
                    <Area type="monotone" dataKey="netIncome" stroke="#10b981" strokeWidth={2.5} fill="url(#net)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Work Queue Card */}
        <Card className="shadow-sm border-slate-200 flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Yêu cầu mới</CardTitle>
              <CardDescription>Cần bạn xử lý ngay</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate('/partner/bookings')}>
              <ArrowRight size={18} className="text-slate-400" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {bookingsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                </div>
              ) : !pendingBookings || pendingBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="rounded-full bg-slate-50 p-4 mb-4">
                    <CalendarClock size={40} className="text-slate-200" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Chưa có yêu cầu mới</p>
                </div>
              ) : (
                pendingBookings.map((bk: any) => (
                  <div key={bk.id} className="group relative flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 transition-all hover:bg-slate-50/50 hover:border-slate-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <User size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 break-words">{bk.user_name || "Khách hàng"}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Phòng: <span className="font-semibold">{bk.room_number || "N/A"}</span></p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none text-[10px] uppercase">Pending</Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-medium">Nhận phòng: {bk.start_date}</span>
                      <div className="flex gap-2">
                        {isPendingConfirm(bk.id) ? (
                          <Button size="sm" variant="outline" className="h-7 px-3 border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => undoConfirm(bk.id)}>
                            <Undo2 size={14} className="mr-1" />
                            Hoàn tác ({Math.ceil(remainingMs(bk.id) / 1000)}s)
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleReject(bk.id)}>Từ chối</Button>
                            <Button size="sm" className="h-7 px-3 bg-blue-600 hover:bg-blue-700" onClick={() => handleApprove(bk.id)}>Duyệt</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Section */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Bảo trì & Sự cố khẩn cấp</CardTitle>
            <CardDescription>Các yêu cầu cần hỗ trợ kỹ thuật gấp từ khách hàng.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/partner/maintenances')}>
            Quản lý bảo trì
          </Button>
        </CardHeader>
        <CardContent>
          {maintenanceLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : !urgentMaintenances || urgentMaintenances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-emerald-50 p-4 mb-4">
                <TrendingUp size={40} className="text-emerald-200" />
              </div>
              <p className="text-sm font-medium text-slate-500">Mọi thứ vẫn ổn! Không có sự cố nào báo cáo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {urgentMaintenances.map((mt: any) => (
                <div key={mt.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md">
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-rose-600">
                        <AlertCircle size={16} />
                      </div>
                      <span className="break-words">{mt.roomName}</span>
                    </div>
                    <Badge variant={mt.status === 'in_progress' ? 'default' : 'destructive'} className="text-[10px] uppercase">
                      {mt.status === 'in_progress' ? 'Đang sửa' : 'Khẩn cấp'}
                    </Badge>
                  </div>
                  <div className="p-4 space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed break-words">{mt.issueDescription}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <User size={12} />
                        </div>
                        <span className="text-xs text-slate-500 truncate">
                          Bởi: <span className="font-semibold text-slate-700">{mt.customerName || "Hệ thống"}</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{new Date(mt.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CancelBookingDialog
        open={cancelTargetId !== null}
        bookingId={cancelTargetId}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleCancelSubmit}
        title={cancelTargetId ? `Xác nhận từ chối booking #${cancelTargetId}` : undefined}
        description={cancelTargetId ? "Vui lòng nhập lý do từ chối booking này. Lý do sẽ được lưu lại và gửi tới khách hàng." : undefined}
        confirmText="Từ chối booking"
      />
    </div>
  );
};

export default Dashboard;

