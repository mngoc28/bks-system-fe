import React from 'react';
import { AlertCircle, CheckCircle2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { UrgentMaintenance } from '@/api/partnerDashboardApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTERS } from '@/constant';

interface MaintenanceSectionProps {
  urgentMaintenances?: UrgentMaintenance[];
  isLoading?: boolean;
}

const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({
  urgentMaintenances = [],
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const hasIssues = urgentMaintenances.length > 0;

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="py-4">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!hasIssues) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          Bảo trì: Không có sự cố khẩn cấp
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-emerald-800 hover:bg-emerald-100/60"
          onClick={() => navigate(ROUTERS.PARTNER_MAINTENANCE)}
        >
          Quản lý bảo trì
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">Bảo trì & Sự cố khẩn cấp</CardTitle>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTERS.PARTNER_MAINTENANCE)}>
          Quản lý bảo trì
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {urgentMaintenances.map((mt) => (
            <div
              key={mt.id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-rose-600 shadow-sm">
                    <AlertCircle size={16} />
                  </div>
                  <span className="break-words">{mt.roomName}</span>
                </div>
                <Badge
                  variant={mt.status === 'in_progress' ? 'default' : 'destructive'}
                  className="text-[10px] uppercase"
                >
                  {mt.status === 'in_progress' ? 'Đang sửa' : 'Khẩn cấp'}
                </Badge>
              </div>
              <div className="space-y-4 p-4">
                <p className="break-words text-sm leading-relaxed text-slate-600">{mt.issueDescription}</p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <User size={12} />
                    </div>
                    <span className="truncate text-xs text-slate-500">
                      Bởi:{' '}
                      <span className="font-semibold text-slate-700">{mt.customerName || 'Hệ thống'}</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">
                    {new Date(mt.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceSection;
