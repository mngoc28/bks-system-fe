import type { MaintenanceRequest } from '@/pages/Partner/types';

export type MaintenanceStatusKey = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type MaintenanceTypeKey = 'scheduled' | 'emergency';

export const MAINTENANCE_STATUS_LABEL: Record<MaintenanceStatusKey, MaintenanceRequest['status']> = {
  planned: 'Chờ xử lý',
  in_progress: 'Đang xử lý',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
};

export const MAINTENANCE_TYPE_LABEL: Record<MaintenanceTypeKey, string> = {
  scheduled: 'Bảo trì định kỳ',
  emergency: 'Sự cố khẩn cấp',
};

export interface MaintenanceListResult {
  items: MaintenanceRequest[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export const getMaintenanceStatusLabel = (status: unknown): MaintenanceRequest['status'] => {
  const value = String(status || '').toLowerCase();
  if (value in MAINTENANCE_STATUS_LABEL) {
    return MAINTENANCE_STATUS_LABEL[value as MaintenanceStatusKey];
  }
  if (value.includes('planned') || value.includes('pending') || value.includes('cho')) return 'Chờ xử lý';
  if (value.includes('in_progress') || value.includes('processing') || value.includes('đang')) return 'Đang xử lý';
  if (value.includes('completed') || value.includes('done')) return 'Đã hoàn thành';
  if (value.includes('cancel')) return 'Đã hủy';
  return 'Chờ xử lý';
};

export const getMaintenanceStatusKey = (status: unknown): MaintenanceStatusKey | null => {
  const value = String(status || '').toLowerCase();
  if (['planned', 'in_progress', 'completed', 'cancelled'].includes(value)) {
    return value as MaintenanceStatusKey;
  }
  if (value.includes('planned') || value.includes('cho')) return 'planned';
  if (value.includes('in_progress') || value.includes('đang')) return 'in_progress';
  if (value.includes('completed') || value.includes('hoàn')) return 'completed';
  if (value.includes('cancel') || value.includes('hủy')) return 'cancelled';
  return null;
};

export const getMaintenanceTypeLabel = (type: unknown): string => {
  const value = String(type || '').toLowerCase();
  if (value in MAINTENANCE_TYPE_LABEL) {
    return MAINTENANCE_TYPE_LABEL[value as MaintenanceTypeKey];
  }
  return String(type || 'Bảo trì');
};

export const getMaintenanceStatusStyle = (status: MaintenanceRequest['status']): string => {
  switch (status) {
    case 'Chờ xử lý':
    case 'Đang chờ':
      return 'bg-red-50 text-red-700 border-red-100';
    case 'Đang xử lý':
    case 'Đang sửa':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'Đã hoàn thành':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'Đã hủy':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-100';
  }
};

export const mapMaintenanceRecord = (item: Record<string, unknown>): MaintenanceRequest => {
  const rawStatus = getMaintenanceStatusKey(item.status);
  const maintenanceType = String(item.maintenance_type || item.type || 'scheduled').toLowerCase() as MaintenanceTypeKey;

  return {
    id: item.id as string | number,
    roomId: item.room_id as string | number | undefined,
    roomName:
      (item.room_name as string) ??
      (item.roomName as string) ??
      ((item.room as { title?: string })?.title) ??
      `Phòng #${item.room_id ?? 'N/A'}`,
    propertyName:
      (item.property_name as string) ??
      (item.propertyName as string) ??
      ((item.property as { name?: string })?.name) ??
      '',
    title: (item.title as string) ?? undefined,
    type: (item.maintenance_type_label as string) ?? getMaintenanceTypeLabel(maintenanceType),
    maintenanceType,
    description: (item.description as string) ?? (item.issueDescription as string) ?? '',
    status: (item.status_label as MaintenanceRequest['status']) ?? getMaintenanceStatusLabel(item.status),
    rawStatus: rawStatus ?? undefined,
    createdAt: (item.created_at as string) ?? (item.createdAt as string) ?? new Date().toISOString(),
    customerName: (item.customerName as string) ?? undefined,
  };
};

export const parseMaintenanceListResponse = (res: unknown): MaintenanceListResult => {
  const root = res as { status?: string; data?: Record<string, unknown> };
  const payload = (root?.status === 'success' ? root.data : (res as { data?: Record<string, unknown> })?.data ?? res) as
    | Record<string, unknown>
    | undefined;

  if (!payload || typeof payload !== 'object') {
    return { items: [], currentPage: 1, lastPage: 1, perPage: 10, total: 0 };
  }

  const rows = Array.isArray(payload.data) ? (payload.data as Record<string, unknown>[]) : [];
  const items = rows.map((row) => mapMaintenanceRecord(row));

  return {
    items,
    currentPage: Number(payload.current_page ?? 1),
    lastPage: Number(payload.last_page ?? 1),
    perPage: Number(payload.per_page ?? (items.length || 10)),
    total: Number(payload.total ?? items.length),
  };
};

export const extractMaintenanceApiError = (err: unknown): { message: string; code?: string; conflicts?: unknown } => {
  const error = err as { response?: { status?: number; data?: Record<string, unknown> } };
  const data = error?.response?.data;
  const code = data?.code as string | undefined;
  const message = (data?.message as string) ?? 'Không thể xử lý yêu cầu bảo trì.';

  if (code === 'MAINTENANCE_CALENDAR_CONFLICT' && data?.data) {
    return { message, code, conflicts: data.data };
  }

  return { message, code };
};

export interface MaintenanceConflictBooking {
  id: number;
  start_date: string;
  end_date: string;
  status?: number;
  stay_status?: string;
  guest_name?: string;
}

export interface MaintenanceConflictBlock {
  id: number;
  start_date: string;
  end_date: string;
  block_type?: string;
  reason?: string;
}

export interface MaintenanceCurrentStay {
  booking_id: number;
  guest_name: string;
  start_date: string;
  end_date: string;
  stay_status: string;
}

export interface MaintenanceConflictPreview {
  hasConflict: boolean;
  bookings: MaintenanceConflictBooking[];
  blocks: MaintenanceConflictBlock[];
  currentStay: MaintenanceCurrentStay | null;
}

export const parseMaintenanceConflictPreviewResponse = (res: unknown): MaintenanceConflictPreview => {
  const root = res as { status?: string; data?: Record<string, unknown> };
  const payload = (root?.status === 'success' ? root.data : (res as { data?: Record<string, unknown> })?.data ?? res) as
    | Record<string, unknown>
    | undefined;

  if (!payload || typeof payload !== 'object') {
    return { hasConflict: false, bookings: [], blocks: [], currentStay: null };
  }

  const currentStayRaw = payload.current_stay as Record<string, unknown> | null | undefined;

  return {
    hasConflict: Boolean(payload.has_conflict),
    bookings: Array.isArray(payload.bookings) ? (payload.bookings as MaintenanceConflictBooking[]) : [],
    blocks: Array.isArray(payload.blocks) ? (payload.blocks as MaintenanceConflictBlock[]) : [],
    currentStay: currentStayRaw
      ? {
          booking_id: Number(currentStayRaw.booking_id),
          guest_name: String(currentStayRaw.guest_name ?? ''),
          start_date: String(currentStayRaw.start_date ?? ''),
          end_date: String(currentStayRaw.end_date ?? ''),
          stay_status: String(currentStayRaw.stay_status ?? ''),
        }
      : null,
  };
};

export const formatMaintenanceConflictDateRange = (start: string, end: string): string => {
  const format = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('vi-VN');
  };
  return `${format(start)} → ${format(end)}`;
};

export const getMaintenanceStayStatusLabel = (stayStatus: string): string => {
  switch (stayStatus) {
    case 'checked_in':
      return 'Đang ở';
    case 'checked_out':
      return 'Đã trả phòng';
    case 'no_show':
      return 'Không đến';
    default:
      return 'Chờ nhận phòng';
  }
};

export type MaintenanceConflictPanelTone = 'idle' | 'ok' | 'warn' | 'block';

export const resolveMaintenanceConflictPanelTone = (
  preview: MaintenanceConflictPreview | null | undefined,
  blockCalendar: boolean,
  hasDates: boolean,
): MaintenanceConflictPanelTone => {
  if (!hasDates) return 'idle';
  if (!preview) return 'idle';
  if (preview.hasConflict && blockCalendar) return 'block';
  if (preview.hasConflict) return 'warn';
  return 'ok';
};
