import React from 'react';
import { AlertTriangle, ArrowRight, CalendarClock, ClipboardList, FileClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpiringContracts } from '@/hooks/Partner/useExpiringContracts';
import { ROUTERS } from '@/constant';
import { isPartnerCalendarEnabled } from '@/lib/featureFlags';
import { buildPartnerDashboardLink } from '@/utils/partnerDashboardLinks';

interface AlertCenterProps {
  pendingCount: number;
  overbookingCount?: number;
  pendingCancellationCount?: number;
  propertyId?: number | null;
}

/**
 * Alert Center (Partner Portal 360 Phase 4 T4.7, Phase 5 T5.5).
 * Phase 1 dashboard: thêm ô yêu cầu hủy; việt hóa nhãn.
 */
const AlertCenter: React.FC<AlertCenterProps> = ({
  pendingCount,
  overbookingCount = 0,
  pendingCancellationCount = 0,
  propertyId = null,
}) => {
  const navigate = useNavigate();
  const expiringContractsQuery = useExpiringContracts();
  const expiringContracts = expiringContractsQuery.data ?? [];
  const expiringCount = expiringContracts.length;
  const nextExpiring = expiringContracts[0];

  const totalAlerts = pendingCount + overbookingCount + pendingCancellationCount + expiringCount;

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
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex h-full flex-col justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-2 text-sm font-bold text-amber-800">
              <CalendarClock size={16} className="shrink-0" />
              <span className="truncate">Booking chờ duyệt</span>
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 shrink-0 px-2 text-amber-800"
              onClick={() =>
                navigate(
                  buildPartnerDashboardLink(ROUTERS.PARTNER_BOOKINGS, { propertyId, status: 0 }),
                )
              }
            >
              Xử lý <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
          <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
          <p className="min-h-10 text-xs leading-relaxed text-amber-700/80">
            Booking đang chờ partner duyệt.
          </p>
        </div>

        <div className="flex h-full flex-col justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-2 text-sm font-bold text-rose-800">
              <AlertTriangle size={16} className="shrink-0" />
              <span className="truncate">Trùng phòng</span>
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 shrink-0 px-2 text-rose-800"
              onClick={() =>
                navigate(
                  buildPartnerDashboardLink(
                    isPartnerCalendarEnabled() ? ROUTERS.PARTNER_CALENDAR : ROUTERS.PARTNER_BOOKINGS,
                    { propertyId },
                  ),
                )
              }
            >
              {isPartnerCalendarEnabled() ? 'Lịch' : 'Đặt phòng'}{' '}
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
          <p className="text-2xl font-black text-rose-700">{overbookingCount}</p>
          <p className="min-h-10 text-xs leading-relaxed text-rose-700/80">
            {isPartnerCalendarEnabled()
              ? 'Kiểm tra Lịch khả dụng khi có cảnh báo trùng ngày/phòng.'
              : 'Rà soát danh sách đặt phòng theo phòng và khoảng ngày trùng nhau.'}
          </p>
        </div>

        <div className="flex h-full flex-col justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-2 text-sm font-bold text-sky-800">
              <ClipboardList size={16} className="shrink-0" />
              <span className="truncate">Yêu cầu hủy</span>
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 shrink-0 px-2 text-sky-800"
              onClick={() =>
                navigate(
                  buildPartnerDashboardLink(ROUTERS.PARTNER_CANCELLATION_REQUESTS, { propertyId }),
                )
              }
            >
              Xử lý <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
          <p className="text-2xl font-black text-sky-700">{pendingCancellationCount}</p>
          <p className="min-h-10 text-xs leading-relaxed text-sky-700/80">
            Khách gửi yêu cầu hủy đặt phòng cần xử lý.
          </p>
        </div>

        <div className="flex h-full flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-800">
              <FileClock size={16} className="shrink-0" />
              <span className="truncate">Hợp đồng sắp hết hạn</span>
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 shrink-0 px-2 text-slate-700"
              onClick={() =>
                navigate(nextExpiring ? `/partner/contracts/${nextExpiring.id}` : '/partner/contracts')
              }
            >
              Hợp đồng <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
          <p className="text-2xl font-black text-slate-700">
            {expiringContractsQuery.isLoading ? '...' : expiringCount}
          </p>
          <p className="line-clamp-2 min-h-10 text-xs leading-relaxed text-slate-500">
            {nextExpiring && nextExpiring.booking_end_date
              ? `Sớm nhất: ${new Date(nextExpiring.booking_end_date).toLocaleDateString('vi-VN')} · ${nextExpiring.guest_name ?? 'Khách'}`
              : 'Scheduler 06:00 đánh dấu hợp đồng còn ≤ 30 ngày.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertCenter;
