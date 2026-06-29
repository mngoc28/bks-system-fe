import React from "react";
import { useTranslation } from "react-i18next";
import { useAdminDashboardConsolidatedQuery } from "@/hooks/useDashboardQuery";
import { useCheckPermissionQuery } from "@/hooks/useAuthQuery";
import { useBookingsQuery } from "@/hooks/useBookingQuery";
import { PERMISSIONS, ROUTERS } from "@/constant";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OperationsKpiGrid, { type OperationsKpiType } from "./components/OperationsKpiGrid";
import AdminQuickActionPanel from "./components/AdminQuickActionPanel";
import AdminBookingSlaMonitor from "./components/AdminBookingSlaMonitor";
import AdminRevenuePerformanceCards from "./components/AdminRevenuePerformanceCards";
import AdminTopPropertiesList from "./components/AdminTopPropertiesList";
import AdminBookingQualityCards from "./components/AdminBookingQualityCards";

type DashboardNavParams = Record<string, string | number | undefined>;

/**
 * Dashboard Page V2
 * Action-first dashboard with KPI cards, work queue, and interactive charts that drill down to module filters.
 */
const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = React.useState<string>(thirtyDaysAgo.toISOString().slice(0, 10));
  const [endDate, setEndDate] = React.useState<string>(today.toISOString().slice(0, 10));
  const [showAnalytics, setShowAnalytics] = React.useState(true);
  const todayIso = today.toISOString().slice(0, 10);
  const todayLabel = `${t("dashboard.today_sub_prefix", { defaultValue: "Hôm nay" })} · ${today.toLocaleDateString("vi-VN")}`;

  const { data: dataCheckPermission, isLoading: isPermissionLoading } = useCheckPermissionQuery();
  const permission = dataCheckPermission?.data?.role;
  const isAdmin = permission === PERMISSIONS.ADMIN;

  const { data: consolidatedData, isLoading: isConsolidatedLoading } = useAdminDashboardConsolidatedQuery(
    startDate,
    endDate
  );

  const consolidated = consolidatedData?.data;

  const usersData = consolidated?.totalUsers ? { data: consolidated.totalUsers } : undefined;
  const partnersData = consolidated?.totalPartners ? { data: consolidated.totalPartners } : undefined;
  const roomsData = consolidated?.systemRoom ? { data: consolidated.systemRoom } : undefined;
  const adminStatsData = consolidated?.adminStats ? { data: consolidated.adminStats } : undefined;

  const bookingsByPropertyData = consolidated?.bookingsByProperty ? { data: consolidated.bookingsByProperty } : undefined;
  const bookingsTrendData = consolidated?.bookingsTrend ? { data: consolidated.bookingsTrend } : undefined;
  const settlementDailyReportData = consolidated?.settlementDailyReport ? { data: consolidated.settlementDailyReport } : undefined;
  const bookingStatusData = consolidated?.bookingStatus ? { data: consolidated.bookingStatus } : undefined;
  const occupancyChartData = consolidated?.occupancyChart ? { data: consolidated.occupancyChart } : undefined;
  const revenuePerformanceData = consolidated?.revenuePerformance ? { data: consolidated.revenuePerformance } : undefined;

  const isBookingsByPropertyLoading = isConsolidatedLoading;
  const isBookingsTrendLoading = isConsolidatedLoading;
  const isSettlementDailyReportLoading = isConsolidatedLoading;
  const isBookingStatusLoading = isConsolidatedLoading;
  const isOccupancyChartLoading = isConsolidatedLoading;
  const isRevenuePerformanceLoading = isConsolidatedLoading;
  const isAdminStatsLoading = isConsolidatedLoading;
  const { data: pendingBookingsData, isLoading: isPendingQueueLoading } = useBookingsQuery(
    { page: 1, per_page: 5, status: 0 },
    { staleTime: 60_000, refetchOnWindowFocus: false },
  );
  const users = usersData?.data;
  const partners = partnersData?.data;
  const rooms = roomsData?.data;
  const pendingBookings = pendingBookingsData?.data?.total ?? 0;
  const pendingBookingsQueue = pendingBookingsData?.data?.data ?? [];
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);

  const formatCompact = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return `${value}`;
  };

  const goToModule = React.useCallback(
    (pathname: string, params: DashboardNavParams = {}) => {
      const search = new URLSearchParams();
      Object.entries({ ...params, source: "dashboard" }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && `${value}` !== "") {
          search.set(key, String(value));
        }
      });
      navigate({ pathname, search: search.toString() });
    },
    [navigate],
  );

  const bookingsTrend = React.useMemo(
    () =>
      (bookingsTrendData?.data?.points ?? []).map((item: any) => ({
        date: new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
        rawDate: item.date,
        total: item.total ?? 0,
      })),
    [bookingsTrendData],
  );

  const revenueTrend = React.useMemo(
    () =>
      (settlementDailyReportData?.data ?? []).map((item: any) => ({
        date: item.date ? new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) : "",
        total_gmv: item.total_gmv ?? 0,
        total_commission: item.total_commission ?? 0,
      })),
    [settlementDailyReportData],
  );

  const totalGmv = React.useMemo(() => revenueTrend.reduce((sum: number, row: any) => sum + row.total_gmv, 0), [revenueTrend]);
  const totalCommission = React.useMemo(() => revenueTrend.reduce((sum: number, row: any) => sum + row.total_commission, 0), [revenueTrend]);

  const topProperties = React.useMemo(
    () =>
      (bookingsByPropertyData?.data ?? [])
        .slice()
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 8),
    [bookingsByPropertyData],
  );

  const analyticsDateLabel = React.useMemo(() => {
    const from = new Date(startDate).toLocaleDateString("vi-VN");
    const to = new Date(endDate).toLocaleDateString("vi-VN");
    return `${from} – ${to}`;
  }, [startDate, endDate]);

  const occupancyTrend = React.useMemo(
    () =>
      (occupancyChartData?.data?.points ?? []).map((item: any) => ({
        date: new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
        occupancyRate: item.occupancyRate,
        rawDate: item.date,
      })),
    [occupancyChartData],
  );

  const adminStats = adminStatsData?.data;
  const occupancyRate = adminStats?.occupancyRate ?? 0;
  const todayCheckInCount = adminStats?.todayCheckInCount ?? 0;
  const todayCheckOutCount = adminStats?.todayCheckOutCount ?? 0;
  const inStayCount = adminStats?.inStayCount ?? 0;

  const handleOperationsDrillDown = React.useCallback(
    (type: OperationsKpiType) => {
      switch (type) {
        case "check_in":
          goToModule(ROUTERS.BOOKING_MANAGE, {
            status: 1,
            stay_status: "pending",
            start_date: todayIso,
            start_date_mode: "exact",
            page: 1,
          });
          break;
        case "check_out":
          goToModule(ROUTERS.BOOKING_MANAGE, {
            status: 1,
            stay_status: "checked_in",
            end_date: todayIso,
            end_date_mode: "exact",
            page: 1,
          });
          break;
        case "in_stay":
          goToModule(ROUTERS.BOOKING_MANAGE, { stay_status: "checked_in", page: 1 });
          break;
        case "occupancy":
          goToModule(ROUTERS.ROOMS, { page: 1 });
          break;
        default:
          break;
      }
    },
    [goToModule, todayIso],
  );

  if (isPermissionLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" showText text={t("common.checking_permission", { defaultValue: "Đang kiểm tra quyền truy cập..." })} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-600">
          {t("common.no_permission", { defaultValue: "Bạn không có quyền truy cập dashboard này." })}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-8 pb-6">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-amber-50/40 to-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t("dashboard.overview", { defaultValue: "Tổng quan vận hành" })}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{t("dashboard.dashboard", { defaultValue: "Dashboard điều hành" })}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {t("dashboard.description", { defaultValue: "Theo dõi KPI và xử lý nhanh các module cần ưu tiên." })}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <DatePickerField
              id="dashboard-start-date"
              label={t("dashboard.start_date", { defaultValue: "Từ ngày" })}
              labelClassName="text-xs font-semibold text-slate-500"
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate || undefined}
              className="w-40 space-y-1"
              triggerClassName="h-9 min-h-0 w-40 border border-slate-200 rounded-md px-3 text-sm font-normal shadow-none hover:shadow-none"
            />
            <DatePickerField
              id="dashboard-end-date"
              label={t("dashboard.end_date", { defaultValue: "Đến ngày" })}
              labelClassName="text-xs font-semibold text-slate-500"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate || undefined}
              className="w-40 space-y-1"
              triggerClassName="h-9 min-h-0 w-40 border border-slate-200 rounded-md px-3 text-sm font-normal shadow-none hover:shadow-none"
            />
            <Button
              variant="outline"
              className="h-9"
              onClick={() => {
                const now = new Date();
                const from = new Date(now);
                from.setDate(now.getDate() - 30);
                setStartDate(from.toISOString().slice(0, 10));
                setEndDate(now.toISOString().slice(0, 10));
              }}
            >
              {t("common.reset", { defaultValue: "Đặt lại" })}
            </Button>
          </div>
        </div>
      </section>

      {isAdminStatsLoading ? (
        <section className="space-y-3">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="admin-card h-[132px] animate-pulse bg-slate-100" />
            ))}
          </div>
        </section>
      ) : (
        <OperationsKpiGrid
          todayCheckIn={todayCheckInCount}
          todayCheckOut={todayCheckOutCount}
          inStay={inStayCount}
          occupancyRate={occupancyRate}
          todayLabel={todayLabel}
          onDrillDown={handleOperationsDrillDown}
        />
      )}

      <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
        {t("dashboard.alert_summary", {
          defaultValue: "{{partner}} đối tác chờ duyệt · {{user}} user chờ kích hoạt · {{booking}} booking chờ partner",
          partner: partners?.partnerPending ?? 0,
          user: users?.userPending ?? 0,
          booking: pendingBookings,
        })}
      </div>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AdminQuickActionPanel
          onViewAllPartners={() => navigate(ROUTERS.PARTNER_APPROVAL)}
          onViewAllPendingUsers={() => goToModule(ROUTERS.USER_MANAGEMENT, { status: 0, page: 1 })}
          onViewAllBlockedUsers={() => goToModule(ROUTERS.USER_MANAGEMENT, { status: 2, page: 1 })}
        />
        <AdminBookingSlaMonitor
          bookings={pendingBookingsQueue}
          total={pendingBookings}
          isLoading={isPendingQueueLoading}
          onAudit={() => goToModule(ROUTERS.BOOKING_MANAGE, { status: 0, page: 1 })}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-left"
          onClick={() => setShowAnalytics((prev) => !prev)}
        >
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
            {t("dashboard.analytics_section", { defaultValue: "Phân tích & Báo cáo" })}
          </h2>
          {showAnalytics ? <ChevronDown className="size-5 text-slate-500" /> : <ChevronRight className="size-5 text-slate-500" />}
        </button>
        {showAnalytics && (
          <div className="space-y-5 border-t border-slate-100 p-4">
            <p className="text-xs text-slate-500">
              {t("dashboard.analytics_date_hint", {
                defaultValue: "Khoảng thời gian: {{range}} · Click biểu đồ để mở danh sách đã lọc",
                range: analyticsDateLabel,
              })}
            </p>

            <AdminRevenuePerformanceCards
              data={revenuePerformanceData?.data}
              isLoading={isRevenuePerformanceLoading}
            />

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                    {t("dashboard.bookings_trend", { defaultValue: "Xu hướng booking theo ngày" })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToModule(ROUTERS.BOOKING_MANAGE, { start_date: startDate, end_date: endDate, page: 1 })}
                  >
                    {t("common.view_more", { defaultValue: "Xem danh sách" })}
                  </Button>
                </div>
                <p className="mb-3 text-xs text-slate-500">
                  {t("dashboard.bookings_trend_hint", {
                    defaultValue: "Số booking nhận phòng mỗi ngày trong khoảng đã chọn (ngày không có = 0).",
                  })}
                </p>
                {isBookingsTrendLoading ? (
                  <div className="flex h-72 items-center justify-center">
                    <Spinner size="md" showText text={t("common.loading_data")} />
                  </div>
                ) : bookingsTrend.length === 0 ? (
                  <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                    {t("dashboard.no_chart_data", { defaultValue: "Không có dữ liệu trong khoảng thời gian này" })}
                  </div>
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bookingsTrend} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip
                          labelFormatter={(_, payload) => {
                            const raw = payload?.[0]?.payload?.rawDate;
                            return raw ? new Date(raw).toLocaleDateString("vi-VN") : "";
                          }}
                        />
                        <Bar
                          dataKey="total"
                          fill="#0f766e"
                          radius={[4, 4, 0, 0]}
                          cursor="pointer"
                          onClick={(data) => {
                            const rawDate = (data as { payload?: { rawDate?: string } })?.payload?.rawDate;
                            if (!rawDate) return;
                            goToModule(ROUTERS.BOOKING_MANAGE, {
                              start_date: rawDate,
                              start_date_mode: "exact",
                              page: 1,
                            });
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                  {t("dashboard.booking_quality_title", { defaultValue: "Chỉ số chất lượng booking" })}
                </h3>
                <p className="mb-3 mt-1 text-xs text-slate-500">
                  {t("dashboard.booking_quality_hint", {
                    defaultValue: "Tỷ lệ hủy/hoàn tất và booking cần xử lý trong kỳ.",
                  })}
                </p>
                <AdminBookingQualityCards
                  breakdown={bookingStatusData?.data?.breakdown ?? []}
                  isLoading={isBookingStatusLoading}
                  onDrillDown={(status) =>
                    goToModule(ROUTERS.BOOKING_MANAGE, {
                      status,
                      start_date: startDate,
                      end_date: endDate,
                      page: 1,
                    })
                  }
                />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                    {t("dashboard.revenue_reconciliation_trend", { defaultValue: "Xu hướng Doanh thu & Phí dịch vụ" })}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate(ROUTERS.PARTNER_SETTLEMENTS)}>
                    {t("dashboard.view_settlements", { defaultValue: "Đối soát" })}
                  </Button>
                </div>
                <p className="mb-2 text-xs text-slate-500">
                  {t("dashboard.revenue_hint", { defaultValue: "GMV và phí hoa hồng từ báo cáo đối soát theo ngày." })}
                </p>
                <div className="mb-3 text-xs font-semibold text-slate-700">
                  <span className="mr-3 text-sky-600">GMV: {formatCurrency(totalGmv)}</span>
                  <span className="text-emerald-600">Phí dịch vụ: {formatCurrency(totalCommission)}</span>
                </div>
                {isSettlementDailyReportLoading ? (
                  <div className="flex h-72 items-center justify-center">
                    <Spinner size="md" showText text={t("common.loading_data")} />
                  </div>
                ) : revenueTrend.length === 0 ? (
                  <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                    {t("dashboard.no_chart_data", { defaultValue: "Không có dữ liệu trong khoảng thời gian này" })}
                  </div>
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={revenueTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(value) => formatCompact(Number(value))} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(value) => formatCompact(Number(value))} />
                        <Tooltip formatter={(value, name) => [formatCurrency(Number(value ?? 0)), String(name ?? "")]} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="total_gmv" name="Tổng GMV hệ thống" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="total_commission" name="Phí hoa hồng (5%)" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                  {t("dashboard.occupancy_trend", { defaultValue: "Xu hướng lấp phòng" })}
                </h3>
                <p className="mb-3 mt-1 text-xs text-slate-500">
                  {t("dashboard.occupancy_trend_hint", {
                    defaultValue: "Tỷ lệ phòng có booking xác nhận/hoàn tất theo ngày · {{rooms}} phòng vật lý.",
                    rooms: (occupancyChartData?.data?.totalRooms ?? rooms?.totalRooms ?? 0).toLocaleString(),
                  })}
                </p>
                {isOccupancyChartLoading ? (
                  <div className="flex h-72 items-center justify-center">
                    <Spinner size="md" showText text={t("common.loading_data")} />
                  </div>
                ) : occupancyTrend.length === 0 ? (
                  <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                    {t("dashboard.no_chart_data", { defaultValue: "Không có dữ liệu trong khoảng thời gian này" })}
                  </div>
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={occupancyTrend} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`, t("dashboard.occupancy_rate", { defaultValue: "Lấp đầy" })]} />
                        <Area type="monotone" dataKey="occupancyRate" stroke="#7c3aed" fill="url(#occupancyGradient)" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                  {t("dashboard.bookings_by_property", { defaultValue: "Top cơ sở theo booking" })}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate(ROUTERS.PROPERTIES)}>
                  {t("common.view_more", { defaultValue: "Xem thêm" })}
                </Button>
              </div>
              <p className="mb-3 text-xs text-slate-500">
                {t("dashboard.bookings_by_property_hint", {
                  defaultValue: "Xếp hạng theo số booking nhận phòng · kèm đối tác và tỉnh/thành để nhận diện.",
                })}
              </p>
              {isBookingsByPropertyLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <Spinner size="md" showText text={t("common.loading_data")} />
                </div>
              ) : topProperties.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                  {t("dashboard.no_chart_data", { defaultValue: "Không có dữ liệu trong khoảng thời gian này" })}
                </div>
              ) : (
                <AdminTopPropertiesList
                  items={topProperties}
                  onSelect={(propertyId) => navigate(`${ROUTERS.PROPERTIES_DETAIL}/${propertyId}`)}
                />
              )}
            </section>

            <p className="text-xs text-slate-500">
              {t("dashboard.quick_links_hint", {
                defaultValue: "Click điểm trên biểu đồ để mở module tương ứng với bộ lọc đã áp dụng.",
              })}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;

