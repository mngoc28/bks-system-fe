import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Amenity } from "@/dataHelper/amenity.dataHelper";
import { Edit, Trash2, ShieldCheck, Clock, User2 } from "lucide-react";
import { safeFormatDateTime } from "@/utils/dateUtils";

interface AmenityCardProps {
  amenity: Amenity;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isHighlighted?: boolean;
}

const AmenityCard: React.FC<AmenityCardProps> = ({ amenity, onEdit, onDelete, isHighlighted }) => {
  const { t } = useTranslation();

  return (
    <Card className={`glass-card hover-scale animate-in group relative overflow-hidden rounded-2xl border-none p-6 transition-all duration-300 h-full flex flex-col ${isHighlighted ? 'ring-2 ring-indigo-500 shadow-xl' : ''}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner dark:bg-indigo-900/30">
          <ShieldCheck className="size-5" />
        </div>
        <Badge className="bg-emerald-50 text-emerald-600 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
           #{amenity.id}
        </Badge>
      </div>

      <h3 className="mb-4 line-clamp-1 text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors" title={amenity.name}>
        {amenity.name}
      </h3>

      <div className="mb-6 space-y-3 flex-1 border-t border-slate-50 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-3 text-xs text-slate-400">
           <User2 className="size-3.5 text-indigo-500" />
           <span className="truncate">{t("common.created_by")}: {amenity.created_by || "System"}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
           <Clock className="size-3.5 text-indigo-500" />
           <span>{t("common.updated")}: {safeFormatDateTime(amenity.updated_at)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="h-9 rounded-lg border-slate-100 hover:bg-slate-50 hover:text-indigo-600 text-slate-500 dark:border-slate-800"
          onClick={() => onEdit(amenity.id)}
        >
          <Edit className="size-4 mr-2" />
          {t("common.edit")}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="h-9 rounded-lg border-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-500 dark:border-slate-800"
          onClick={() => onDelete(amenity.id)}
        >
          <Trash2 className="size-4 mr-2" />
          {t("common.delete")}
        </Button>
      </div>
    </Card>
  );
};

export default AmenityCard;
