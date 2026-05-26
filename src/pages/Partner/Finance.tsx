import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Wallet, TrendingUp, HandCoins, ArrowRightLeft, Calendar, 
  AlertCircle, ArrowUpRight, ArrowDownRight, Sparkles, Inbox 
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useQuery } from '@tanstack/react-query';
import { usePartnerRevenueAnalyticsQuery } from '@/hooks/usePartnerDashboardQuery';
import { partnerService } from '@/services/partnerService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  normalizePartnerBookingStatusCode, 
  getPartnerRowDisplayStatus, 
  getPartnerBookingBadgeClass,
  formatPartnerBookingDateVi 
} from '@/utils/partnerBookingDisplay';

const mapMonthToLabel = (monthStr: string) => {
  if (!monthStr) return '';
  const parts = monthStr.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    return `Tháng ${month}/${year}`;
  }
  return monthStr;
};

const Finance: React.FC = () => {
  // Query 1: Revenue Analytics from Partner Dashboard
  const { 
    data: revenueData, 
    isLoading: isRevenueLoading, 
    isError: isRevenueError,
    refetch: refetchRevenue 
  } = usePartnerRevenueAnalyticsQuery();

  // Query 2: Recent bookings representing transactions
  const { 
    data: recentBookings, 
    isLoading: isBookingsLoading, 
    isError: isBookingsError,
    refetch: refetchBookings
  } = useQuery({
    queryKey: ['partner-recent-bookings'],
    queryFn: async ({ signal }) => {
      const res: any = await partnerService.getBookings({ per_page: 5 }, { signal });
      const payload = res?.data || res;
      const paginator = payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data) 
        ? payload.data 
        : payload;
      return Array.isArray(paginator.data) ? paginator.data : (Array.isArray(paginator) ? paginator : []);
    }
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}Tr`;
    }
    return value.toLocaleString('vi-VN');
  };

  // Process data for charts
  const processedRevenueData = React.useMemo(() => {
    if (!revenueData || !Array.isArray(revenueData)) return [];
    return revenueData.map((item: any) => ({
      ...item,
      monthLabel: mapMonthToLabel(item.month)
    }));
  }, [revenueData]);

  // Extract current month KPI
  const currentMonthRecord = React.useMemo(() => {
    if (processedRevenueData.length === 0) return null;
    return processedRevenueData[processedRevenueData.length - 1];
  }, [processedRevenueData]);

  // Extract previous month KPI
  const previousMonthRecord = React.useMemo(() => {
    if (processedRevenueData.length < 2) return null;
    return processedRevenueData[processedRevenueData.length - 2];
  }, [processedRevenueData]);

  // Compute month-over-month trend
  const revenueTrend = React.useMemo(() => {
    if (!currentMonthRecord || !previousMonthRecord) return null;
    const curr = currentMonthRecord.revenue || 0;
    const prev = previousMonthRecord.revenue || 0;
    if (prev === 0) return null;
    return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
  }, [currentMonthRecord, previousMonthRecord]);

  const handleRetryAll = () => {
    refetchRevenue();
    refetchBookings();
  };

  // Full Screen Error State
  if (isRevenueError && isBookingsError) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/30 p-8 text-center">
        <div className="rounded-full bg-red-100 p-3 text-red-600">
          <AlertCircle size={32} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-red-800">Không thể tải dữ liệu tài chính</h3>
        <p className="mt-2 max-w-sm text-sm text-red-600">
          Đã có lỗi xảy ra trong quá trình truy xuất dữ liệu báo cáo tài chính từ máy chủ. Vui lòng thử lại.
        </p>
        <button 
          onClick={handleRetryAll}
          className="mt-6 rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white transition-all hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20 active:scale-95"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Doanh thu & Tài chính</h1>
            <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              <Sparkles size={12} className="animate-pulse text-indigo-600" /> Dữ liệu trực tiếp
            </span>
          </div>
          <p className="mt-1 text-gray-500">Theo dõi dòng tiền, thống kê doanh thu thực tế và quản lý các giao dịch phòng.</p>
        </div>
        <button 
          onClick={handleRetryAll}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          Làm mới
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
          {isRevenueLoading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-gray-100"></div>
                <div className="h-4 w-32 rounded bg-gray-100"></div>
              </div>
              <div className="h-8 w-40 rounded bg-gray-100 mt-2"></div>
              <div className="h-4 w-28 rounded bg-gray-100"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Wallet size={24} />
                </div>
                <span className="font-semibold text-gray-500">Tổng doanh thu (Tháng này)</span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-gray-900">
                {(currentMonthRecord?.revenue ?? 0).toLocaleString('vi-VN')} ₫
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
                {revenueTrend !== null ? (
                  revenueTrend >= 0 ? (
                    <span className="flex items-center gap-0.5 text-emerald-600">
                      <ArrowUpRight size={16} /> +{revenueTrend}%
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-red-600">
                      <ArrowDownRight size={16} /> {revenueTrend}%
                    </span>
                  )
                ) : (
                  <span className="text-gray-400">—</span>
                )}
                <span className="text-gray-400 font-normal">so với tháng trước</span>
              </div>
            </>
          )}
        </div>

        {/* Card 2: Net Income */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
          {isRevenueLoading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-gray-100"></div>
                <div className="h-4 w-32 rounded bg-gray-100"></div>
              </div>
              <div className="h-8 w-40 rounded bg-gray-100 mt-2"></div>
              <div className="h-4 w-28 rounded bg-gray-100"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <HandCoins size={24} />
                </div>
                <span className="font-semibold text-gray-500">Lợi nhuận thực nhận (Net)</span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-gray-900 animate-fade-in">
                {(currentMonthRecord?.netIncome ?? 0).toLocaleString('vi-VN')} ₫
              </p>
              <p className="mt-2 text-xs font-medium text-gray-500">
                Đã trừ <span className="font-bold text-amber-600">{(currentMonthRecord?.commission ?? 0).toLocaleString('vi-VN')} ₫</span> phí nền tảng (5%)
              </p>
            </>
          )}
        </div>

        {/* Card 3: Pending matching balance */}
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 size-32 rounded-full bg-indigo-50/40 blur-3xl"></div>
          {isRevenueLoading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-gray-100"></div>
                <div className="h-4 w-32 rounded bg-gray-100"></div>
              </div>
              <div className="h-8 w-40 rounded bg-gray-100 mt-2"></div>
              <div className="h-8 w-full rounded bg-gray-100 mt-auto"></div>
            </div>
          ) : (
            <>
              <div className="relative z-10 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <ArrowRightLeft size={24} />
                </div>
                <span className="font-semibold text-gray-500">Số dư chuẩn bị đối soát</span>
              </div>
              <p className="relative z-10 mt-3 text-3xl font-extrabold text-indigo-600">
                {(currentMonthRecord?.netIncome ?? 0).toLocaleString('vi-VN')} ₫
              </p>
              <button className="relative z-10 mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300 active:scale-95">
                Cài đặt tài khoản nhận tiền
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart Section */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu tài chính</h2>
            <Select defaultValue="6-months">
              <SelectTrigger className="w-40 border-gray-200 bg-gray-50/50">
                <SelectValue placeholder="Chọn khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6-months">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-blue-500" /> 6 tháng qua
                  </div>
                </SelectItem>
                <SelectItem value="this-year">
                   <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500" /> Năm nay
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-80 w-full">
            {isRevenueLoading ? (
              <div className="flex h-full w-full items-center justify-center bg-gray-50/30 rounded-xl border border-dashed border-gray-200">
                <Spinner size="md" showText text="Đang tạo biểu đồ phân tích..." />
              </div>
            ) : processedRevenueData.length === 0 ? (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50/30 rounded-xl border border-dashed border-gray-200 p-8 text-center">
                <Inbox size={40} className="text-gray-300" />
                <p className="mt-2 text-sm font-semibold text-gray-500">Không có dữ liệu biểu đồ</p>
                <p className="text-xs text-gray-400">Doanh thu sẽ được biểu diễn khi có booking được xác nhận.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} dy={10} style={{ fontSize: '11px', fontWeight: '500' }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={formatCurrency} style={{ fontSize: '11px', fontWeight: '500' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: any) => [`${value.toLocaleString('vi-VN')} ₫`]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="netIncome" name="Thực nhận đối tác" fill="url(#blueGradient)" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="commission" name="Phí hệ thống (5%)" fill="#A5F3FC" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Giao dịch gần đây</h2>
            <a href="/partner/bookings" className="text-sm font-semibold text-indigo-600 hover:underline">
              Xem tất cả
            </a>
          </div>
          
          <div className="space-y-4">
            {isBookingsLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-gray-100"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-gray-100 rounded"></div>
                      <div className="h-3 w-20 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-gray-100 rounded"></div>
                </div>
              ))
            ) : recentBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-gray-50 p-4 text-gray-400">
                  <Inbox size={32} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-gray-800">Chưa có giao dịch</h3>
                <p className="mt-1 text-xs text-gray-500 max-w-[200px]">
                  Các booking đặt phòng thành công sẽ được liệt kê ở đây.
                </p>
              </div>
            ) : (
              recentBookings.map((booking: any) => {
                const rawStatus = normalizePartnerBookingStatusCode(booking.status ?? booking.booking_status);
                const isExpense = rawStatus === 2; // Cancelled
                const totalAmount = Number(booking.totalAmount ?? booking.price ?? 0);
                const displayStatus = getPartnerRowDisplayStatus(rawStatus, booking.stay_status);
                const badgeClass = getPartnerBookingBadgeClass(rawStatus, booking.stay_status);

                return (
                  <div 
                    key={booking.id} 
                    className="flex items-center justify-between border-b border-gray-100 pb-4 transition-all hover:bg-gray-50/50 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`rounded-full p-2.5 ${isExpense ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {isExpense ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate text-sm font-bold text-gray-800">
                          {booking.guestName ?? booking.user_name ?? 'Khách đặt phòng'}
                        </p>
                        <p className="truncate text-xs text-gray-400 mt-0.5">
                          {booking.roomName ?? booking.room_number ?? 'Phòng'} • {formatPartnerBookingDateVi(booking.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="ml-4 whitespace-nowrap text-right">
                      <p className={`text-sm font-black ${isExpense ? 'text-red-600 line-through' : 'text-emerald-600'}`}>
                        {isExpense ? '' : '+'}{totalAmount.toLocaleString('vi-VN')} ₫
                      </p>
                      <span className={`mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}>
                        {displayStatus}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
