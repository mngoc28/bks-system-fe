import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoomSearchSectionProps } from "@/dataHelper/room.dataHelper";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const RoomSearchSection: React.FC<RoomSearchSectionProps> = ({ filters, setFilters, onReset, onClose }) => {
  const { t } = useTranslation();
  const [localTitle, setLocalTitle] = useState(filters.title || "");
  const [localRoomNumber, setLocalRoomNumber] = useState(filters.room_number || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((s) => ({ ...s, title: localTitle }));
    }, 1000);
    return ()  => clearTimeout(timer);
  }, [localTitle, setFilters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((s) => ({ ...s, room_number: localRoomNumber}));
    }, 1000);
    return () => clearTimeout(timer);
  }, [localRoomNumber, setFilters]);

  useEffect(() => {
    setLocalTitle(filters.title || "");
  }, [filters.title]);

  useEffect(() => {
    setLocalRoomNumber(filters.room_number || "");
  }, [filters.room_number]);

  return (
    <div className="mt-4 w-full rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm text-slate-700">{t("rooms.room_title")}</label>
              <Input
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                placeholder={t("rooms.search_title_placeholder")}
                type="search"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-700">{t("rooms.room_number")}</label>
              <Input
                value={localRoomNumber}
                onChange={(e) => setLocalRoomNumber(e.target.value)}
                placeholder={t("rooms.search_room_number_placeholder")}
                type="search"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-700">{t("rooms.room_type")}</label>
              <select
                className="flex h-12 w-full rounded border border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 transition-colors"
                value={filters.room_type || ""}
                onChange={(e) => setFilters((s) => ({ ...s, room_type: e.target.value ? Number(e.target.value) : undefined }))}
              >
                <option value="">{t("common.all")}</option>
                <option value="1">{t("rooms.room_type_single")}</option>
                <option value="2">{t("rooms.room_type_double")}</option>
                <option value="3">{t("rooms.room_type_mini_apartment")}</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-700">{t("rooms.status")}</label>
              <select
                className="flex h-12 w-full rounded border border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 transition-colors"
                value={filters.status === undefined ? "" : filters.status}
                onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value === "" ? undefined : e.target.value }))}
              >
                <option value="">{t("common.all")}</option>
                <option value="1">{t("rooms.status_public")}</option>
                <option value="0">{t("rooms.status_private")}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={onReset} type="button">
              {t("common.reset")}
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              {t("common.close")}
            </Button>
          </div>
        </div>
    </div>
  );
};

export default RoomSearchSection;

