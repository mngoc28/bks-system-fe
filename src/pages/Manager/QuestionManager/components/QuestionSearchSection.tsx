import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuestionSearchProps } from "@/dataHelper/chatbot.dataHelper";
import { useTranslation } from "react-i18next";

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
    <div className="mt-4 w-full rounded-lg border border-blue-100 bg-white px-4 py-5 shadow-sm sm:px-6">
      <div className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">{t("questions.search.title")}</h3>
            <p className="text-sm text-slate-500">{t("questions.search.subtitle")}</p>
          </div>
          {isLoading && (
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 sm:self-auto">
              <span className="size-2 animate-ping rounded-full bg-blue-500" aria-hidden="true"></span>
              {t("common.loading")}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-sm text-slate-700" htmlFor="question-filter-content">
            {t("questions.search.content_label")}
          </label>
          <Input id="question-filter-content" value={searchValue} onChange={(event) => onTitleChange(event.target.value)} placeholder={t("questions.search.placeholder")} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" size="sm" onClick={onReset} type="button" className="w-full sm:w-auto">
            {t("questions.search.reset")}
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose} className="w-full sm:w-auto">
            {t("questions.search.close")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSearchSection;
