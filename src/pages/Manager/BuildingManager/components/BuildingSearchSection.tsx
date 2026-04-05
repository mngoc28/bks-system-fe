import React, { useState } from "react";
import { BuildingSearchSectionProps, BuildingType } from "@/dataHelper/building.dataHelper";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBuildingTypesQuery } from "@/hooks/useBuildingQuery";
import { ChevronUp, ChevronDown, Search, X, RotateCcw } from "lucide-react";
import { RENT_CATEGORY } from "@/constant";

/**
 * Building Search Section
 * An expandable filter panel for searching buildings by name, location, year, type, and area.
 */
const BuildingSearchSection: React.FC<BuildingSearchSectionProps> = ({ open = false, filters, setFilters, onReset, onClose }) => {
  const { t } = useTranslation();
  const { data: buildingTypes } = useBuildingTypesQuery();

  const [areaMode, setAreaMode] = useState<"min" | "max">("max");

  if (!open) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-4 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-500 p-1.5 text-white">
            <Search className="size-4" />
          </div>
          <h3 className="text-sm font-bold tracking-tight text-slate-800">
            {t("common.advanced_filter", { defaultValue: "Bộ lọc nâng cao" })}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("buildings.filter_name")}
            </label>
            <Input
              value={filters.name || ""}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              placeholder={t("buildings.filter_name_placeholder")}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Province */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("buildings.filter_province")}
            </label>
            <Input
              value={filters.province_name || ""}
              onChange={(e) => setFilters({ ...filters, province_name: e.target.value })}
              placeholder={t("buildings.filter_province_placeholder")}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Ward */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("buildings.filter_ward")}
            </label>
            <Input
              value={filters.ward_name || ""}
              onChange={(e) => setFilters({ ...filters, ward_name: e.target.value })}
              placeholder={t("buildings.filter_ward_placeholder")}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Year Built */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("buildings.filter_year_built")}
            </label>
            <Input
              value={filters.year_built || ""}
              onChange={(e) => setFilters({ ...filters, year_built: e.target.value })}
              placeholder={t("buildings.filter_year_built_placeholder")}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("buildings.filter_building_type")}
            </label>
            <Select
              value={filters.property_type_id ? String(filters.property_type_id) : ""}
              onValueChange={(value) => setFilters({ ...filters, property_type_id: value ? Number(value) : null })}
            >
              <SelectTrigger className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:ring-2 focus:ring-indigo-100">
                <SelectValue placeholder={t("buildings.filter_building_type_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {buildingTypes?.data?.map((item: BuildingType) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rent Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("buildings.filter_rent_category")}
            </label>
            <Select
              value={filters.rent_category ? String(filters.rent_category) : ""}
              onValueChange={(value) => setFilters({ ...filters, rent_category: value ? Number(value) : null })}
            >
              <SelectTrigger className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:ring-2 focus:ring-indigo-100">
                <SelectValue placeholder={t("buildings.filter_rent_category_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RENT_CATEGORY).map(([value, labelKey]) => (
                  <SelectItem key={value} value={value}>
                    {t(labelKey as string)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("buildings.filter_area")}
            </label>
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
                className="h-10 flex-1 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => setAreaMode("max")}
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${areaMode === "max" ? "border-indigo-400 bg-indigo-50 text-indigo-500" : "border-gray-300 bg-white text-gray-400 hover:border-gray-400"}`}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setAreaMode("min")}
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${areaMode === "min" ? "border-indigo-400 bg-indigo-50 text-indigo-500" : "border-gray-300 bg-white text-gray-400 hover:border-gray-400"}`}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-50 pt-6">
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-10 gap-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
          >
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
          <Button
            onClick={onClose}
            className="h-10 gap-2 rounded-xl bg-slate-800 px-6 text-white hover:bg-slate-900 shadow-lg shadow-slate-200"
          >
            {t("common.apply_filter", { defaultValue: "Áp dụng bộ lọc" })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuildingSearchSection;
