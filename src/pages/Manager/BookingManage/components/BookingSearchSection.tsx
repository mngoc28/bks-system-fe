import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetUserProfileQuery } from "@/hooks/useUserQuery";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { BookingSearchSectionProps } from "@/dataHelper/booking.dataHelper";

const BookingSearchSection: React.FC<BookingSearchSectionProps> = ({ open, filters, setFilters, onReset, onClose }) => {
  const { t } = useTranslation();
  const { data: userProfile } = useGetUserProfileQuery();
  const [localQ, setLocalQ] = useState(filters.q);
  const [localRoom, setLocalRoom] = useState(filters.room);
  const [localAssignee, setLocalAssignee] = useState(filters.assignee);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // handle debounced name filter
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setFilters((s) => ({ ...s, q: localQ }));
    }, 500);
  }, [localQ]);

  // handle debounced room filter
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setFilters((s) => ({ ...s, room: localRoom }));
    }, 500);
  }, [localRoom]);

  // handle debounced assignee filter
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setFilters((s) => ({ ...s, assignee: localAssignee }));
    }, 500);
  }, [localAssignee]);

  // sync local state when filters change from outside
  useEffect(() => {
    setLocalQ(filters.q);
    setLocalRoom(filters.room);
    setLocalAssignee(filters.assignee);
  }, [filters.q, filters.room, filters.assignee]);

  if (!open) return null;

  return (
    <div className="mt-4 w-full rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-800">{t("bookings.search.title")}</h3>
        <p className="text-sm text-slate-500">{t("bookings.search.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-12">
        <div className="md:col-span-3">
          <label className="mb-1 block text-sm text-slate-700">{t("bookings.table.user")}</label>
          <Input value={localQ} onChange={(e) => setLocalQ(e.target.value)} placeholder={t("bookings.search.user_placeholder")} />
        </div>

        <div className="md:col-span-4">
          <label className="mb-1 block text-sm text-slate-700">{t("bookings.search.room_label")}</label>
          <Input value={localRoom} onChange={(e) => setLocalRoom(e.target.value)} placeholder={t("bookings.search.room_placeholder")} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-700">{t("bookings.search.status_label")}</label>
          <select
            className="w-full rounded border border-slate-300 px-3 py-3 text-sm text-slate-700 h-12"
            value={filters.status}
            onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
          >
            <option value="">{t("bookings.search.status_all")}</option>
            <option value="0">{t("bookings.search.status_pending")}</option>
            <option value="1">{t("bookings.search.status_confirmed")}</option>
            <option value="2">{t("bookings.search.status_cancelled")}</option>
            <option value="3">{t("bookings.search.status_completed")}</option>
          </select>
        </div>

        {userProfile?.data?.role !== "partner" && (
        <div className="md:col-span-3">
          <label className="mb-1 block text-sm text-slate-700">{t("bookings.table.assignee")}</label>
          <Input value={localAssignee} onChange={(e) => setLocalAssignee(e.target.value)} placeholder={t("bookings.search.assignee_placeholder", { defaultValue: "Tên người phụ trách" }) as string} />
        </div>
        )}
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-700">{t("bookings.search.start_date_label")}</label>
          <Input type="date" value={filters.start_date} onChange={(e) => setFilters((s) => ({ ...s, start_date: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-700">{t("bookings.search.end_date_label")}</label>
          <Input type="date" value={filters.end_date} onChange={(e) => setFilters((s) => ({ ...s, end_date: e.target.value }))} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-700">{t("bookings.search.price_min")}</label>
          <Input type="number" value={filters.price_min} onChange={(e) => setFilters((s) => ({ ...s, price_min: e.target.value }))} placeholder="0" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-700">{t("bookings.search.price_max")}</label>
          <Input type="number" value={filters.price_max} onChange={(e) => setFilters((s) => ({ ...s, price_max: e.target.value }))} placeholder="0" />
        </div>

        <div className="md:col-span-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onReset} type="button">
            {t("bookings.search.reset")}
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("bookings.search.close")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingSearchSection;
