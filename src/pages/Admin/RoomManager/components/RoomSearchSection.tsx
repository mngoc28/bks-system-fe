import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterPortal from "@/components/common/FilterPortal";
import { SEARCH_DEBOUNCE_DELAY_MS } from "@/constant";
import { RoomSearchSectionProps } from "@/dataHelper/room.dataHelper";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, X, RotateCcw } from "lucide-react";

/**
 * Room Search Section
 * An advanced filtering dashboard that allows managers to narrow down room lists by title, number, type, and status with real-time feedback.
 */
const RoomSearchSection: React.FC<RoomSearchSectionProps> = ({ open, filters, setFilters, onReset, onClose }) => {
  const { t } = useTranslation();
  const [localTitle, setLocalTitle] = useState(filters.title || "");
  const [localRoomNumber, setLocalRoomNumber] = useState(filters.room_number || "");

  useEffect(() => {
    const timer = setTimeout(() => setFilters((s) => ({ ...s, title: localTitle })), SEARCH_DEBOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [localTitle, setFilters]);

  useEffect(() => {
    const timer = setTimeout(() => setFilters((s) => ({ ...s, room_number: localRoomNumber })), SEARCH_DEBOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [localRoomNumber, setFilters]);

  useEffect(() => setLocalTitle(filters.title || ""), [filters.title]);
  useEffect(() => setLocalRoomNumber(filters.room_number || ""), [filters.room_number]);

  return (
    <FilterPortal open={open} onClose={onClose}>
    <div className="animate-in fade-in slide-in-from-top-4 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 transition-all duration-300">
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
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("rooms.room_title")}
            </label>
            <Input
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder={t("rooms.search_title_placeholder")}
              type="search"
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Room Number */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("rooms.room_number")}
            </label>
            <Input
              value={localRoomNumber}
              onChange={(e) => setLocalRoomNumber(e.target.value)}
              placeholder={t("rooms.search_room_number_placeholder")}
              type="search"
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Room Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("rooms.room_type")}
            </label>
            <select
              className="flex h-10 w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 text-sm text-slate-600 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={filters.room_type || ""}
              onChange={(e) => setFilters((s) => ({ ...s, room_type: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <option value="">{t("common.all")}</option>
              <option value="1">{t("rooms.room_type_single")}</option>
              <option value="2">{t("rooms.room_type_double")}</option>
              <option value="3">{t("rooms.room_type_mini_apartment")}</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("rooms.status")}
            </label>
            <select
              className="flex h-10 w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 text-sm text-slate-600 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={filters.status === undefined ? "" : filters.status}
              onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value === "" ? undefined : e.target.value }))}
            >
              <option value="">{t("common.all")}</option>
              <option value="1">{t("rooms.status_public")}</option>
              <option value="0">{t("rooms.status_private")}</option>
            </select>
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

export default RoomSearchSection;
