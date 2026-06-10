import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import type { BookingByStatus } from "@/dataHelper/dashboard.dataHelper";
import { Spinner } from "@/components/ui/spinner";

interface AdminBookingQualityCardsProps {
  breakdown: BookingByStatus[];
  isLoading?: boolean;
  onDrillDown: (status: number) => void;
}

const getCount = (breakdown: BookingByStatus[], status: number): number =>
  breakdown.find((item) => item.status === status)?.total ?? 0;

const AdminBookingQualityCards: React.FC<AdminBookingQualityCardsProps> = ({
  breakdown,
  isLoading = false,
  onDrillDown,
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="md" showText text={t("common.loading_data")} />
      </div>
    );
  }

  const total = breakdown.reduce((sum, item) => sum + item.total, 0);
  const cancelled = getCount(breakdown, 2);
  const completed = getCount(breakdown, 3);
  const pending = getCount(breakdown, 0);
  const pendingCancel = getCount(breakdown, 4);

  const cancelRate = total > 0 ? (cancelled / total) * 100 : 0;
  const completeRate = total > 0 ? (completed / total) * 100 : 0;

  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-500">
        {t("dashboard.no_chart_data", { defaultValue: "Không có dữ liệu trong khoảng thời gian này" })}
      </div>
    );
  }

  const rateCards = [
    {
      key: "cancel_rate",
      label: t("dashboard.quality_cancel_rate", { defaultValue: "Tỷ lệ hủy" }),
      value: `${cancelRate.toFixed(1)}%`,
      hint: t("dashboard.quality_cancel_hint", {
        count: cancelled,
        total,
      }),
      accent: "border-t-rose-500",
      valueClass: cancelRate >= 20 ? "text-rose-600" : "text-slate-900",
    },
    {
      key: "complete_rate",
      label: t("dashboard.quality_complete_rate", { defaultValue: "Tỷ lệ hoàn tất" }),
      value: `${completeRate.toFixed(1)}%`,
      hint: t("dashboard.quality_complete_hint", {
        count: completed,
      }),
      accent: "border-t-emerald-500",
      valueClass: "text-slate-900",
    },
  ];

  const actionCards = [
    {
      key: "pending",
      status: 0,
      label: t("dashboard.status_pending", { defaultValue: "Chờ duyệt" }),
      count: pending,
      accent: "border-t-amber-500",
      activeClass: "border-amber-200 bg-amber-50/60 hover:border-amber-300 hover:bg-amber-50",
    },
    {
      key: "pending_cancel",
      status: 4,
      label: t("dashboard.status_pending_cancel", { defaultValue: "Chờ hủy" }),
      count: pendingCancel,
      accent: "border-t-orange-500",
      activeClass: "border-orange-200 bg-orange-50/60 hover:border-orange-300 hover:bg-orange-50",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {rateCards.map((card) => (
          <div
            key={card.key}
            className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm border-t-2 ${card.accent}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.valueClass}`}>{card.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actionCards.map((card) => {
          const isActive = card.count > 0;
          const Wrapper = isActive ? "button" : "div";

          return (
            <Wrapper
              key={card.key}
              type={isActive ? "button" : undefined}
              onClick={isActive ? () => onDrillDown(card.status) : undefined}
              className={`rounded-xl border p-3 text-left shadow-sm border-t-2 ${card.accent} ${
                isActive ? card.activeClass : "border-slate-200 bg-slate-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
                {isActive && <ArrowRight className="size-3.5 shrink-0 text-slate-400" />}
              </div>
              <p className={`mt-1 text-2xl font-bold ${isActive ? "text-slate-900" : "text-slate-400"}`}>
                {card.count.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {isActive
                  ? t("dashboard.quality_action_hint", { defaultValue: "Click để xem danh sách" })
                  : t("dashboard.quality_no_action", { defaultValue: "Không có việc cần xử lý" })}
              </p>
            </Wrapper>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400">
        {t("dashboard.quality_footer", {
          defaultValue: "Tính theo ngày nhận phòng trong kỳ · {{total}} booking",
          total: total.toLocaleString(),
        })}
      </p>
    </div>
  );
};

export default AdminBookingQualityCards;
