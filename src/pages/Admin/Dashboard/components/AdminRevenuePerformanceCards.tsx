import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { AdminRevenuePerformanceResponse } from "@/dataHelper/dashboard.dataHelper";
import { Spinner } from "@/components/ui/spinner";

interface AdminRevenuePerformanceCardsProps {
  data?: AdminRevenuePerformanceResponse;
  isLoading?: boolean;
}

type MetricCard = {
  key: keyof AdminRevenuePerformanceResponse["change"];
  label: string;
  value: string;
  change: number | null | undefined;
  hint?: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const ChangeBadge: React.FC<{ change: number | null | undefined }> = ({ change }) => {
  if (change === null || change === undefined) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
        <Minus className="size-3" /> —
      </span>
    );
  }

  if (change === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
        <Minus className="size-3" /> 0%
      </span>
    );
  }

  const positive = change > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}
    >
      {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(change).toFixed(1)}%
    </span>
  );
};

const AdminRevenuePerformanceCards: React.FC<AdminRevenuePerformanceCardsProps> = ({ data, isLoading = false }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex h-36 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Spinner size="md" showText text={t("common.loading_data")} />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const previousLabel = `${new Date(data.previousPeriod.startDate).toLocaleDateString("vi-VN")} – ${new Date(
    data.previousPeriod.endDate,
  ).toLocaleDateString("vi-VN")}`;

  const cards: MetricCard[] = [
    {
      key: "adr",
      label: t("dashboard.metric_adr", { defaultValue: "ADR" }),
      value: formatCurrency(data.current.adr),
      change: data.change.adr,
      hint: t("dashboard.metric_adr_hint", { defaultValue: "Giá phòng trung bình / đêm đã bán" }),
    },
    {
      key: "revpar",
      label: t("dashboard.metric_revpar", { defaultValue: "RevPAR" }),
      value: formatCurrency(data.current.revpar),
      change: data.change.revpar,
      hint: t("dashboard.metric_revpar_hint", { defaultValue: "Doanh thu / phòng khả dụng / đêm" }),
    },
    {
      key: "occupancy_rate",
      label: t("dashboard.metric_occupancy", { defaultValue: "Lấp phòng" }),
      value: formatPercent(data.current.occupancy_rate),
      change: data.change.occupancy_rate,
      hint: t("dashboard.metric_occupancy_hint", {
        defaultValue: "{{nights}} đêm bán / {{capacity}} đêm khả dụng",
        nights: data.current.nights_sold.toLocaleString(),
        capacity: data.current.capacity.toLocaleString(),
      }),
    },
    {
      key: "total_revenue",
      label: t("dashboard.metric_total_revenue", { defaultValue: "Tổng doanh thu" }),
      value: formatCurrency(data.current.total_revenue),
      change: data.change.total_revenue,
      hint: t("dashboard.metric_revenue_hint", {
        count: data.current.booking_count,
      }),
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
            {t("dashboard.revenue_performance_title", { defaultValue: "Hiệu suất doanh thu" })}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {t("dashboard.period_compare_hint", {
              defaultValue: "So với kỳ trước ({{range}}) — cùng độ dài kỳ hiện tại",
              range: previousLabel,
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" title={card.hint}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
              <ChangeBadge change={card.change} />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminRevenuePerformanceCards;
