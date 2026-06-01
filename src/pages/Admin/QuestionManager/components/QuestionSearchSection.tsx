import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterPortal from "@/components/common/FilterPortal";
import type { QuestionSearchProps } from "@/dataHelper/chatbot.dataHelper";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { Search, X, RotateCcw } from "lucide-react";

/**
 * Question Search Section
 * An advanced filtering interface that allows managers to search through chatbot questions by content.
 */
const QuestionSearchSection = ({
  open,
  filters: _filters,
  searchValue,
  onTitleChange,
  onReset,
  onClose,
  isLoading,
}: QuestionSearchProps) => {
  const { t } = useTranslation();
  if (!open) return null;

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
        <div className="flex items-center gap-3">
          {isLoading && <Spinner size="sm" showText text={t("common.loading_data")} />}
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {/* Content search */}
          <div className="space-y-2 xl:col-span-2">
            <label
              htmlFor="question-filter-content"
              className="text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              {t("questions.search.content_label")}
            </label>
            <Input
              id="question-filter-content"
              value={searchValue}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={t("questions.search.placeholder")}
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

export default QuestionSearchSection;
