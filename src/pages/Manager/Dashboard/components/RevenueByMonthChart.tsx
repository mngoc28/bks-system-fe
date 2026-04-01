import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { useRevenueByMonthQuery } from "@/hooks/useDashboardQuery";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getDashboardDateRange, setDashboardDateRange } from "@/utils/storage";

const RevenueByMonthChart: React.FC = () => {
  const { t } = useTranslation();

  const savedDateRange = React.useMemo(() => getDashboardDateRange("REVENUE_BY_MONTH"), []);

  const [startDate, setStartDate] = React.useState<string>(savedDateRange.startDate || "");
  const [endDate, setEndDate] = React.useState<string>(savedDateRange.endDate || "");
  const [appliedStartDate, setAppliedStartDate] = React.useState<string | undefined>(savedDateRange.startDate);
  const [appliedEndDate, setAppliedEndDate] = React.useState<string | undefined>(savedDateRange.endDate);

  const { data, isLoading } = useRevenueByMonthQuery(appliedStartDate, appliedEndDate);

  const revenueByMonth = data?.data?.revenueByMonth || [];

  const chartData = React.useMemo(
    () =>
      revenueByMonth.map((item) => ({
        month: item.month,
        revenue: item.revenue || 0,
      })),
    [revenueByMonth],
  );

  const handleApplyDateRange = () => {
    const newStartDate = startDate || undefined;
    const newEndDate = endDate || undefined;
    setAppliedStartDate(newStartDate);
    setAppliedEndDate(newEndDate);
    setDashboardDateRange("REVENUE_BY_MONTH", newStartDate, newEndDate);
  };

  const handleResetDateRange = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate(undefined);
    setAppliedEndDate(undefined);
    setDashboardDateRange("REVENUE_BY_MONTH", undefined, undefined);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatYAxisTick = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} ${t("dashboard.units.billion")}`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} ${t("dashboard.units.million")}`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} ${t("dashboard.units.thousand")}`;
    }
    return value.toString();
  };

  return (
    <section className="space-y-4" aria-label="Revenue By Month Chart">
      <div className="flex items-center justify-end">
        <div className="flex flex-wrap items-end gap-2">
          <div className="gap-2flex flex flex-col items-center gap-2 sm:flex-row">
            <div className="flex flex-col">
              <div className="mb-2 text-[15px] text-slate-700">{t("dashboard.start_date")}</div>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-30 sm:w-45 h-8 text-[13px] sm:h-10 sm:text-[15px]" placeholder={t("dashboard.start_date")} />
            </div>
            <span className="text-slate-500">-</span>
            <div className="flex flex-col">
              <div className="mb-2 text-[15px] text-slate-700">{t("dashboard.start_date")}</div>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-30 sm:w-45 h-8 text-[13px] sm:h-10 sm:text-[15px]" placeholder={t("dashboard.end_date")} />
            </div>
          </div>
          <Button onClick={handleApplyDateRange} size="sm" variant="outline" className="h-8 bg-primary text-slate-100 hover:bg-primary-hover hover:text-zinc-100 sm:h-10">
            {t("common.apply")}
          </Button>
          {(appliedStartDate || appliedEndDate) && (
            <Button onClick={handleResetDateRange} size="sm" variant="ghost" className="h-8 bg-primary text-slate-100 hover:bg-primary-hover hover:text-zinc-100 sm:h-10">
              {t("common.reset")}
            </Button>
          )}
        </div>
      </div>
      <div className="min-w-0 rounded border border-slate-200 bg-white p-4">
        {isLoading ? (
          <div className="flex h-80 items-center justify-center">{t("common.loading")}</div>
        ) : chartData.length > 0 ? (
          <div className="h-80 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={formatYAxisTick} width={60} label={{ value: "VND", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} name={t("dashboard.revenue")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-80 items-center justify-center text-slate-500">{t("common.no_data")}</div>
        )}
      </div>
    </section>
  );
};

export default RevenueByMonthChart;
