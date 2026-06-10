export const formatDashboardCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

export const formatCompactNumber = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} k`;
  return value.toString();
};

export const formatConfirmDuration = (seconds?: number | null): string => {
  if (seconds === null || seconds === undefined) {
    return 'Chưa đủ dữ liệu';
  }
  if (seconds < 60) return `${seconds} giây`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} phút`;
  return `${(seconds / 3600).toFixed(1)} giờ`;
};

export type ConfirmSlaTone = 'neutral' | 'success' | 'warning' | 'danger';

export const getConfirmSlaTone = (seconds?: number | null): ConfirmSlaTone => {
  if (seconds === null || seconds === undefined) return 'neutral';
  if (seconds <= 300) return 'success';
  if (seconds <= 900) return 'warning';
  return 'danger';
};

export const CONFIRM_SLA_VALUE_CLASS: Record<ConfirmSlaTone, string> = {
  neutral: 'text-slate-500',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-rose-600',
};

export const todaySubLabel = (): string => {
  const d = new Date();
  return `Hôm nay · ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
};

export const monthSubLabel = (): string => {
  const d = new Date();
  return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
};
