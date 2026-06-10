import React from "react";
import { useTranslation } from "react-i18next";
import type { BookingByProperty } from "@/dataHelper/dashboard.dataHelper";

interface AdminTopPropertiesListProps {
  items: BookingByProperty[];
  onSelect: (propertyId: number) => void;
}

const AdminTopPropertiesList: React.FC<AdminTopPropertiesListProps> = ({ items, onSelect }) => {
  const { t } = useTranslation();
  const maxTotal = items[0]?.total ?? 1;

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const context = [item.partner_name, item.province_name].filter(Boolean).join(" · ");
        const widthPercent = maxTotal > 0 ? Math.max(8, (item.total / maxTotal) * 100) : 0;

        return (
          <button
            key={item.property_id}
            type="button"
            onClick={() => onSelect(item.property_id)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-left transition-colors hover:border-slate-300 hover:bg-slate-100"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900" title={item.property_name}>
                    {item.property_name}
                  </p>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-800">
                    {item.total.toLocaleString()}
                  </span>
                </div>
                {context && (
                  <p className="mt-0.5 truncate text-xs text-slate-500" title={context}>
                    {context}
                  </p>
                )}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${widthPercent}%` }} />
                </div>
              </div>
            </div>
          </button>
        );
      })}
      <p className="pt-1 text-[11px] text-slate-400">
        {t("dashboard.top_properties_footer", {
          defaultValue: "Click dòng để xem chi tiết cơ sở · kèm đối tác và khu vực để nhận diện.",
        })}
      </p>
    </div>
  );
};

export default AdminTopPropertiesList;
