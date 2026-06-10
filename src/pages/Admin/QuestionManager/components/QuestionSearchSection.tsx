import { Input } from "@/components/ui/input";
import AdvancedFilterPanel, { FilterField, filterInputClassName } from "@/components/common/AdvancedFilterPanel";
import type { QuestionSearchProps } from "@/dataHelper/chatbot.dataHelper";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";

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

  return (
    <AdvancedFilterPanel
      open={open}
      onClose={onClose}
      onReset={onReset}
      headerExtra={isLoading ? <Spinner size="sm" showText text={t("common.loading_data")} /> : undefined}
    >
      <FilterField
        label={t("questions.search.content_label")}
        htmlFor="question-filter-content"
        className="sm:col-span-2 lg:col-span-3 xl:col-span-4"
      >
        <Input
          id="question-filter-content"
          value={searchValue}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t("questions.search.placeholder")}
          className={filterInputClassName}
        />
      </FilterField>
    </AdvancedFilterPanel>
  );
};

export default QuestionSearchSection;
