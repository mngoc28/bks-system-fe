import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { toastError } from "@/components/ui/toast";
import AdvancedFilterPanel, {
  FilterField,
  FilterSelect,
  filterInputClassName,
  filterLabelClassName,
  filterDateTriggerClassName,
} from "@/components/common/AdvancedFilterPanel";
import { NewsSearchSectionProps } from "@/dataHelper/news.dataHelper";
import React from "react";
import { useTranslation } from "react-i18next";

const NewsSearchSection: React.FC<NewsSearchSectionProps> = ({ open, filters, setFilters, onReset, onClose }) => {
  const { t } = useTranslation();

  const isValidTimeRange = (nextFilters = filters) => {
    const start = nextFilters.published_at_start;
    const end = nextFilters.published_at_end;
    if (start && end && new Date(start) > new Date(end)) {
      toastError(t("news.filter_published_start_at_error"));
      return false;
    }
    return true;
  };

  const handleStartDateChange = (value: string) => {
    const nextFilters = { ...filters, published_at_start: value };
    if (!isValidTimeRange(nextFilters)) return;
    setFilters(nextFilters);
  };

  const handleEndDateChange = (value: string) => {
    const nextFilters = { ...filters, published_at_end: value };
    if (!isValidTimeRange(nextFilters)) return;
    setFilters(nextFilters);
  };

  return (
    <AdvancedFilterPanel open={open} onClose={onClose} onReset={onReset}>
      <FilterField label={t("news.filter_user_name")}>
        <Input
          value={filters.user_name || ""}
          onChange={(e) => setFilters({ ...filters, user_name: e.target.value })}
          placeholder={t("news.filter_user_name_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("news.filter_title")}>
        <Input
          value={filters.title || ""}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
          placeholder={t("news.filter_title_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("news.filter_status")}>
        <FilterSelect
          value={filters.status?.toString() || ""}
          onValueChange={(next) => setFilters({ ...filters, status: next ? Number(next) : undefined })}
          placeholder={t("news.filter_status_placeholder")}
          options={[
            { value: "0", label: t("news.filter_status_draft") },
            { value: "1", label: t("news.filter_status_published") },
            { value: "2", label: t("news.filter_status_archived") },
          ]}
        />
      </FilterField>

      <DatePickerField
        id="news-search-published-start"
        label={t("news.filter_published_start_at")}
        labelClassName={filterLabelClassName}
        value={filters.published_at_start || ""}
        onChange={handleStartDateChange}
        maxDate={filters.published_at_end || undefined}
        className="space-y-1"
        triggerClassName={filterDateTriggerClassName}
      />

      <DatePickerField
        id="news-search-published-end"
        label={t("news.filter_published_end_at")}
        labelClassName={filterLabelClassName}
        value={filters.published_at_end || ""}
        onChange={handleEndDateChange}
        minDate={filters.published_at_start || undefined}
        className="space-y-1"
        triggerClassName={filterDateTriggerClassName}
      />
    </AdvancedFilterPanel>
  );
};

export default NewsSearchSection;
