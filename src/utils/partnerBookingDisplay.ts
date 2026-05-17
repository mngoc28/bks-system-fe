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
  if (stayStatus === 'checked_in') {
    return 'Đang ở';
  }
  if (stayStatus === 'checked_out') {
    return 'Đã trả phòng';
  }

  return partnerBaseStatusLabel(code);
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
