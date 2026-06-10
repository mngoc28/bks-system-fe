import React, { useState } from 'react';
import { ArrowRight, CalendarClock, History, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsFetching } from '@tanstack/react-query';
import {
  usePartnerStatsQuery,
  usePartnerPendingBookingsQuery,
  usePartnerUrgentMaintenancesQuery,
  usePartnerHeadlineKpisQuery,
  usePartnerOccupancyChartQuery,
  usePartnerGmvChartQuery,
} from '@/hooks/usePartnerDashboardQuery';
import { usePartnerDashboardRefresh } from '@/hooks/usePartnerDashboardRefresh';
import { useDashboardPropertyFilter } from '@/hooks/Partner/useDashboardPropertyFilter';
import { buildPartnerDashboardLink } from '@/utils/partnerDashboardLinks';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuickConfirm } from '@/hooks/Partner/useQuickConfirm';
import CancelBookingDialog from './components/CancelBookingDialog';
import { partnerService } from '@/services/partnerService';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OccupancyChart from './components/OccupancyChart';
import GmvChart from './components/GmvChart';
import AlertCenter from './components/AlertCenter';
import OperationsKpiGrid from './components/OperationsKpiGrid';
import FinancialKpiGrid from './components/FinancialKpiGrid';
import PortfolioSummary from './components/PortfolioSummary';
import MaintenanceSection from './components/MaintenanceSection';
import PendingBookingCard from './components/PendingBookingCard';
import DashboardPropertyFilter from './components/DashboardPropertyFilter';
import { ROUTERS } from '@/constant';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { refreshDashboard } = usePartnerDashboardRefresh();
  const { propertyId, selectedPropertyKey, setPropertyId } = useDashboardPropertyFilter();
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stats, isLoading: statsLoading } = usePartnerStatsQuery(propertyId);
  const { data: pendingBookings, isLoading: bookingsLoading } = usePartnerPendingBookingsQuery(propertyId);
  const { data: urgentMaintenances, isLoading: maintenanceLoading } = usePartnerUrgentMaintenancesQuery();
  const { data: headlineKpis, isLoading: kpisLoading } = usePartnerHeadlineKpisQuery(propertyId);
  const { data: occupancyChart, isLoading: occupancyChartLoading } = usePartnerOccupancyChartQuery(propertyId);
  const { data: gmvChart, isLoading: gmvChartLoading } = usePartnerGmvChartQuery(propertyId);

  const dashboardFetching = useIsFetching({
    predicate: (query) =>
      ['partner-stats', 'partner-pending-bookings', 'partner-urgent-maintenances'].some((key) =>
        query.queryKey.includes(key),
      ) ||
      (query.queryKey[0] === 'partner' && query.queryKey[1] === 'dashboard'),
  });

  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const { confirm: quickConfirm, undo: undoConfirm, isPending: isPendingConfirm, remainingMs } =
    useQuickConfirm();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDashboard();
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePropertyChange = (propertyKey: string | null) => {
    setPropertyId(propertyKey != null ? Number(propertyKey) : null);
  };

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

  const pendingCount = headlineKpis?.pendingCount ?? pendingBookings?.length ?? 0;

  const bookingsLink = buildPartnerDashboardLink(ROUTERS.PARTNER_BOOKINGS, {
    propertyId,
    status: 0,
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-1 py-4 sm:space-y-8 sm:px-4 sm:py-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Bảng điều khiển</h1>
          <p className="text-slate-500">
            Chào mừng trở lại! Đây là những gì đang diễn ra với hệ thống của bạn.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <DashboardPropertyFilter
            selectedPropertyKey={selectedPropertyKey}
            onPropertyChange={handlePropertyChange}
            className="w-full sm:w-auto sm:min-w-[240px]"
          />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white px-3 py-1.5 font-medium text-slate-600 shadow-sm">
              <History size={14} className="mr-1.5" />
              Cập nhật:{' '}
              {lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleRefresh}
              disabled={isRefreshing || dashboardFetching > 0}
            >
              <RefreshCw
                size={14}
                className={isRefreshing || dashboardFetching > 0 ? 'animate-spin text-blue-500' : ''}
              />
              {isRefreshing || dashboardFetching > 0 ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </div>
        </div>
      </div>

      <AlertCenter
        pendingCount={pendingCount}
        overbookingCount={headlineKpis?.overbookingCount ?? 0}
        pendingCancellationCount={stats?.pendingCancellationCount ?? 0}
        propertyId={propertyId}
      />

      <OperationsKpiGrid stats={stats} isLoading={statsLoading} />
      <FinancialKpiGrid headlineKpis={headlineKpis} isLoading={kpisLoading} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Card className="flex h-full flex-col border-slate-200 shadow-sm lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Yêu cầu mới</CardTitle>
              <CardDescription>Cần bạn xử lý ngay — ưu tiên chờ lâu nhất</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate(bookingsLink)}>
              <ArrowRight size={18} className="text-slate-400" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="custom-scrollbar max-h-[520px] space-y-4 overflow-y-auto pr-2 lg:max-h-[640px]">
              {bookingsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : !pendingBookings || pendingBookings.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-full bg-slate-50 p-4">
                    <CalendarClock size={40} className="text-slate-200" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Chưa có yêu cầu mới</p>
                </div>
              ) : (
                pendingBookings.map((bk) => (
                  <PendingBookingCard
                    key={bk.id}
                    booking={bk}
                    isPendingConfirm={isPendingConfirm(bk.id)}
                    remainingMs={remainingMs(bk.id)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onUndo={undoConfirm}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-8 lg:col-span-7">
          <OccupancyChart data={occupancyChart} isLoading={occupancyChartLoading} />
          <GmvChart data={gmvChart} isLoading={gmvChartLoading} />
        </div>
      </div>

      <PortfolioSummary stats={stats} isLoading={statsLoading} />

      <MaintenanceSection urgentMaintenances={urgentMaintenances} isLoading={maintenanceLoading} />

      <CancelBookingDialog
        open={cancelTargetId !== null}
        bookingId={cancelTargetId}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleCancelSubmit}
        title={cancelTargetId ? `Xác nhận từ chối booking #${cancelTargetId}` : undefined}
        description={
          cancelTargetId
            ? 'Vui lòng nhập lý do từ chối booking này. Lý do sẽ được lưu lại và gửi tới khách hàng.'
            : undefined
        }
        confirmText="Từ chối booking"
      />
    </div>
  );
};

export default Dashboard;
