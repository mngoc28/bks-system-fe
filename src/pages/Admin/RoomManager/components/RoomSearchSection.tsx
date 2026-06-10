import { Input } from "@/components/ui/input";
import AdvancedFilterPanel, {
  FilterField,
  FilterSelect,
  filterInputClassName,
} from "@/components/common/AdvancedFilterPanel";
import { SEARCH_DEBOUNCE_DELAY_MS } from "@/constant";
import { RoomSearchSectionProps } from "@/dataHelper/room.dataHelper";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
    <AdvancedFilterPanel open={open} onClose={onClose} onReset={onReset}>
      <FilterField label={t("rooms.room_title")}>
        <Input
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          placeholder={t("rooms.search_title_placeholder")}
          type="search"
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("rooms.room_number")}>
        <Input
          value={localRoomNumber}
          onChange={(e) => setLocalRoomNumber(e.target.value)}
          placeholder={t("rooms.search_room_number_placeholder")}
          type="search"
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("rooms.room_type")}>
        <FilterSelect
          value={filters.room_type ? String(filters.room_type) : ""}
          onValueChange={(next) =>
            setFilters((s) => ({ ...s, room_type: next ? Number(next) : undefined }))
          }
          options={[
            { value: "", label: t("common.all") },
            { value: "1", label: t("rooms.room_type_single") },
            { value: "2", label: t("rooms.room_type_double") },
            { value: "3", label: t("rooms.room_type_mini_apartment") },
          ]}
        />
      </FilterField>

      <FilterField label={t("rooms.status")}>
        <FilterSelect
          value={filters.status === undefined ? "" : String(filters.status)}
          onValueChange={(next) =>
            setFilters((s) => ({ ...s, status: next === "" ? undefined : next }))
          }
          options={[
            { value: "", label: t("common.all") },
            { value: "1", label: t("rooms.status_public") },
            { value: "0", label: t("rooms.status_private") },
          ]}
        />
      </FilterField>
    </AdvancedFilterPanel>
  );
};

export default RoomSearchSection;
