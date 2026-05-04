import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Service } from "@/dataHelper/service.dataHelper";
import { Edit, Trash2, LayoutGrid, CreditCard, Clock } from "lucide-react";
import { formatPrice } from "@/utils/utils";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { highlightText } from "@/utils/utils";

interface ServiceCardProps {
  service: Service;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  searchTerm?: string;
}

/**
 * Service Card
 * A visually engaging card used in the service management grid to display service summaries, pricing, and last-updated timestamps.
 */
const ServiceCard: React.FC<ServiceCardProps> = ({ service, onView, onEdit, onDelete, searchTerm }) => {
  const { t } = useTranslation();

  return (
    <Card
      className="glass-card hover-scale group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border-none p-6 transition-all duration-300 animate-in"
      onClick={() => onView(service.id)}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner dark:bg-indigo-900/30">
          <LayoutGrid className="size-5" />
        </div>
        <Badge className="border-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
          {t("services.status_active")}
        </Badge>
      </div>

      <h3
        className="mb-2 line-clamp-1 text-lg font-black text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100"
        title={service.name}
      >
        {highlightText(service.name, searchTerm || "")}
      </h3>

      <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
        <Clock className="size-3" />
        <span>{t("common.last_updated")}: {safeFormatDateTime(service.updated_at)}</span>
      </div>

      <p className="mb-6 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-400">
        {service.description || t("services.no_description")}
      </p>

      <div className="mb-6 flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("services.price")}</span>
        </div>
        <span className="text-lg font-black text-emerald-600">{formatPrice(service.price)}</span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800"
          onClick={(e) => { e.stopPropagation(); onEdit(service.id); }}
        >
          <Edit className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-slate-100 text-slate-500 hover:border-red-100 hover:bg-red-50 hover:text-red-600 dark:border-slate-800"
          onClick={(e) => { e.stopPropagation(); onDelete(service.id); }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ServiceCard;
