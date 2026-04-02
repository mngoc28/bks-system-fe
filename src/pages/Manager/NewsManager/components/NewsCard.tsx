import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { News } from "@/dataHelper/news.dataHelper";
import { Edit, Trash2, Calendar, User } from "lucide-react";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { format } from "date-fns";

interface NewsCardProps {
  news: News;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const imageUrl = news.image_url ? `${CLOUDINARY_HEADER_IMAGE_URL}/${news.image_url}` : null;
  const publishedDate = news.published_at ? format(new Date(news.published_at), "dd/MM/yyyy") : "-";

  return (
    <Card
      className="glass-card hover-scale animate-in group relative overflow-hidden rounded-2xl border-none p-0 transition-all duration-300 h-full flex flex-col cursor-pointer"
      onClick={() => onView(news.id)}
    >
      {/* 16/9 Image Section */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={imageUrl || "/assets/images/photo_error2.png"}
          alt={news.title}
          className={`h-full w-full transition-transform duration-500 group-hover:scale-110 ${imageUrl ? 'object-cover' : 'object-contain bg-white p-4'}`}
          onError={(e) => { 
            e.currentTarget.src = "/assets/images/photo_error2.png"; 
            e.currentTarget.className = e.currentTarget.className.replace('object-cover', 'object-contain') + ' bg-white p-4';
            e.currentTarget.parentElement?.classList.add('bg-white');
          }}
        />

        {/* Status Badge */}
        <div className="absolute left-4 top-4">
          <Badge className={`border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg ${news.status === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
            {news.status === 1 ? t("news.status_published") : t("news.status_draft")}
          </Badge>
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/40 hover:scale-110 transition-transform"
            onClick={(e) => { e.stopPropagation(); onEdit(news.id); }}
          >
            <Edit className="size-5" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-10 w-10 rounded-full bg-red-500/80 text-white backdrop-blur-md hover:bg-red-600 hover:scale-110 transition-transform"
            onClick={(e) => { e.stopPropagation(); onDelete(news.id); }}
          >
            <Trash2 className="size-5" />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            {publishedDate}
          </div>
          <div className="flex items-center gap-1">
            <User className="size-3" />
            {news.user_name || "Admin"}
          </div>
        </div>

        <h3
          className="mb-3 line-clamp-2 text-xl font-black leading-tight text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors"
          title={news.title}
        >
          {news.title}
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
          {news.summary || news.content?.replace(/<[^>]*>?/gm, '').slice(0, 150)}
        </p>
      </div>
    </Card>
  );
};

export default NewsCard;
