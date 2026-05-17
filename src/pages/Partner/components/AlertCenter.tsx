import React from 'react';
import { AlertTriangle, ArrowRight, CalendarClock, FileClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpiringContracts } from '@/hooks/Partner/useExpiringContracts';

interface AlertCenterProps {
  pendingCount: number;
  overbookingCount?: number;
}

/**
 * Alert Center (Partner Portal 360 Phase 4 T4.7, Phase 5 T5.5).
 *
 * Hợp đồng sắp hết hạn lấy từ `/partner/contracts/expiring-soon` — chỉ liệt
 * kê LEASE_AGREEMENT có `renewal_reminder_at` đã set và chưa terminated.
 */
const AlertCenter: React.FC<AlertCenterProps> = ({ pendingCount, overbookingCount = 0 }) => {
  const navigate = useNavigate();
  const expiringContractsQuery = useExpiringContracts();
  const expiringContracts = expiringContractsQuery.data ?? [];
  const expiringCount = expiringContracts.length;
  const nextExpiring = expiringContracts[0];

  const totalAlerts = pendingCount + overbookingCount + expiringCount;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">Cần xử lý ngay</CardTitle>
          <CardDescription>Ưu tiên vận hành theo booking, calendar và hợp đồng.</CardDescription>
        </div>
        <Badge variant="outline" className="bg-white">
          {totalAlerts} cảnh báo
        </Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
                <CalendarClock size={16} /> Pending booking
              </p>
              <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
              <p className="text-xs text-amber-700/80">Booking đang chờ partner duyệt.</p>
            </div>
            <Button size="sm" variant="ghost" className="text-amber-800 flex-shrink-0" onClick={() => navigate('/partner/bookings?status=pending')}>
              Xử lý <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="flex items-center gap-2 text-sm font-bold text-rose-800">
                <AlertTriangle size={16} /> Overbooking
              </p>
              <p className="text-2xl font-black text-rose-700">{overbookingCount}</p>
              <p className="text-xs text-rose-700/80">Kiểm tra Calendar để điều phối room/date khi có cảnh báo.</p>
            </div>
            <Button size="sm" variant="ghost" className="text-rose-800 flex-shrink-0" onClick={() => navigate('/partner/calendar')}>
              Calendar <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <FileClock size={16} /> Contract sắp hết hạn
              </p>
              <p className="text-2xl font-black text-slate-700">
                {expiringContractsQuery.isLoading ? '...' : expiringCount}
              </p>
              <p className="truncate text-xs text-slate-500">
                {nextExpiring && nextExpiring.booking_end_date
                  ? `Sớm nhất: ${new Date(nextExpiring.booking_end_date).toLocaleDateString('vi-VN')} · ${nextExpiring.guest_name ?? 'Khách'}`
                  : 'Scheduler 06:00 đánh dấu hợp đồng còn ≤ 30 ngày.'}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-700 flex-shrink-0"
              onClick={() => navigate(nextExpiring ? `/partner/contracts/${nextExpiring.id}` : '/partner/contracts')}
            >
              Hợp đồng <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertCenter;
