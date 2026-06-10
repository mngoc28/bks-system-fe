import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { useBookingsPerMonthQuery } from "@/hooks/useDashboardQuery";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Button } from "@/components/ui/button";
import { getDashboardDateRange, setDashboardDateRange } from "@/utils/storage";
import { Spinner } from "@/components/ui/spinner";

/**
 * Bookings Per Month Chart
 * Visualizes the trends in booking volume over time with custom date range filtering.
 */
const BookingsPerMonthChart: React.FC = () => {
  const { t } = useTranslation();

  const savedDateRange = React.useMemo(() => getDashboardDateRange("BOOKINGS_PER_MONTH"), []);

  const [startDate, setStartDate] = React.useState<string>(savedDateRange.startDate || "");
  const [endDate, setEndDate] = React.useState<string>(savedDateRange.endDate || "");
  const [appliedStartDate, setAppliedStartDate] = React.useState<string | undefined>(savedDateRange.startDate);
  const [appliedEndDate, setAppliedEndDate] = React.useState<string | undefined>(savedDateRange.endDate);

  const { data, isLoading } = useBookingsPerMonthQuery(appliedStartDate, appliedEndDate);

  const bookingsPerMonth = data?.data?.bookingsPerMonth || [];

  const chartData = React.useMemo(
    () =>
      bookingsPerMonth.map((item) => ({
        month: item.month,
        total: item.total || 0,
      })),
    [bookingsPerMonth],
  );

  const handleApplyDateRange = () => {
    const newStartDate = startDate || undefined;
    const newEndDate = endDate || undefined;
    setAppliedStartDate(newStartDate);
    setAppliedEndDate(newEndDate);
    setDashboardDateRange("BOOKINGS_PER_MONTH", newStartDate, newEndDate);
  };

  const handleResetDateRange = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate(undefined);
    setAppliedEndDate(undefined);
    setDashboardDateRange("BOOKINGS_PER_MONTH", undefined, undefined);
  };

  return (
    <section className="space-y-4" aria-label="Bookings Per Month Chart">
      <div className="flex items-center justify-end">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <DatePickerField
              id="bookings-chart-start-date"
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
              id="bookings-chart-end-date"
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
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={60} />
                <Tooltip formatter={(value: any) => value.toLocaleString()} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#1e40af" strokeWidth={2} name={t("dashboard.bookings")} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-80 items-center justify-center text-slate-500">{t("common.no_data")}</div>
        )}
      </div>
    </section>
  );
};

export default BookingsPerMonthChart;
