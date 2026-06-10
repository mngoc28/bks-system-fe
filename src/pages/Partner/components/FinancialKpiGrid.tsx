import React from 'react';
import { CalendarClock, DollarSign } from 'lucide-react';
import type { PartnerHeadlineKpis } from '@/api/partnerDashboardApi';
import KpiStatCard from './KpiStatCard';
import {
  CONFIRM_SLA_VALUE_CLASS,
  formatCompactNumber,
  formatConfirmDuration,
  formatDashboardCurrency,
  getConfirmSlaTone,
  monthSubLabel,
} from './dashboardFormatters';

interface FinancialKpiGridProps {
  headlineKpis?: PartnerHeadlineKpis;
  isLoading?: boolean;
}

const FinancialKpiGrid: React.FC<FinancialKpiGridProps> = ({ headlineKpis, isLoading = false }) => {
  const monthLabel = monthSubLabel();
  const confirmTone = getConfirmSlaTone(headlineKpis?.avgConfirmSeconds);
  const gmv = headlineKpis?.gmvMtd ?? 0;
  const net = headlineKpis?.netRevenueMtd ?? 0;

  return (
    <section aria-label="Tài chính tháng" className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tài chính tháng</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiStatCard
          title="GMV tháng"
          value={formatCompactNumber(gmv)}
          subLabel={monthLabel}
          icon={DollarSign}
          colorClass="bg-amber-100 text-amber-700"
          isLoading={isLoading}
          tooltip="Tổng giá trị booking confirmed/completed trong tháng hiện tại"
          compactTooltip={formatDashboardCurrency(gmv)}
        />
        <KpiStatCard
          title="Doanh thu thực nhận"
          value={formatCompactNumber(net)}
          subLabel={monthLabel}
          icon={DollarSign}
          colorClass="bg-emerald-100 text-emerald-700"
          isLoading={isLoading}
          tooltip="GMV tháng × (1 − 5% hoa hồng BKS). Chưa trừ hoàn tiền."
          compactTooltip={formatDashboardCurrency(net)}
        />
        <KpiStatCard
          title="Thời gian xác nhận TB"
          value={formatConfirmDuration(headlineKpis?.avgConfirmSeconds)}
          subLabel="30 ngày gần nhất"
          icon={CalendarClock}
          colorClass="bg-cyan-100 text-cyan-700"
          isLoading={isLoading}
          tooltip="Trung bình thời gian từ lúc tạo booking đến lúc partner xác nhận. Mục tiêu SLA: ≤ 5 phút."
          valueClassName={CONFIRM_SLA_VALUE_CLASS[confirmTone]}
        />
      </div>
    </section>
  );
};

export default FinancialKpiGrid;
