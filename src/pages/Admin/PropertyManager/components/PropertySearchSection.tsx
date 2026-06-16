import React, { useState } from "react";
import { PropertySearchSectionProps, PropertyType } from "@/dataHelper/property.dataHelper";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import AdvancedFilterPanel, {
  FilterField,
  FilterSelect,
  filterInputClassName,
  filterSelectTriggerClassName,
} from "@/components/common/AdvancedFilterPanel";
import { usePropertyTypesQuery } from "@/hooks/usePropertyQuery";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetWardsByProvinceId } from "@/hooks/useWardQuery";
import { ChevronUp, ChevronDown } from "lucide-react";
import { RENT_CATEGORY } from "@/constant";
import SearchableSelect from "@/components/ui/searchable-select";
import { useListPartnerQuery } from "@/hooks/usePartnerQuery";
import { useGetUserProfileQuery } from "@/hooks/useUserQuery";

const PropertySearchSection: React.FC<PropertySearchSectionProps> = ({ open = false, filters, setFilters, onReset, onClose }) => {
  const { t } = useTranslation();
  const { data: propertyTypes } = usePropertyTypesQuery(open);
  const [areaMode, setAreaMode] = useState<"min" | "max">("max");

  // Fetch user profile and partners list if admin
  const { data: userProfile } = useGetUserProfileQuery();
  const isAdmin = userProfile?.data?.role === "admin";
  const { data: partnersResponse } = useListPartnerQuery({ per_page: 200 }, { enabled: open && isAdmin });
  const partnersPayload: any = partnersResponse;
  const partners: any[] = Array.isArray(partnersPayload?.data?.data)
    ? partnersPayload.data.data
    : Array.isArray(partnersPayload?.data)
    ? partnersPayload.data
    : [];

  // Fetch provinces and wards data for selects
  const { data: provincesData } = useGetAllProvincesTypes();
  const selectedProvince = provincesData?.data?.find((p) => p.name === filters.province_name);
  const selectedProvinceId = selectedProvince?.id || 0;
  const { data: wardsData } = useGetWardsByProvinceId(selectedProvinceId);

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

      {isAdmin && (
        <FilterField label={t("properties.filter_partner", { defaultValue: "Chủ sở hữu / Đối tác" })}>
          <SearchableSelect
            value={filters.partner_id ? String(filters.partner_id) : ""}
            onValueChange={(next) =>
              setFilters({
                ...filters,
                partner_id: next ? Number(next) : null,
              })
            }
            placeholder={t("properties.filter_partner_placeholder", { defaultValue: "Chọn chủ sở hữu..." }) as string}
            searchPlaceholder={t("common.search", { defaultValue: "Tìm kiếm..." }) as string}
            emptyMessage={t("common.no_data", { defaultValue: "Không có dữ liệu" }) as string}
            options={partners.map((p: any) => ({
              value: String(p.id),
              label: `${p.company_name} (${p.user_name})`,
            }))}
            triggerClassName={filterSelectTriggerClassName}
          />
        </FilterField>
      )}

      <FilterField label={t("properties.filter_province")}>
        <FilterSelect
          value={filters.province_name || ""}
          onValueChange={(next) =>
            setFilters({
              ...filters,
              province_name: next || null,
              ward_name: null,
            })
          }
          placeholder={t("properties.filter_province_placeholder")}
          options={
            provincesData?.data?.map((p) => ({
              value: p.name,
              label: p.name,
            })) ?? []
          }
        />
      </FilterField>

      <FilterField label={t("properties.filter_ward")}>
        <FilterSelect
          value={filters.ward_name || ""}
          onValueChange={(next) => setFilters({ ...filters, ward_name: next || null })}
          placeholder={t("properties.filter_ward_placeholder")}
          disabled={!selectedProvinceId}
          options={
            wardsData?.data?.map((w) => ({
              value: w.name,
              label: w.name,
            })) ?? []
          }
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
