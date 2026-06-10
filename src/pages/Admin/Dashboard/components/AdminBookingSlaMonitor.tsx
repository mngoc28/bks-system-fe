import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ArrowRight, CalendarClock } from "lucide-react";
import type { BookingListItem } from "@/dataHelper/booking.dataHelper";
import { Spinner } from "@/components/ui/spinner";

interface AdminBookingSlaMonitorProps {
  bookings: BookingListItem[];
  total: number;
  isLoading?: boolean;
  onAudit: () => void;
}

const SLA_MINUTES = 15;

const formatWaitDuration = (createdAt?: string): string | null => {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  const minutes = Math.floor((Date.now() - created.getTime()) / 60_000);
  if (minutes < 1) return "Vừa tạo";
  if (minutes < 60) return `Chờ ${minutes} phút`;
  return `Chờ ${Math.floor(minutes / 60)} giờ`;
};

const formatDate = (value?: string | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

const AdminBookingSlaMonitor: React.FC<AdminBookingSlaMonitorProps> = ({
  bookings,
  total,
  isLoading = false,
  onAudit,
}) => {
  const { t } = useTranslation();
  const overdueCount = bookings.filter((booking) => {
    if (!booking.created_at) return false;
    const minutes = Math.floor((Date.now() - new Date(booking.created_at).getTime()) / 60_000);
    return minutes > SLA_MINUTES;
  }).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
            {t("dashboard.booking_sla_title", { defaultValue: "Giám sát booking chờ partner" })}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {t("dashboard.booking_sla_hint", {
              defaultValue: "Admin theo dõi SLA — partner mới là bên xác nhận đơn.",
            })}
          </p>
        </div>
        {total > 0 && (
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-800">
            {total.toLocaleString()}
          </span>
        )}
      </div>

      {overdueCount > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs text-rose-800">
          <AlertTriangle className="size-4 shrink-0" />
          {t("dashboard.booking_sla_overdue", {
            defaultValue: "{{count}} đơn chờ partner quá {{minutes}} phút",
            count: overdueCount,
            minutes: SLA_MINUTES,
          })}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="md" showText text={t("common.loading_data")} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center">
          <CalendarClock className="mb-3 size-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">
            {t("dashboard.booking_sla_empty", { defaultValue: "Không có booking chờ partner" })}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => {
            const waitLabel = formatWaitDuration(booking.created_at);
            const waitMinutes = booking.created_at
              ? Math.floor((Date.now() - new Date(booking.created_at).getTime()) / 60_000)
              : 0;
            const isOverdue = waitMinutes > SLA_MINUTES;

            return (
              <button
                key={booking.id}
                type="button"
                onClick={onAudit}
                className="flex w-full flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition-colors hover:border-slate-300 hover:bg-slate-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {booking.user_name || t("dashboard.guest_fallback", { defaultValue: "Khách hàng" })}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      #{booking.id}
                      {booking.property_name ? ` · ${booking.property_name}` : ""}
                    </p>
                  </div>
                  {waitLabel && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isOverdue ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {waitLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {total > 0 && (
        <button
          type="button"
          onClick={onAudit}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          {t("dashboard.booking_sla_audit", { defaultValue: "Mở danh sách giám sát" })}
          <ArrowRight className="size-4" />
        </button>
      )}
    </div>
  );
};

export default AdminBookingSlaMonitor;
