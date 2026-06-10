import React from 'react';
import { Undo2, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface PendingBookingItem {
  id: number;
  user_name?: string;
  property_name?: string;
  room_number?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  total_amount?: number;
  has_conflict?: boolean;
}

interface PendingBookingCardProps {
  booking: PendingBookingItem;
  isPendingConfirm: boolean;
  remainingMs: number;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onUndo: (id: number) => void;
}

const formatWaitDuration = (createdAt?: string): string | null => {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  const minutes = Math.floor((Date.now() - created.getTime()) / 60_000);
  if (minutes < 1) return 'Vừa tạo';
  if (minutes < 60) return `Chờ ${minutes} phút`;
  return `Chờ ${Math.floor(minutes / 60)} giờ`;
};

const formatAmount = (value?: number): string | null => {
  if (value === undefined || value === null) return null;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const countNights = (start?: string, end?: string): number | null => {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
  const nights = Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000);
  return nights > 0 ? nights : null;
};

const PendingBookingCard: React.FC<PendingBookingCardProps> = ({
  booking,
  isPendingConfirm,
  remainingMs,
  onApprove,
  onReject,
  onUndo,
}) => {
  const waitLabel = formatWaitDuration(booking.created_at);
  const waitMinutes = booking.created_at
    ? Math.floor((Date.now() - new Date(booking.created_at).getTime()) / 60_000)
    : 0;
  const slaTone =
    waitMinutes > 5 ? 'bg-rose-50 text-rose-700' : waitMinutes > 0 ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700';
  const nights = countNights(booking.start_date, booking.end_date);
  const amountLabel = formatAmount(booking.total_amount);

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 transition-all hover:border-slate-200 hover:bg-slate-50/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <User size={18} />
          </div>
          <div className="min-w-0">
            <p className="break-words text-sm font-bold text-slate-900">
              {booking.user_name || 'Khách hàng'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              #{booking.id}
              {booking.property_name ? ` · ${booking.property_name}` : ''}
            </p>
            <p className="text-xs text-slate-500">
              Phòng: <span className="font-semibold">{booking.room_number || 'N/A'}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="secondary" className="border-none bg-blue-50 text-[10px] uppercase text-blue-700">
            Chờ duyệt
          </Badge>
          {waitLabel && (
            <Badge variant="secondary" className={`border-none text-[10px] ${slaTone}`}>
              {waitLabel}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {booking.start_date && booking.end_date && (
          <span>
            {booking.start_date} → {booking.end_date}
            {nights ? ` (${nights} đêm)` : ''}
          </span>
        )}
        {amountLabel && <span className="font-semibold text-slate-700">{amountLabel}</span>}
        {booking.has_conflict ? (
          <Badge variant="destructive" className="text-[10px]">
            Trùng lịch
          </Badge>
        ) : (
          <Badge variant="secondary" className="border-none bg-emerald-50 text-[10px] text-emerald-700">
            Còn trống
          </Badge>
        )}
        {nights != null && nights >= 30 && (
          <Badge variant="secondary" className="border-none bg-violet-50 text-[10px] text-violet-700">
            Sẽ tạo HĐ thuê
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="text-[10px] font-medium text-slate-400">SLA mục tiêu: 5 phút</span>
        <div className="flex gap-2">
          {isPendingConfirm ? (
            <Button
              size="sm"
              variant="outline"
              className="h-9 min-h-[44px] border-amber-300 px-3 text-amber-700 hover:bg-amber-50 sm:min-h-0 sm:h-7"
              onClick={() => onUndo(booking.id)}
            >
              <Undo2 size={14} className="mr-1" />
              Hoàn tác ({Math.ceil(remainingMs / 1000)}s)
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-9 min-h-[44px] px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 sm:min-h-0 sm:h-7"
                onClick={() => onReject(booking.id)}
              >
                Từ chối
              </Button>
              <Button
                size="sm"
                className="h-9 min-h-[44px] bg-blue-600 px-3 hover:bg-blue-700 sm:min-h-0 sm:h-7"
                onClick={() => onApprove(booking.id)}
              >
                Duyệt
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingBookingCard;
