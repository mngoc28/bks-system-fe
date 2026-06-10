import { Input } from "@/components/ui/input";
import AdvancedFilterPanel, { FilterField, filterInputClassName } from "@/components/common/AdvancedFilterPanel";
import { ServiceSearchSectionProps } from "@/dataHelper/service.dataHelper";
import React from "react";
import { useTranslation } from "react-i18next";

const ServiceSearchSection: React.FC<ServiceSearchSectionProps> = ({
  open,
  value,
  onChange,
  onReset,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <AdvancedFilterPanel open={open} onClose={onClose} onReset={onReset}>
      <FilterField label={t("serviceManagement.search_name")}>
        <Input
          value={value.name || ""}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder={t("serviceManagement.search_name_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("serviceManagement.min_price_placeholder")}>
        <Input
          type="text"
          value={value.priceMin || ""}
          onChange={(e) => onChange({ ...value, priceMin: e.target.value || "" })}
          placeholder={t("serviceManagement.min_price_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("serviceManagement.price_max_placeholder")}>
        <Input
          type="text"
          value={value.priceMax || ""}
          onChange={(e) => onChange({ ...value, priceMax: e.target.value || "" })}
          placeholder={t("serviceManagement.price_max_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>
    </AdvancedFilterPanel>
  );
};

export default ServiceSearchSection;
