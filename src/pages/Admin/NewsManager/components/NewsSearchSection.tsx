import { Button } from "@/components/ui/button";
import FilterPortal from "@/components/common/FilterPortal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toastError } from "@/components/ui/toast";
import { NewsSearchSectionProps } from "@/dataHelper/news.dataHelper";
import React from "react";
import { useTranslation } from "react-i18next";
import { Search, X, RotateCcw } from "lucide-react";

/**
 * News Search Section
 * An expandable filter panel allowing users to search news by title, author, status, and publication date range.
 */
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
    <FilterPortal open={open} onClose={onClose}>
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/100 p-1.5 text-white">
            <Search className="size-4" />
          </div>
          <h3 className="text-sm font-bold tracking-tight text-slate-800">
            {t("common.advanced_filter", { defaultValue: "Bộ lọc nâng cao" })}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {/* Author / User Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("news.filter_user_name")}
            </label>
            <Input
              value={filters.user_name || ""}
              onChange={(e) => setFilters({ ...filters, user_name: e.target.value })}
              placeholder={t("news.filter_user_name_placeholder")}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("news.filter_title")}
            </label>
            <Input
              value={filters.title || ""}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              placeholder={t("news.filter_title_placeholder")}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("news.filter_status")}
            </label>
            <Select
              value={filters.status?.toString() || ""}
              onValueChange={(value) => setFilters({ ...filters, status: value ? Number(value) : undefined })}
            >
              <SelectTrigger className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder={t("news.filter_status_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("news.filter_status_draft")}</SelectItem>
                <SelectItem value="1">{t("news.filter_status_published")}</SelectItem>
                <SelectItem value="2">{t("news.filter_status_archived")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Published Start */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("news.filter_published_start_at")}
            </label>
            <Input
              type="date"
              value={filters.published_at_start || ""}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Published End */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("news.filter_published_end_at")}
            </label>
            <Input
              type="date"
              value={filters.published_at_end || ""}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-50 pt-6">
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-10 gap-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-primary"
          >
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        </div>
      </div>
    </div>
    </FilterPortal>
  );
};

export default NewsSearchSection;