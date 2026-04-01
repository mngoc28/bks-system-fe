import { Button } from "@/components/ui/button";
import { NewsHeaderProps } from "@/dataHelper/news.dataHelper";
import { Filter, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";


const NewsHeader: React.FC<NewsHeaderProps> = ({ onCreateNews, onOpenFilter }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t("news.title")}</p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-4 py-2 border-primary text-primary hover:bg-primary/5"
          onClick={onOpenFilter}
        >
          <Filter className="size-4" />
          {t("common.filter")}
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-2 px-4 py-2"
          onClick={onCreateNews}
        >
          <Plus className="size-4" />
          {t("news.create_news")}
        </Button>
      </div>
    </div>
  );
};

export default NewsHeader;

