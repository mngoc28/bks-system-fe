import React from "react";
import { useTranslation } from "react-i18next";
import { BedDouble, DoorOpen, LogIn, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type OperationsKpiType = "check_in" | "check_out" | "in_stay" | "occupancy";

export interface OperationsKpiGridProps {
  todayCheckIn: number;
  todayCheckOut: number;
  inStay: number;
  occupancyRate: number;
  todayLabel: string;
  onDrillDown: (type: OperationsKpiType) => void;
}

type KpiCard = {
  type: OperationsKpiType;
  titleKey: string;
  defaultTitle: string;
  value: string;
  subLabel: string;
  icon: LucideIcon;
  iconClass: string;
  accentClass: string;
  tooltipKey: string;
  defaultTooltip: string;
};

const OperationsKpiGrid: React.FC<OperationsKpiGridProps> = ({
  todayCheckIn,
  todayCheckOut,
  inStay,
  occupancyRate,
  todayLabel,
  onDrillDown,
}) => {
  const { t } = useTranslation();

  const cards: KpiCard[] = [
    {
      type: "check_in",
      titleKey: "dashboard.today_check_in",
      defaultTitle: "Check-in hôm nay",
      value: todayCheckIn.toLocaleString(),
      subLabel: todayLabel,
      icon: LogIn,
      iconClass: "bg-emerald-100 text-emerald-700",
      accentClass: "border-t-emerald-500",
      tooltipKey: "dashboard.kpi_check_in_hint",
      defaultTooltip: "Booking xác nhận có ngày nhận phòng hôm nay",
    },
    {
      type: "check_out",
      titleKey: "dashboard.today_check_out",
      defaultTitle: "Check-out hôm nay",
      value: todayCheckOut.toLocaleString(),
      subLabel: todayLabel,
      icon: LogOut,
      iconClass: "bg-amber-100 text-amber-700",
      accentClass: "border-t-amber-500",
      tooltipKey: "dashboard.kpi_check_out_hint",
      defaultTooltip: "Booking xác nhận có ngày trả phòng hôm nay",
    },
    {
      type: "in_stay",
      titleKey: "dashboard.in_stay",
      defaultTitle: "Đang lưu trú",
      value: inStay.toLocaleString(),
      subLabel: t("dashboard.in_stay_sub", { defaultValue: "Phòng có khách" }),
      icon: BedDouble,
      iconClass: "bg-violet-100 text-violet-700",
      accentClass: "border-t-violet-500",
      tooltipKey: "dashboard.kpi_in_stay_hint",
      defaultTooltip: "Booking đang ở trạng thái checked-in",
    },
    {
      type: "occupancy",
      titleKey: "dashboard.occupancy_rate",
      defaultTitle: "Lấp đầy hôm nay",
      value: `${occupancyRate.toFixed(1)}%`,
      subLabel: t("dashboard.occupancy_sub", { defaultValue: "Toàn hệ thống" }),
      icon: DoorOpen,
      iconClass: "bg-sky-100 text-sky-700",
      accentClass: "border-t-sky-500",
      tooltipKey: "dashboard.kpi_occupancy_hint",
      defaultTooltip: "Tỷ lệ phòng không trống so với tổng phòng vật lý",
    },
  ];

  return (
    <section aria-label={t("dashboard.operations_today", { defaultValue: "Vận hành hôm nay" })} className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {t("dashboard.operations_today", { defaultValue: "Vận hành hôm nay" })}
      </h2>
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const title = t(card.titleKey, { defaultValue: card.defaultTitle });
          const tooltip = t(card.tooltipKey, { defaultValue: card.defaultTooltip });

          return (
            <button
              key={card.type}
              type="button"
              title={tooltip}
              aria-label={`${title}: ${card.value}. ${t("dashboard.kpi_open_list", { defaultValue: "Mở danh sách liên quan" })}`}
              onClick={() => onDrillDown(card.type)}
              className={`admin-card group flex min-h-[132px] flex-col border-t-4 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 ${card.accentClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`rounded-lg p-2.5 ${card.iconClass}`}>
                  <card.icon className="size-5" aria-hidden />
                </div>
                <span className="max-w-[55%] truncate text-right text-xs font-medium text-slate-400">{card.subLabel}</span>
              </div>
              <div className="mt-auto pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
                <p className="mt-1 text-3xl font-bold leading-none text-slate-900">{card.value}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default OperationsKpiGrid;
