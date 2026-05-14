import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { BookingByProperty } from "@/dataHelper/dashboard.dataHelper";

type BookingsByPropertyChartProps = {
  bookingsByProperty: BookingByProperty[];
};

/**
 * Bookings grouped by property — horizontal bar chart (top properties by booking volume).
 */
const BookingsByPropertyChart: React.FC<BookingsByPropertyChartProps> = ({ bookingsByProperty }) => {
  const { t } = useTranslation();

  const chartData = React.useMemo(
    () =>
      bookingsByProperty
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map((item) => {
          const label = item.property_name ?? "";
          return {
            name: label.length > 30 ? `${label.substring(0, 30)}...` : label,
            total: item.total || 0,
          };
        }),
    [bookingsByProperty],
  );

  return (
    <section className="space-y-4" aria-label={t("dashboard.bookings_by_property", { defaultValue: "Bookings by property" })}>
      <div className="min-w-0 rounded border border-slate-200 bg-white p-4">
        <div className="h-96 min-h-0 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: any) => value.toLocaleString()} />
              <Legend />
              <Bar dataKey="total" fill="#3B82F6" radius={[0, 6, 6, 0]} name={t("dashboard.bookings")} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default BookingsByPropertyChart;
