import React, { useState } from "react";
import { PropertySearchSectionProps, PropertyType } from "@/dataHelper/property.dataHelper";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import AdvancedFilterPanel, {
  FilterField,
  FilterSelect,
  filterInputClassName,
} from "@/components/common/AdvancedFilterPanel";
import { usePropertyTypesQuery } from "@/hooks/usePropertyQuery";
import { ChevronUp, ChevronDown } from "lucide-react";
import { RENT_CATEGORY } from "@/constant";

const PropertySearchSection: React.FC<PropertySearchSectionProps> = ({ open = false, filters, setFilters, onReset, onClose }) => {
  const { t } = useTranslation();
  const { data: propertyTypes } = usePropertyTypesQuery(open);
  const [areaMode, setAreaMode] = useState<"min" | "max">("max");

  return (
    <AdvancedFilterPanel open={open} onClose={onClose} onReset={onReset}>
      <FilterField label={t("properties.filter_name")}>
        <Input
          value={filters.name || ""}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          placeholder={t("properties.filter_name_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("properties.filter_province")}>
        <Input
          value={filters.province_name || ""}
          onChange={(e) => setFilters({ ...filters, province_name: e.target.value })}
          placeholder={t("properties.filter_province_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("properties.filter_ward")}>
        <Input
          value={filters.ward_name || ""}
          onChange={(e) => setFilters({ ...filters, ward_name: e.target.value })}
          placeholder={t("properties.filter_ward_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("properties.filter_year_built")}>
        <Input
          value={filters.year_built || ""}
          onChange={(e) => setFilters({ ...filters, year_built: e.target.value })}
          placeholder={t("properties.filter_year_built_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("properties.filter_property_type")}>
        <FilterSelect
          value={filters.property_type_id ? String(filters.property_type_id) : ""}
          onValueChange={(next) => setFilters({ ...filters, property_type_id: next ? Number(next) : null })}
          placeholder={t("properties.filter_property_type_placeholder")}
          options={
            propertyTypes?.data?.map((item: PropertyType) => ({
              value: String(item.id),
              label: item.name,
            })) ?? []
          }
        />
      </FilterField>

      <FilterField label={t("properties.filter_rent_category")}>
        <FilterSelect
          value={filters.rent_category ? String(filters.rent_category) : ""}
          onValueChange={(next) => setFilters({ ...filters, rent_category: next ? Number(next) : null })}
          placeholder={t("properties.filter_rent_category_placeholder")}
          options={Object.entries(RENT_CATEGORY).map(([value, labelKey]) => ({
            value,
            label: t(labelKey as string),
          }))}
        />
      </FilterField>

      <FilterField label={t("properties.filter_area")}>
        <div className="relative flex items-center gap-2">
          <Input
            value={areaMode === "max" ? (filters.area_max || "") : (filters.area_min || "")}
            onChange={(e) => {
              const value = e.target.value;
              if (areaMode === "max") {
                setFilters({ ...filters, area_max: value ? Number(value) : undefined });
              } else {
                setFilters({ ...filters, area_min: value ? Number(value) : undefined });
              }
            }}
            placeholder={areaMode === "max" ? t("properties.area_max_placeholder") : t("properties.area_min_placeholder")}
            className={`${filterInputClassName} flex-1`}
          />
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => setAreaMode("max")}
              className={`flex size-5 items-center justify-center rounded border transition-colors ${areaMode === "max" ? "border-primary bg-primary/10 text-primary" : "border-gray-300 bg-white text-gray-400 hover:border-gray-400"}`}
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => setAreaMode("min")}
              className={`flex size-5 items-center justify-center rounded border transition-colors ${areaMode === "min" ? "border-primary bg-primary/10 text-primary" : "border-gray-300 bg-white text-gray-400 hover:border-gray-400"}`}
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </FilterField>
    </AdvancedFilterPanel>
  );
};

export default PropertySearchSection;
