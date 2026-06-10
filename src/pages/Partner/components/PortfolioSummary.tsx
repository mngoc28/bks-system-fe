import React, { useState } from 'react';
import { Building2, ChevronDown, DoorOpen, DollarSign, Layers } from 'lucide-react';
import type { PartnerStats } from '@/api/partnerDashboardApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import KpiStatCard from './KpiStatCard';
import { formatCompactNumber, formatDashboardCurrency, monthSubLabel } from './dashboardFormatters';

interface PortfolioSummaryProps {
  stats?: PartnerStats;
  isLoading?: boolean;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ stats, isLoading = false }) => {
  const [expanded, setExpanded] = useState(true);
  const estimated = stats?.estimatedRevenue ?? 0;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
        <CardTitle className="text-base font-bold text-slate-800">Tài sản tổng quan</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-slate-600"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? 'Thu gọn' : 'Xem chi tiết'}
          <ChevronDown
            size={16}
            className={`ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </Button>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiStatCard
                title="Cơ sở lưu trú"
                value={stats?.totalProperties ?? 0}
                subLabel="Toàn bộ portfolio"
                icon={Building2}
                colorClass="bg-blue-100 text-blue-700"
              />
              <KpiStatCard
                title="Tổng số phòng"
                value={stats?.totalRooms ?? 0}
                subLabel="Phòng vật lý"
                icon={Layers}
                colorClass="bg-indigo-100 text-indigo-700"
              />
              <KpiStatCard
                title="Phòng trống"
                value={stats?.vacantRooms ?? 0}
                subLabel="Hiện tại"
                icon={DoorOpen}
                colorClass="bg-rose-100 text-rose-700"
              />
              <KpiStatCard
                title="Doanh thu dự kiến"
                value={formatCompactNumber(estimated)}
                subLabel={monthSubLabel()}
                icon={DollarSign}
                colorClass="bg-amber-100 text-amber-700"
                tooltip="Tổng doanh thu booking trong tháng hiện tại (ước tính)"
                compactTooltip={formatDashboardCurrency(estimated)}
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default PortfolioSummary;
