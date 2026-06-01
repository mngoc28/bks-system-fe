import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { News } from "@/dataHelper/news.dataHelper";
import { Edit, Trash2, Calendar, User, ImageIcon } from "lucide-react";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { format } from "date-fns";
import { highlightText } from "@/utils/utils";

interface NewsCardProps {
  news: News;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  highlightTerms?: {
    user_name?: string;
    title?: string;
  };
}

/**
 * News Card Component
 * A visual representation of a news article in a grid, featuring cover image, summary, and action buttons.
 */
const NewsCard: React.FC<NewsCardProps> = ({ news, onView, onEdit, onDelete, highlightTerms }) => {
  const { t } = useTranslation();
  const imageUrl = news.image_url ? `${CLOUDINARY_HEADER_IMAGE_URL}/${news.image_url}` : null;
  const publishedDate = news.published_at ? format(new Date(news.published_at), "dd/MM/yyyy") : "-";
  const fallbackImage = "/assets/images/photo_error2.png";

  return (
    <Card
      className="glass-card hover-scale group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border-none p-0 transition-all duration-300 animate-in"
      onClick={() => onView(news.id)}
    >
      {/* 16/9 Image Section */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={news.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              if (e.currentTarget.src !== fallbackImage) {
                e.currentTarget.src = fallbackImage;
              }
            }}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center bg-gray-200 p-4 text-center">
            <ImageIcon className="mx-auto mb-3 size-10 text-gray-400" />
            <p className="text-sm text-gray-500">{t("news.no_image")}</p>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute left-4 top-4 z-10 duration-500 animate-in fade-in slide-in-from-top-2">
          <Badge className={`w-fit border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg ${news.status === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
            {news.status === 1 ? t("news.status_published") : t("news.status_draft")}
          </Badge>
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="size-10 rounded-full bg-white/20 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-white/40"
            onClick={(e) => { e.stopPropagation(); onEdit(news.id); }}
          >
            <Edit className="size-5" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="size-10 rounded-full bg-red-500/80 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-red-600"
            onClick={(e) => { e.stopPropagation(); onDelete(news.id); }}
          >
            <Trash2 className="size-5" />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-primary">
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            {publishedDate}
          </div>
          <div className="flex items-center gap-1">
            <User className="size-3" />
            {highlightText(news.user_name || "Admin", highlightTerms?.user_name || "")}
          </div>
        </div>

        <h3
          className="mb-3 line-clamp-2 text-xl font-black leading-tight text-slate-800 transition-colors group-hover:text-primary dark:text-slate-100"
          title={news.title}
        >
          {highlightText(news.title, highlightTerms?.title || "")}
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
          {news.summary || news.content?.replace(/<[^>]*>?/gm, '').slice(0, 150)}
        </p>
      </div>
    </Card>
  );
};

export default NewsCard;
