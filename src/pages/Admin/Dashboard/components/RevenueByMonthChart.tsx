import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { useRevenueByMonthQuery } from "@/hooks/useDashboardQuery";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Button } from "@/components/ui/button";
import { getDashboardDateRange, setDashboardDateRange } from "@/utils/storage";
import { Spinner } from "@/components/ui/spinner";

/**
 * Revenue By Month Chart
 * Tracks monthly revenue generated across the system with filtering.
 */
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
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <DatePickerField
              id="revenue-chart-start-date"
              label={t("dashboard.start_date")}
              labelClassName="text-[15px] font-normal text-slate-700"
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate || undefined}
              className="w-30 space-y-2 sm:w-45"
              triggerClassName="h-8 min-h-0 w-30 text-[13px] font-normal shadow-none hover:shadow-none sm:h-10 sm:w-45 sm:text-[15px]"
            />
            <span className="text-slate-500">-</span>
            <DatePickerField
              id="revenue-chart-end-date"
              label={t("dashboard.end_date")}
              labelClassName="text-[15px] font-normal text-slate-700"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate || undefined}
              className="w-30 space-y-2 sm:w-45"
              triggerClassName="h-8 min-h-0 w-30 text-[13px] font-normal shadow-none hover:shadow-none sm:h-10 sm:w-45 sm:text-[15px]"
            />
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
          <div className="flex h-80 items-center justify-center">
            <Spinner size="md" showText text={t("common.loading_data")} />
          </div>
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
