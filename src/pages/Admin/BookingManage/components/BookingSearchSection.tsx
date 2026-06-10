import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/components/ui/date-picker-field";
import AdvancedFilterPanel, {
  FilterField,
  FilterSelect,
  filterInputClassName,
  filterLabelClassName,
  filterDateTriggerClassName,
} from "@/components/common/AdvancedFilterPanel";
import { SEARCH_DEBOUNCE_DELAY_MS } from "@/constant";
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
    <AdvancedFilterPanel open={open} onClose={onClose} onReset={onReset}>
      <FilterField label={t("bookings.table.user")}>
        <Input
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder={t("bookings.search.user_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("bookings.search.room_label")}>
        <Input
          value={localRoom}
          onChange={(e) => setLocalRoom(e.target.value)}
          placeholder={t("bookings.search.room_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("bookings.search.status_label")}>
        <FilterSelect
          value={filters.status || ""}
          onValueChange={(next) => setFilters((s) => ({ ...s, status: next }))}
          options={[
            { value: "", label: t("bookings.search.status_all") },
            { value: "0", label: t("bookings.search.status_pending") },
            { value: "1", label: t("bookings.search.status_confirmed") },
            { value: "2", label: t("bookings.search.status_cancelled") },
            { value: "3", label: t("bookings.search.status_completed") },
          ]}
        />
      </FilterField>

      {!isPartner && (
        <FilterField label={t("bookings.table.assignee")}>
          <Input
            value={localAssignee}
            onChange={(e) => setLocalAssignee(e.target.value)}
            placeholder={t("bookings.search.assignee_placeholder", { defaultValue: "Tên người phụ trách" }) as string}
            className={filterInputClassName}
          />
        </FilterField>
      )}

      <DatePickerField
        id="booking-search-start-date"
        label={t("bookings.search.start_date_label")}
        labelClassName={filterLabelClassName}
        value={filters.start_date}
        onChange={(ymd) => setFilters((s) => ({ ...s, start_date: ymd }))}
        maxDate={filters.end_date || undefined}
        className="space-y-1"
        triggerClassName={filterDateTriggerClassName}
      />

      <DatePickerField
        id="booking-search-end-date"
        label={t("bookings.search.end_date_label")}
        labelClassName={filterLabelClassName}
        value={filters.end_date}
        onChange={(ymd) => setFilters((s) => ({ ...s, end_date: ymd }))}
        minDate={filters.start_date || undefined}
        className="space-y-1"
        triggerClassName={filterDateTriggerClassName}
      />

      <FilterField label={t("bookings.search.price_min")}>
        <Input
          type="number"
          value={filters.price_min}
          onChange={(e) => setFilters((s) => ({ ...s, price_min: e.target.value }))}
          placeholder="0"
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("bookings.search.price_max")}>
        <Input
          type="number"
          value={filters.price_max}
          onChange={(e) => setFilters((s) => ({ ...s, price_max: e.target.value }))}
          placeholder="0"
          className={filterInputClassName}
        />
      </FilterField>
    </AdvancedFilterPanel>
  );
};

export default BookingSearchSection;
