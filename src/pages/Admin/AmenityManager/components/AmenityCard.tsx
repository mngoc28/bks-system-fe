import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Amenity } from "@/dataHelper/amenity.dataHelper";
import { Edit, Trash2, ShieldCheck, Clock, User2 } from "lucide-react";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { highlightText } from "@/utils/utils";

interface AmenityCardProps {
  amenity: Amenity;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isHighlighted?: boolean;
  searchTerm?: string;
}

/**
 * Amenity Card Component
 * Displays a single amenity's information with edit and delete actions.
 */
const AmenityCard: React.FC<AmenityCardProps> = ({ amenity, onEdit, onDelete, isHighlighted, searchTerm }) => {
  const { t } = useTranslation();

  return (
    <Card className={`glass-card hover-scale group relative flex h-full flex-col overflow-hidden rounded-2xl border-none p-6 transition-all duration-300 animate-in ${isHighlighted ? 'shadow-xl ring-2 ring-primary' : ''}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner dark:bg-primary/20">
          <ShieldCheck className="size-5" />
        </div>
        <Badge className="border-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
           #{amenity.id}
        </Badge>
      </div>

      <h3 className="mb-4 line-clamp-1 text-lg font-black text-slate-800 transition-colors group-hover:text-primary dark:text-slate-100" title={amenity.name}>
        {highlightText(amenity.name, searchTerm || "")}
      </h3>

      <div className="mb-6 flex-1 space-y-3 border-t border-slate-50 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-3 text-xs text-slate-400">
           <User2 className="size-3.5 text-primary" />
           <span className="truncate">{t("common.created_by")}: {amenity.created_by || "System"}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
           <Clock className="size-3.5 text-primary" />
           <span>{t("common.last_updated")}: {safeFormatDateTime(amenity.updated_at)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="h-9 rounded-lg border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-primary dark:border-slate-800"
          onClick={() => onEdit(amenity.id)}
        >
          <Edit className="mr-2 size-4" />
          {t("common.edit")}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="h-9 rounded-lg border-slate-100 text-slate-500 hover:border-red-100 hover:bg-red-50 hover:text-red-600 dark:border-slate-800"
          onClick={() => onDelete(amenity.id)}
        >
          <Trash2 className="mr-2 size-4" />
          {t("common.delete")}
        </Button>
      </div>
    </Card>
  );
};

export default AmenityCard;
