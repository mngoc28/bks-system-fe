import type { Booking } from '@/pages/Partner/types';

/**
 * BE dùng khoảng nửa mở [start_date, end_date) — end_date là exclusive (trùng với FullCalendar all-day).
 */
export function normalizePartnerBookingStatusCode(status: unknown): number {
  if (typeof status === 'number' && status >= 0 && status <= 4) {
    return status;
  }
  const value = String(status ?? '').toLowerCase();
  if (value.includes('pending_cancellation') || value.includes('cancellation_pending') || value.includes('chờ hủy')) {
    return 4;
  }
  if (value.includes('pending') || value.includes('chờ')) {
    return 0;
  }
  if (value.includes('cancel') || value.includes('hủy')) {
    return 2;
  }
  if (value.includes('complete') || value.includes('hoàn')) {
    return 3;
  }
  if (value.includes('confirm') || value.includes('duyệt') || value.includes('approved')) {
    return 1;
  }

  return 1;
}

export function partnerBaseStatusLabel(code: number): 'Chờ duyệt' | 'Đã duyệt' | 'Đã hủy' | 'Đã hoàn thành' | 'Chờ duyệt hủy' {
  switch (code) {
    case 0:
      return 'Chờ duyệt';
    case 2:
      return 'Đã hủy';
    case 3:
      return 'Đã hoàn thành';
    case 4:
      return 'Chờ duyệt hủy';
    default:
      return 'Đã duyệt';
  }
}

/**
 * Nhãn hiển thị trên bảng / dialog (kết hợp stay_status).
 */
export function getPartnerRowDisplayStatus(
  code: number,
  stayStatus?: string | null,
): Booking['status'] {
  if (code === 4) {
    return 'Chờ duyệt hủy';
  }
  if (stayStatus === 'no_show') {
    return 'Không đến';
  }
  if (stayStatus === 'checked_in') {
    return 'Đang ở';
  }
  if (stayStatus === 'checked_out') {
    return 'Đã trả phòng';
  }

  return partnerBaseStatusLabel(code);
}

/** Booking đã duyệt, chưa nhận phòng và đã tới/qua ngày check-in. */
export function canMarkPartnerBookingNoShow(
  rawStatus: number | undefined,
  stayStatus: string | undefined | null,
  checkIn: string | undefined | null,
): boolean {
  if (rawStatus !== 1 || stayStatus !== 'pending' || !checkIn) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDate = new Date(checkIn);
  if (Number.isNaN(checkInDate.getTime())) {
    return false;
  }
  checkInDate.setHours(0, 0, 0, 0);
  return checkInDate.getTime() <= today.getTime();
}

export function isPartnerCheckInDepositLocked(
  depositAmount: number | undefined | null,
  depositStatus: string | undefined | null,
): boolean {
  return (depositAmount ?? 0) > 0 && !['confirmed_by_partner', 'held_in_escrow'].includes(depositStatus || '');
}

export function isPartnerCheckInDueToday(checkIn: string | undefined | null): boolean {
  if (!checkIn) {
    return false;
  }
  return new Date(checkIn).toDateString() === new Date().toDateString();
}

export function isPartnerCheckOutDueToday(checkOut: string | undefined | null): boolean {
  if (!checkOut) {
    return false;
  }
  return new Date(checkOut).toDateString() === new Date().toDateString();
}

export function getPartnerBookingCalendarHex(
  code: number,
  stayStatus: string | null | undefined,
): string {
  if (code === 0) {
    return '#f59e0b';
  }
  if (code === 2) {
    return '#ef4444';
  }
  if (code === 3) {
    return '#10b981';
  }
  if (code === 4) {
    return '#f97316';
  }
  if (stayStatus === 'checked_in') {
    return '#8b5cf6';
  }

  return '#3b82f6';
}

export function getPartnerBlockCalendarHex(blockType: string): string {
  if (blockType === 'maintenance') {
    return '#475569';
  }
  if (blockType === 'owner_use') {
    return '#7c3aed';
  }

  return '#0f172a';
}

export const PARTNER_BLOCK_TYPE_LABEL_VI: Record<string, string> = {
  maintenance: 'Bảo trì',
  owner_use: 'Chủ nhà sử dụng',
  off_market: 'Tạm ngừng',
};

export function getPartnerBookingBadgeClass(
  code: number,
  stayStatus?: string | null,
): string {
  const display = getPartnerRowDisplayStatus(code, stayStatus);
  switch (display) {
    case 'Chờ duyệt':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'Đang ở':
      return 'bg-violet-50 text-violet-700 border-violet-100';
    case 'Đã duyệt':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'Đã hoàn thành':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'Đã trả phòng':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'Đã hủy':
      return 'bg-red-50 text-red-700 border-red-100';
    case 'Chờ duyệt hủy':
      return 'bg-orange-50 text-orange-700 border-orange-100';
    case 'Không đến':
      return 'bg-red-50 text-red-700 border-red-100';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-100';
  }
}

export function formatPartnerBookingDateVi(value: string | undefined | null): string {
  if (!value) {
    return '—';
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }

  return d.toLocaleDateString('vi-VN');
}

/**
 * Số đêm với end_date exclusive (theo BE): max(0, end − start theo ngày lịch).
 */
/**
 * Nhãn khách trên ô lịch: đủ để lễ tân nhận diện (họ + tên), không chỉ 1 từ cuối.
 */
export function formatCalendarGuestLabel(
  guestName?: string | null,
  bookingId?: number,
  maxLength = 18,
): string {
  const trimmed = guestName?.trim();
  if (!trimmed) {
    return bookingId != null ? `#${bookingId}` : 'Khách';
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  let compact = trimmed;
  if (parts.length >= 2) {
    compact = `${parts[0]} ${parts[parts.length - 1]}`;
  }
  if (compact.length <= maxLength) {
    return compact;
  }
  return `${compact.slice(0, maxLength - 1)}…`;
}

/** Nhãn vận hành trong ngày: nhận phòng / trả phòng / đang ở. */
export function getCalendarDayOperationalMarker(
  cellDate: string,
  checkIn?: string,
  checkOutExclusive?: string,
  stayStatus?: string | null,
): 'IN' | 'OUT' | '' {
  if (checkIn === cellDate) {
    return 'IN';
  }
  if (checkOutExclusive === cellDate) {
    return 'OUT';
  }
  if (stayStatus === 'checked_in' && checkIn && checkIn < cellDate && checkOutExclusive && cellDate < checkOutExclusive) {
    return '';
  }
  return '';
}

export function countPartnerBookingNightsExclusive(
  checkIn: string | undefined | null,
  checkOutExclusive: string | undefined | null,
): number | null {
  if (!checkIn || !checkOutExclusive) {
    return null;
  }
  const start = new Date(checkIn);
  const end = new Date(checkOutExclusive);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const d0 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const d1 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const days = Math.round((d1 - d0) / 86_400_000);

  return Math.max(0, days);
}

export interface PartnerMoneyBadge {
  label: string;
  badgeClass: string;
  hint: string | null;
}

export function formatPartnerMoneyVi(amount: number | undefined | null): string {
  if (amount == null || Number.isNaN(amount)) {
    return '—';
  }
  return `${Number(amount).toLocaleString('vi-VN')} đ`;
}

/** Nhãn + gợi ý xử lý cho trạng thái cọc trên bảng lễ tân. */
export function getPartnerDepositDisplay(
  depositStatus?: string | null,
  depositAmount?: number | null,
): PartnerMoneyBadge | null {
  if (!depositAmount || depositAmount <= 0 || depositStatus === 'none' || !depositStatus) {
    return null;
  }

  const amountText = formatPartnerMoneyVi(depositAmount);

  switch (depositStatus) {
    case 'pending':
      return {
        label: `Chưa cọc · ${amountText}`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        hint: 'Liên hệ / Zalo nhắc chuyển khoản cọc',
      };
    case 'payment_submitted':
      return {
        label: `Chờ duyệt biên lai · ${amountText}`,
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        hint: 'Kiểm tra minh chứng và duyệt cọc',
      };
    case 'confirmed_by_partner':
      return {
        label: `Đã cọc · ${amountText}`,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        hint: null,
      };
    case 'held_in_escrow':
      return {
        label: `Cọc giữ hộ · ${amountText}`,
        badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
        hint: 'Thuê dài hạn — cọc đang escrow',
      };
    case 'refunded':
      return {
        label: `Đã hoàn cọc · ${amountText}`,
        badgeClass: 'bg-slate-50 text-slate-600 border-slate-200',
        hint: null,
      };
    case 'forfeited':
      return {
        label: `Tịch thu cọc · ${amountText}`,
        badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
        hint: null,
      };
    case 'expired_cancelled':
      return {
        label: `Cọc hết hạn · ${amountText}`,
        badgeClass: 'bg-slate-50 text-slate-500 border-slate-200',
        hint: 'Hệ thống đã hủy đơn và giải phóng phòng',
      };
    default:
      return {
        label: `Cọc · ${amountText}`,
        badgeClass: 'bg-slate-50 text-slate-600 border-slate-200',
        hint: null,
      };
  }
}

/** Đơn bị hệ thống hủy tự động do quá hạn cọc (CancelExpiredUnpaidBookingsJob). */
export function isPartnerSystemAutoCancelled(
  depositStatus?: string | null,
  cancellationReason?: string | null,
): boolean {
  if (depositStatus === 'expired_cancelled') {
    return true;
  }
  const reason = (cancellationReason ?? '').trim();
  return reason.includes('Hủy tự động');
}

/** Badge phụ cho cột trạng thái — phân biệt hủy tự động / thủ công / không đến. */
export function getPartnerStatusSubBadge(
  rawStatus: number | undefined,
  stayStatus?: string | null,
  depositStatus?: string | null,
  cancellationReason?: string | null,
): PartnerMoneyBadge | null {
  if (stayStatus === 'no_show') {
    return {
      label: 'Giải phóng phòng',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      hint: 'Lễ tân đánh dấu thủ công — phòng đã đưa lại kho bán',
    };
  }

  if (rawStatus !== 2) {
    return null;
  }

  if (isPartnerSystemAutoCancelled(depositStatus, cancellationReason)) {
    return {
      label: 'Hủy tự động',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      hint: 'Quá hạn cọc — hệ thống hủy và giải phóng phòng (~10 phút/lần)',
    };
  }

  const reason = (cancellationReason ?? '').trim();
  return {
    label: 'Hủy thủ công',
    badgeClass: 'bg-rose-50 text-rose-600 border-rose-100',
    hint: reason || 'Partner hoặc khách chủ động hủy',
  };
}

/** Trạng thái thanh toán toàn đơn (payment_status). */
export function getPartnerPaymentDisplay(
  paymentStatus?: string | null,
  totalAmount?: number | null,
  amountRemaining?: number | null,
): PartnerMoneyBadge {
  const amountText = totalAmount != null ? formatPartnerMoneyVi(totalAmount) : null;
  const remainingText = amountRemaining != null && amountRemaining > 0
    ? formatPartnerMoneyVi(amountRemaining)
    : null;

  switch (paymentStatus) {
    case 'paid':
      return {
        label: amountText ? `Đã thanh toán · ${amountText}` : 'Đã thanh toán',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        hint: null,
      };
    case 'partially_paid':
      return {
        label: remainingText ? `Còn lại · ${remainingText}` : 'Thanh toán một phần',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        hint: 'Khách đã cọc — thu phần còn lại khi check-in/out hoặc online',
      };
    case 'refunded':
      return {
        label: 'Đã hoàn tiền',
        badgeClass: 'bg-slate-50 text-slate-600 border-slate-200',
        hint: null,
      };
    case 'unpaid':
    default:
      return {
        label: amountText ? `Chưa thanh toán · ${amountText}` : 'Chưa thanh toán',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        hint: 'Thu tiền tại quầy hoặc chờ khách thanh toán online',
      };
  }
}
