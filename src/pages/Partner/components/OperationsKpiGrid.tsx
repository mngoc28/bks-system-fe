import React from 'react';
import { LogIn, LogOut, TrendingUp, Users } from 'lucide-react';
import type { PartnerStats } from '@/api/partnerDashboardApi';
import KpiStatCard from './KpiStatCard';
import { todaySubLabel } from './dashboardFormatters';

interface OperationsKpiGridProps {
  stats?: PartnerStats;
  isLoading?: boolean;
}

const OperationsKpiGrid: React.FC<OperationsKpiGridProps> = ({ stats, isLoading = false }) => {
  const todayLabel = todaySubLabel();

  return (
    <section aria-label="Vận hành hôm nay" className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Vận hành hôm nay</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          title="Check-in hôm nay"
          value={stats?.todayCheckInCount ?? 0}
          subLabel={todayLabel}
          icon={LogIn}
          colorClass="bg-blue-100 text-blue-700"
          isLoading={isLoading}
          tooltip="Số booking đã xác nhận có ngày nhận phòng là hôm nay"
        />
        <KpiStatCard
          title="Check-out hôm nay"
          value={stats?.todayCheckOutCount ?? 0}
          subLabel={todayLabel}
          icon={LogOut}
          colorClass="bg-indigo-100 text-indigo-700"
          isLoading={isLoading}
          tooltip="Số booking đã xác nhận có ngày trả phòng là hôm nay"
        />
        <KpiStatCard
          title="Đang lưu trú"
          value={stats?.inStayCount ?? 0}
          subLabel="Phòng có khách"
          icon={Users}
          colorClass="bg-violet-100 text-violet-700"
          isLoading={isLoading}
          tooltip="Booking đang ở trạng thái checked-in"
        />
        <KpiStatCard
          title="Lấp đầy hôm nay"
          value={`${stats?.occupancyRate ?? 0}%`}
          subLabel="Phòng có khách / Tổng phòng"
          icon={TrendingUp}
          colorClass="bg-emerald-100 text-emerald-700"
          isLoading={isLoading}
          tooltip="Tỷ lệ phòng đang có khách so với tổng số phòng vật lý"
        />
      </div>
    </section>
  );
};

export default OperationsKpiGrid;
