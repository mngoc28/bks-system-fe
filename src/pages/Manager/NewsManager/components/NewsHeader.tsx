import { Button } from "@/components/ui/button";
import { NewsHeaderProps } from "@/dataHelper/news.dataHelper";
import { Filter, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageBar from "@/components/PageBar";

const NewsHeader: React.FC<NewsHeaderProps> = ({ onCreateNews, onOpenFilter }) => {
  const { t } = useTranslation();

  return (
    <PageBar
      subtitle={t("news.news_list_subtitle") || "Quản lý các tin tức và bài viết hệ thống."}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-slate-200 bg-white font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
            onClick={onOpenFilter}
          >
            <Filter className="size-4" />
            {t("common.filter")}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 bg-indigo-600 font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-indigo-200"
            onClick={onCreateNews}
          >
            <Plus className="size-4" />
            {t("news.create_news")}
          </Button>
        </div>
      }
    />
  );
};

export default NewsHeader;

