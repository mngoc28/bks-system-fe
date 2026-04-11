import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookingDetailDialogProps } from "@/dataHelper/booking.dataHelper";
import { useBookingDetailQuery } from "@/hooks/useBookingQuery";
import { formatDateTimeVietnam, formatDateVietnam } from "@/utils/dateUtils";
import { formatPrice, mapBookingStatus, statusColor } from "@/utils/utils";
import React from "react";
import { useTranslation } from "react-i18next";


function safeDT(v?: string | null) {
  if (!v) return "-";
  return formatDateTimeVietnam(v);
}

/**
 * Booking Detail Dialog
 * Fetches and displays the full details of a specific booking, with loading skeletons and fallback support.
 */
const BookingDetailDialog: React.FC<BookingDetailDialogProps> = ({ id, open, onClose, fallback }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useBookingDetailQuery(id, open);
  // Some backends wrap detail as { data: { booking: {...} } }, fallback to plain data
  const bookingRaw: any = (data as any)?.data?.booking ?? (data as any)?.data;

  // Normalize fields - BE returns flat structure with joined data
  const userName = bookingRaw?.user_name ?? fallback?.user_name ?? "-";
  const buildingName = bookingRaw?.building_name ?? fallback?.building_name ?? "-";
  const roomName = bookingRaw?.room_name ?? fallback?.room_name ?? "-";
  const startDate = bookingRaw?.start_date ?? null;
  const endDate = bookingRaw?.end_date ?? null;
  const roomPrice = bookingRaw?.price ?? fallback?.room_price ?? null;
  const staffName = bookingRaw?.partner_name ?? fallback?.partner_name ?? "-";
  const createdAt = bookingRaw?.created_at ?? null;
  const statusRaw = bookingRaw?.status ?? 0;
  const status = typeof statusRaw === 'number' ? mapBookingStatus(statusRaw) : statusRaw;
  const note = bookingRaw?.note ?? "";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{t("bookings.detail.title")}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-56" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-48" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : !bookingRaw ? (
          <div className="text-sm text-red-600">Không tìm thấy thông tin</div>
        ) : (
          <div className="space-y-6 text-sm">
            {/* Header with requester and status */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-slate-500">{t("bookings.detail.user_name")}</div>
                <div className="mt-0.5 text-base font-semibold text-slate-900">{userName}</div>
              </div>
              <Badge className={statusColor[status] || "bg-slate-100 text-slate-700"}>{t(`bookings.search.status_${status}`)}</Badge>
            </div>

            <div className="border-t" />

            {/* Details grid */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <dt className="text-slate-500">{t("bookings.detail.building_name")}</dt>
                <dd className="mt-1 font-medium text-slate-900">{buildingName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t("bookings.detail.room_number")}</dt>
                <dd className="mt-1 font-medium text-slate-900">{roomName}</dd>
              </div>

              <div>
                <dt className="text-slate-500">{t("bookings.detail.start_time")}</dt>
                <dd className="mt-1 font-medium text-slate-900">{startDate ? formatDateVietnam(startDate) : '-'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t("bookings.detail.end_time")}</dt>
                <dd className="mt-1 font-medium text-slate-900">{endDate ? formatDateVietnam(endDate) : '-'}</dd>
              </div>

              <div>
                <dt className="text-slate-500">{t("bookings.detail.room_price")}</dt>
                <dd className="mt-1 font-medium text-slate-900">{formatPrice(roomPrice)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t("bookings.detail.assignee")}</dt>
                <dd className="mt-1 font-medium text-slate-900">{staffName || '-'}</dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-slate-500">{t("bookings.detail.created_at")}</dt>
                <dd className="mt-1 font-medium text-slate-900">{safeDT(createdAt)}</dd>
              </div>
            </dl>

            {/* Note */}
            <div className="space-y-2">
              <div className="text-slate-500">{t("bookings.detail.note")}</div>
              <div className="rounded-md border bg-slate-50 p-3 min-h-[64px] whitespace-pre-wrap leading-relaxed">{note || '—'}</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailDialog;
