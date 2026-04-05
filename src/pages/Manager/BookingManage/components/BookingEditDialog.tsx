import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BOOKING_STATUS_ORDER, PERMISSIONS } from "@/constant";
import type { BookingEditDialogProps } from "@/dataHelper/booking.dataHelper";
import { useCheckPermissionQuery } from "@/hooks/useAuthQuery";
import { useBookingDetailQuery, useConfirmBookingMutation, useUpdateBookingMutation } from "@/hooks/useBookingQuery";
import { formatDateVietnamFromISO, parseVietnamDateToISO } from "@/utils/dateUtils";
import { getStatusClass, mapBookingStatus, mapStatusToNumber } from "@/utils/utils";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Booking Edit Dialog
 * Provides a form to update booking details such as dates, status, and notes, with permission-based read-only fields.
 */
const BookingEditDialog: React.FC<BookingEditDialogProps> = ({ id, open, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useBookingDetailQuery(id, open);
  const bookingRaw: any = (data as any)?.data?.booking ?? (data as any)?.data;
  const { data: checkPermission } = useCheckPermissionQuery();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [note, setNote] = useState("");

  // Text values shown to users in DD-MM-YYYY format
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");

  const updateMutation = useUpdateBookingMutation();
  const confirmMutation = useConfirmBookingMutation();

  const isPartner = checkPermission?.data?.role === PERMISSIONS.PARTNER;

  // hook to populate form when bookingRaw changes
  useEffect(() => {
    if (bookingRaw) {
      const toDateOnly = (s?: string | null) => (s ? String(s).slice(0, 10) : "");
      const sIso = toDateOnly(bookingRaw.start_date ?? bookingRaw.startDate);
      const eIso = toDateOnly(bookingRaw.end_date ?? bookingRaw.endDate);
      const rawStatus = bookingRaw.status ?? bookingRaw.booking_status;
      const mappedStatus = typeof rawStatus === 'number' ? mapBookingStatus(rawStatus) : (rawStatus ?? "pending");
      setStartDate(sIso);
      setEndDate(eIso);
      setStartText(formatDateVietnamFromISO(sIso));
      setEndText(formatDateVietnamFromISO(eIso));
      setStatus(mappedStatus);
      setNote(bookingRaw.note ?? bookingRaw.booking_note ?? "");
    }
  }, [bookingRaw]);

  // submit handler
  const onSubmit = async () => {
    if (!id) return;
    // Otherwise, use the update endpoint
    await updateMutation.mutateAsync({ id, payload: {
      start_date: startDate || undefined,
      end_date: endDate || null,
      status: mapStatusToNumber(status),
      note: note || null,
    }});
    onClose();
    onSuccess?.(id);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("bookings.edit.title")}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-sm text-slate-500">{t("bookings.edit.saving")}</div>
        ) : !bookingRaw ? (
          <div className="text-sm text-red-600">{t("bookings.edit.not_found")}</div>
        ) : (
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t("bookings.edit.start_time")}</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="dd-mm-yyyy"
                  pattern="\\d{2}-\\d{2}-\\d{4}"
                  value={startText}
                  disabled={isPartner}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStartText(v);
                    const iso = parseVietnamDateToISO(v);
                    if (iso) setStartDate(iso);
                  }}
                  onBlur={(e) => {
                    const iso = parseVietnamDateToISO(e.target.value);
                    if (iso) {
                      setStartDate(iso);
                      setStartText(formatDateVietnamFromISO(iso));
                    }
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label>{t("bookings.edit.end_time")}</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="dd-mm-yyyy"
                  pattern="\\d{2}-\\d{2}-\\d{4}"
                  value={endText}
                  disabled={isPartner}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEndText(v);
                    const iso = parseVietnamDateToISO(v);
                    if (iso) setEndDate(iso);
                  }}
                  onBlur={(e) => {
                    const iso = parseVietnamDateToISO(e.target.value);
                    if (iso) {
                      setEndDate(iso);
                      setEndText(formatDateVietnamFromISO(iso));
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>{t("bookings.edit.status")}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t("bookings.search.status_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_STATUS_ORDER.map((status) => (
                    <SelectItem
                      key={status}
                      value={mapBookingStatus(status)}
                      className={getStatusClass(status)}
                    >
                      {t(`bookings.add.status_${mapBookingStatus(status)}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{t("bookings.edit.note")}</Label>
              <textarea className="w-full rounded-md border px-3 py-2 text-sm min-h-[96px]" value={note} disabled={isPartner} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>Hủy</Button>
          <Button onClick={onSubmit} disabled={updateMutation.isPending || confirmMutation.isPending || isLoading || !bookingRaw}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingEditDialog;
