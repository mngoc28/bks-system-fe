import React from "react";
import { useTranslation } from "react-i18next";
import { useBookingsByBuildingQuery } from "@/hooks/useDashboardQuery";
import BookingsPerMonthChart from "./components/BookingsPerMonthChart";
import RevenueByMonthChart from "./components/RevenueByMonthChart";
import BookingsByBuildingChart from "./components/BookingsByBuildingChart";
import { PartnerViewCards, RoomViewCards, UserViewCards } from "./components";
import { useCheckPermissionQuery } from "@/hooks/useAuthQuery";
import { PERMISSIONS } from "@/constant";
import { Spinner } from "@/components/ui/spinner";

type ChartType = "bookingsPerMonth" | "revenueByMonth" | "bookingsByBuilding";

/**
 * Dashboard Page
 * Provides a high-level overview of system metrics (users, partners, rooms) and various analytical charts.
 */
const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [selectedChart, setSelectedChart] = React.useState<ChartType | null>(null);

  const { data: dataCheckPermission } = useCheckPermissionQuery();
  const permission = dataCheckPermission?.data?.role;
  const { data: bookingsByBuildingData, isLoading: isBookingsByBuildingLoading } = useBookingsByBuildingQuery();

  React.useEffect(() => {
    if (!selectedChart) {
      setSelectedChart("bookingsPerMonth");
    }
  }, [selectedChart]);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t("dashboard.overview")}</p>
      </div>
      {permission === PERMISSIONS.ADMIN && <UserViewCards />}

      {permission === PERMISSIONS.ADMIN && <PartnerViewCards />}

      {(permission === PERMISSIONS.ADMIN || permission === PERMISSIONS.PARTNER) && <RoomViewCards />}

      {/* Charts Section with Tabs */}
      {permission === PERMISSIONS.ADMIN && (
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t("dashboard.charts")}</p>
          </div>

          {/* Chart Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200">
            <button
              onClick={() => setSelectedChart("bookingsPerMonth")}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${selectedChart === "bookingsPerMonth" ? "border-b-2 border-primary text-primary" : "text-slate-600 hover:text-slate-900"}`}
            >
              {t("dashboard.bookings_per_month")}
            </button>
            <button
              onClick={() => setSelectedChart("revenueByMonth")}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${selectedChart === "revenueByMonth" ? "border-b-2 border-primary text-primary" : "text-slate-600 hover:text-slate-900"}`}
            >
              {t("dashboard.revenue_by_month")}
            </button>
            {bookingsByBuildingData?.data && bookingsByBuildingData.data.length > 0 && (
              <button
                onClick={() => setSelectedChart("bookingsByBuilding")}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${selectedChart === "bookingsByBuilding" ? "border-b-2 border-primary text-primary" : "text-slate-600 hover:text-slate-900"}`}
              >
                {t("dashboard.bookings_by_building")}
              </button>
            )}
          </div>

          {/* Selected Chart - Center with Animation */}
          {selectedChart && (
            <div className="transition-all duration-500 ease-in-out">
              <div key={selectedChart} className="animate-[fadeIn_0.5s_ease-in-out]">
                {selectedChart === "bookingsPerMonth" && <BookingsPerMonthChart />}
                {selectedChart === "revenueByMonth" && <RevenueByMonthChart />}
                {selectedChart === "bookingsByBuilding" && (
                  <>
                    {isBookingsByBuildingLoading ? (
                      <div className="flex min-h-[150px] items-center justify-center p-8">
                        <Spinner size="md" showText text={t("common.loading_data")} />
                      </div>
                    ) : bookingsByBuildingData?.data && bookingsByBuildingData.data.length > 0 ? (
                      <BookingsByBuildingChart bookingsByBuilding={bookingsByBuildingData.data} />
                    ) : null}
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
