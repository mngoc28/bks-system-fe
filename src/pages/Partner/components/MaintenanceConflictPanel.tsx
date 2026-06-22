import React from 'react';
import { AlertTriangle, Calendar, CheckCircle2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTERS } from '@/constant';
import {
  formatMaintenanceConflictDateRange,
  getMaintenanceStayStatusLabel,
  resolveMaintenanceConflictPanelTone,
  type MaintenanceConflictPreview,
} from '@/utils/partnerMaintenanceDisplay';
import { PARTNER_BLOCK_TYPE_LABEL_VI } from '@/utils/partnerBookingDisplay';

interface MaintenanceConflictPanelProps {
  preview: MaintenanceConflictPreview | null;
  blockCalendar: boolean;
  hasDates: boolean;
  isLoading?: boolean;
  onAdjustDates?: () => void;
  onDisableBlockCalendar?: () => void;
}

export const MaintenanceConflictPanel: React.FC<MaintenanceConflictPanelProps> = ({
  preview,
  blockCalendar,
  hasDates,
  isLoading = false,
  onAdjustDates,
  onDisableBlockCalendar,
}) => {
  const navigate = useNavigate();
  const tone = resolveMaintenanceConflictPanelTone(preview, blockCalendar, hasDates);
  const firstBookingId = preview?.bookings[0]?.id;

  const handleViewBooking = () => {
    if (firstBookingId) {
      navigate(`${ROUTERS.PARTNER_BOOKINGS}?id=${firstBookingId}`);
      return;
    }
    navigate(ROUTERS.PARTNER_BOOKINGS);
  };

  return (
    <div className="space-y-3">
      {preview?.currentStay && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <User size={16} />
            Khách đang ở phòng
          </div>
          <p>
            {preview.currentStay.guest_name || 'Khách'} —{' '}
            {formatMaintenanceConflictDateRange(preview.currentStay.start_date, preview.currentStay.end_date)}
          </p>
          <p className="mt-1 text-xs text-blue-700">
            Trạng thái: {getMaintenanceStayStatusLabel(preview.currentStay.stay_status)}
          </p>
        </div>
      )}

      {!hasDates && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Chọn ngày bắt đầu và ngày hoàn thành để kiểm tra booking/block trùng lịch.
        </div>
      )}

      {hasDates && isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Đang kiểm tra lịch phòng...
        </div>
      )}

      {hasDates && !isLoading && tone === 'ok' && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={16} />
            Không có booking/block trùng trong khoảng đã chọn
          </div>
        </div>
      )}

      {hasDates && !isLoading && tone === 'warn' && preview && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle size={16} />
            Có booking/block trong khoảng này
          </div>
          <p className="text-xs text-amber-800">
            Bạn đã tắt khóa lịch — phiếu sẽ chỉ ghi nhận sự cố, không chặn đặt phòng.
          </p>
          <ConflictList preview={preview} />
          <div className="mt-3">
            <Button type="button" size="sm" variant="outline" onClick={handleViewBooking}>
              Xem booking
            </Button>
          </div>
        </div>
      )}

      {hasDates && !isLoading && tone === 'block' && preview && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle size={16} />
            Không thể khóa lịch — trùng booking/block
          </div>
          <ConflictList preview={preview} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onAdjustDates}>
              <Calendar size={14} className="mr-1" />
              Đổi ngày
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onDisableBlockCalendar}>
              Tắt khóa lịch
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleViewBooking}>
              Xem booking
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const ConflictList: React.FC<{ preview: MaintenanceConflictPreview }> = ({ preview }) => (
  <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
    {preview.bookings.map((booking) => (
      <li key={`preview-booking-${booking.id}`}>
        Booking #{booking.id}
        {booking.guest_name ? ` (${booking.guest_name})` : ''}:{' '}
        {formatMaintenanceConflictDateRange(booking.start_date, booking.end_date)}
      </li>
    ))}
    {preview.blocks.map((block) => (
      <li key={`preview-block-${block.id}`}>
        Block #{block.id} ({PARTNER_BLOCK_TYPE_LABEL_VI[block.block_type ?? ''] ?? block.block_type}):{' '}
        {formatMaintenanceConflictDateRange(block.start_date, block.end_date)}
      </li>
    ))}
  </ul>
);
