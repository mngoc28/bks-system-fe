/**
 * Room display helpers for Partner portal.
 */

export const formatRoomDisplayTitle = (name: string | null | undefined): string => {
  const trimmed = (name ?? '').trim();
  if (!trimmed) {
    return 'Phòng';
  }
  if (/^phòng\s/i.test(trimmed)) {
    return trimmed;
  }
  return `Phòng ${trimmed}`;
};

export const resolvePartnerContactPhone = (
  partnerPhone?: string | null,
  supportPhone?: string | null,
): string | null => {
  const partner = partnerPhone?.trim();
  if (partner) {
    return partner;
  }
  const support = supportPhone?.trim();
  return support || null;
};

export const resolvePartnerContactEmail = (
  partnerEmail?: string | null,
  supportEmail?: string | null,
): string | null => {
  const partner = partnerEmail?.trim();
  if (partner) {
    return partner;
  }
  const support = supportEmail?.trim();
  return support || null;
};

export type HousekeepingStatus = 'clean' | 'dirty' | 'inspecting';

export const HOUSEKEEPING_STATUS_LABELS: Record<HousekeepingStatus, string> = {
  clean: 'Sạch sẽ',
  dirty: 'Cần dọn',
  inspecting: 'Đang kiểm tra',
};

export const normalizeHousekeepingStatus = (value: unknown): HousekeepingStatus => {
  if (value === 'dirty' || value === 'inspecting' || value === 'clean') {
    return value;
  }
  return 'clean';
};

export const getHousekeepingStatusStyle = (status: HousekeepingStatus): string => {
  if (status === 'clean') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (status === 'dirty') {
    return 'bg-orange-50 text-orange-700 border-orange-200';
  }
  return 'bg-sky-50 text-sky-700 border-sky-200';
};
