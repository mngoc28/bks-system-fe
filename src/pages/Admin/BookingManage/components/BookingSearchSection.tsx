import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterPortal from "@/components/common/FilterPortal";
import { SEARCH_DEBOUNCE_DELAY_MS } from "@/constant";
import { useGetUserProfileQuery } from "@/hooks/useUserQuery";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, X, RotateCcw } from "lucide-react";
import type { BookingSearchSectionProps } from "@/dataHelper/booking.dataHelper";

/**
 * Booking Search Section
 * An expandable filter panel for searching bookings by user, room, status, assignee, dates, and price.
 */
const BookingSearchSection: React.FC<BookingSearchSectionProps> = ({ open, filters, setFilters, onReset, onClose }) => {
  const { t } = useTranslation();
  const { data: userProfile } = useGetUserProfileQuery();
  const [localQ, setLocalQ] = useState(filters.q);
  const [localRoom, setLocalRoom] = useState(filters.room);
  const [localAssignee, setLocalAssignee] = useState(filters.assignee);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setFilters((s) => ({ ...s, q: localQ })), SEARCH_DEBOUNCE_DELAY_MS);
  }, [localQ]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setFilters((s) => ({ ...s, room: localRoom })), SEARCH_DEBOUNCE_DELAY_MS);
  }, [localRoom]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setFilters((s) => ({ ...s, assignee: localAssignee })), SEARCH_DEBOUNCE_DELAY_MS);
  }, [localAssignee]);

  useEffect(() => {
    setLocalQ(filters.q);
    setLocalRoom(filters.room);
    setLocalAssignee(filters.assignee);
  }, [filters.q, filters.room, filters.assignee]);

  const isPartner = userProfile?.data?.role === "partner";

  return (
    <FilterPortal open={open} onClose={onClose}>
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-500 p-1.5 text-white">
            <Search className="size-4" />
          </div>
          <h3 className="text-sm font-bold tracking-tight text-slate-800">
            {t("common.advanced_filter", { defaultValue: "Bộ lọc nâng cao" })}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {/* User (q) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("bookings.table.user")}
            </label>
            <Input
              value={localQ}
              onChange={(e) => setLocalQ(e.target.value)}
              placeholder={t("bookings.search.user_placeholder")}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Room */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("bookings.search.room_label")}
            </label>
            <Input
              value={localRoom}
              onChange={(e) => setLocalRoom(e.target.value)}
              placeholder={t("bookings.search.room_placeholder")}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("bookings.search.status_label")}
            </label>
            <select
              className="flex h-10 w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 text-sm text-slate-600 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
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

          {/* Assignee (only for non-partner) */}
          {!isPartner && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t("bookings.table.assignee")}
              </label>
              <Input
                value={localAssignee}
                onChange={(e) => setLocalAssignee(e.target.value)}
                placeholder={t("bookings.search.assignee_placeholder", { defaultValue: "Tên người phụ trách" }) as string}
                className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          )}

          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("bookings.search.start_date_label")}
            </label>
            <Input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters((s) => ({ ...s, start_date: e.target.value }))}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("bookings.search.end_date_label")}
            </label>
            <Input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters((s) => ({ ...s, end_date: e.target.value }))}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Price Min */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("bookings.search.price_min")}
            </label>
            <Input
              type="number"
              value={filters.price_min}
              onChange={(e) => setFilters((s) => ({ ...s, price_min: e.target.value }))}
              placeholder="0"
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Price Max */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("bookings.search.price_max")}
            </label>
            <Input
              type="number"
              value={filters.price_max}
              onChange={(e) => setFilters((s) => ({ ...s, price_max: e.target.value }))}
              placeholder="0"
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-50 pt-6">
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-10 gap-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
          >
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        </div>
      </div>
    </div>
    </FilterPortal>
  );
};

export default BookingSearchSection;
