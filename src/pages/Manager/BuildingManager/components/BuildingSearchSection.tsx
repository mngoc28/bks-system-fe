import React, { useState } from "react";
import { BuildingSearchSectionProps, BuildingType } from "@/dataHelper/building.dataHelper";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBuildingTypesQuery } from "@/hooks/useBuildingQuery";
import { ChevronUp, ChevronDown } from "lucide-react";

const BuildingSearchSection: React.FC<BuildingSearchSectionProps> = ({ open = false, filters, setFilters, onReset, onClose }) => {
  const { t } = useTranslation();
  const { data: buildingTypes } = useBuildingTypesQuery();
  
  const [areaMode, setAreaMode] = useState<"min" | "max">("max");
  const dataBuildingTypes = buildingTypes?.data?.map((item: BuildingType) => {
    const label = t(`buildings.building_type.${item.value}`);
    return {
      value: item.value,
      label: label,
    };
  });
  if (!open) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-slate-700">{t("buildings.filter_name")}</label>
            <Input value={filters.name || ""} onChange={(e) => setFilters({ ...filters, name: e.target.value })} placeholder={t("buildings.filter_name_placeholder")} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">{t("buildings.filter_province")}</label>
            <Input value={filters.province_name || ""} onChange={(e) => setFilters({ ...filters, province_name: e.target.value })} placeholder={t("buildings.filter_province_placeholder")} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">{t("buildings.filter_ward")}</label>
            <Input value={filters.ward_name || ""} onChange={(e) => 
              setFilters({ ...filters, ward_name: e.target.value })
              } placeholder={t("buildings.filter_ward_placeholder")} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">{t("buildings.filter_year_built")}</label>
            <Input value={filters.year_built || ""} onChange={(e) => setFilters({ ...filters, year_built: e.target.value })} placeholder={t("buildings.filter_year_built_placeholder")} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">{t("buildings.filter_building_type")}</label>
            <Select value={filters.building_type ? String(filters.building_type) : ""} onValueChange={(value) => setFilters({ ...filters, building_type: value ? Number(value) : 0 })}>
              <SelectTrigger>
                <SelectValue placeholder={t("buildings.filter_building_type_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {dataBuildingTypes?.map((item: { value: number; label: string; }) => (
                  <SelectItem key={item.value} value={String(item.value)}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">{t("buildings.filter_area")}</label>
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
                placeholder={areaMode === "max" ? t("buildings.area_max_placeholder") : t("buildings.area_min_placeholder")}
                className="flex-1"
              />
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => setAreaMode("max")}
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                    areaMode === "max" ? "border-primary bg-primary/10 text-primary" : "border-gray-300 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-600"
                  }`}
                  aria-label=""
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setAreaMode("max");
                    }
                  }}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setAreaMode("min")}
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                    areaMode === "min" ? "border-primary bg-primary/10 text-primary" : "border-gray-300 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-600"
                  }`}
                  aria-label=""
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setAreaMode("min");
                    }
                  }}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
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

export default BuildingSearchSection;
