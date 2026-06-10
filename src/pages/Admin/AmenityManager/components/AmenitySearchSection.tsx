import { Input } from "@/components/ui/input";
import AdvancedFilterPanel, { FilterField, filterInputClassName } from "@/components/common/AdvancedFilterPanel";
import { AmenitySearchSectionProps } from "@/dataHelper/amenity.dataHelper";
import React from "react";
import { useTranslation } from "react-i18next";

const AmenitySearchSection: React.FC<AmenitySearchSectionProps> = ({
  open,
  searchValue,
  setSearchValue,
  onReset,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <AdvancedFilterPanel open={open} onClose={onClose} onReset={onReset}>
      <FilterField label={t("amenities.search_name")} className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t("amenities.search_name_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>
    </AdvancedFilterPanel>
  );
};

export default AmenitySearchSection;
