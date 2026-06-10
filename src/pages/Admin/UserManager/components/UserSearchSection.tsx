import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/components/ui/date-picker-field";
import AdvancedFilterPanel, {
  FilterField,
  FilterSelect,
  filterInputClassName,
  filterLabelClassName,
  filterDateTriggerClassName,
} from "@/components/common/AdvancedFilterPanel";
import { UserSearchSectionProps } from "@/dataHelper/user.dataHelper";
import React from "react";
import { useTranslation } from "react-i18next";

const UserSearchSection: React.FC<UserSearchSectionProps> = ({
  open,
  searchQ,
  setSearchQ,
  searchEmail,
  setSearchEmail,
  searchPhone,
  setSearchPhone,
  filters,
  setFilters,
  onReset,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <AdvancedFilterPanel open={open} onClose={onClose} onReset={onReset}>
      <FilterField label={t("user.filter_name")}>
        <Input
          value={searchQ || ""}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder={t("user.filter_name_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("user.filter_email")}>
        <Input
          value={searchEmail || ""}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder={t("user.filter_email_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("user.filter_phone")}>
        <Input
          value={searchPhone || ""}
          onChange={(e) => setSearchPhone(e.target.value)}
          placeholder={t("user.filter_phone_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("user.filter_role")}>
        <FilterSelect
          value={filters.role || ""}
          onValueChange={(next) => setFilters((s) => ({ ...s, role: next }))}
          options={[
            { value: "", label: t("user.filter_all") },
            { value: "admin", label: t("common.role_admin") },
            { value: "partner", label: t("common.role_partner") },
            { value: "user", label: t("common.role_user") },
          ]}
        />
      </FilterField>

      <FilterField label={t("user.filter_status")}>
        <FilterSelect
          value={filters.status || ""}
          onValueChange={(next) => setFilters((s) => ({ ...s, status: next }))}
          options={[
            { value: "", label: t("user.filter_all") },
            { value: "0", label: t("common.pending") },
            { value: "1", label: t("common.active") },
            { value: "2", label: t("common.blocked") },
          ]}
        />
      </FilterField>

      <DatePickerField
        id="user-search-created-at"
        label={t("user.filter_created_at")}
        labelClassName={filterLabelClassName}
        value={filters.created_at_from || ""}
        onChange={(ymd) => setFilters((s) => ({ ...s, created_at_from: ymd }))}
        className="space-y-1"
        triggerClassName={filterDateTriggerClassName}
      />
    </AdvancedFilterPanel>
  );
};

export default UserSearchSection;
