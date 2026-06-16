import React from "react";
import { Button } from "@/components/ui/button";
import FilterPortal from "@/components/common/FilterPortal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search, X, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

const FILTER_SELECT_ALL = "__all__";

export const filterLabelClassName =
  "text-[11px] font-semibold uppercase tracking-wide text-slate-400";

export const filterInputClassName =
  "h-9 rounded-lg border-slate-100 bg-slate-50/50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20";

export const filterSelectTriggerClassName =
  "h-9 min-h-0 w-full rounded-lg border-slate-100 bg-slate-50/50 px-3 text-sm font-normal shadow-none hover:border-slate-200 hover:bg-white focus:ring-2 focus:ring-primary/20";

export const filterDateTriggerClassName =
  "h-9 min-h-0 rounded-lg border-slate-100 bg-slate-50/50 px-3 text-sm font-normal shadow-none hover:border-slate-200 hover:bg-white";

type FilterFieldProps = {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
};

export const FilterField: React.FC<FilterFieldProps> = ({ label, htmlFor, className, children }) => (
  <div className={cn("space-y-1", className)}>
    <label htmlFor={htmlFor} className={filterLabelClassName}>
      {label}
    </label>
    {children}
  </div>
);

export type FilterSelectOption = {
  value: string;
  label: React.ReactNode;
};

type FilterSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: FilterSelectOption[];
  placeholder?: string;
  disabled?: boolean;
};

export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
}) => {
  const hasAllOption = options.some((option) => option.value === "");
  const selectValue =
    value === ""
      ? hasAllOption
        ? FILTER_SELECT_ALL
        : undefined
      : value;

  return (
    <Select
      value={selectValue}
      onValueChange={(next) => onValueChange(next === FILTER_SELECT_ALL ? "" : next)}
      disabled={disabled}
    >
      <SelectTrigger className={filterSelectTriggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => {
          const itemValue = option.value === "" ? FILTER_SELECT_ALL : option.value;
          return (
            <SelectItem key={itemValue} value={itemValue}>
              {option.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

type AdvancedFilterPanelProps = {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
};

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  open,
  onClose,
  onReset,
  children,
  headerExtra,
}) => {
  const { t } = useTranslation();

  return (
    <FilterPortal open={open} onClose={onClose}>
      <div className="relative z-30 rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-200 animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-2 rounded-t-xl">
          <div className="flex min-w-0 items-center gap-2">
            <div className="rounded-md bg-primary p-1 text-white">
              <Search className="size-3.5" />
            </div>
            <h3 className="truncate text-sm font-semibold text-slate-800">
              {t("common.advanced_filter", { defaultValue: "Bộ lọc nâng cao" })}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {headerExtra}
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 gap-1.5 rounded-lg px-2.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-primary"
            >
              <RotateCcw className="size-3.5" />
              {t("common.reset")}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label={t("common.close", { defaultValue: "Đóng" })}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="p-4 rounded-b-xl">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {children}
          </div>
        </div>
      </div>
    </FilterPortal>
  );
};

export default AdvancedFilterPanel;
