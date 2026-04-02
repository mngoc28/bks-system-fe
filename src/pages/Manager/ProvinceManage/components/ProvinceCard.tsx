import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Provinces } from "@/dataHelper/province.dataHelper";
import { MapPin, Building2, Home } from "lucide-react";

interface ProvinceCardProps {
  province: Provinces;
  onView: (id: number) => void;
}

const ProvinceCard: React.FC<ProvinceCardProps> = ({ province, onView }) => {
  const { t } = useTranslation();

  return (
    <Card
      className="glass-card hover-scale animate-in group relative overflow-hidden rounded-2xl border-none p-6 transition-all duration-300 h-full flex flex-col cursor-pointer"
      onClick={() => onView(province.id)}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner dark:bg-indigo-900/30">
          <MapPin className="size-5" />
        </div>
        <Badge className="bg-indigo-50 text-indigo-600 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          #{province.id}
        </Badge>
      </div>

      <h3 className="mb-1 text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
        {province.name}
      </h3>
      <p className="mb-6 text-xs font-bold text-slate-400 uppercase tracking-widest">{province.name_en}</p>

      <div className="mt-auto grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-50 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="size-3.5 text-cyan-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t("province.ward")}</span>
          </div>
          <p className="text-xl font-black text-slate-700 dark:text-slate-200">{province.ward_count}</p>
        </div>
        <div className="rounded-xl border border-slate-50 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
          <div className="flex items-center gap-2 mb-1">
            <Home className="size-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t("province.room")}</span>
          </div>
          <p className="text-xl font-black text-slate-700 dark:text-slate-200">{province.room_count}</p>
        </div>
      </div>
    </Card>
  );
};

export default ProvinceCard;
