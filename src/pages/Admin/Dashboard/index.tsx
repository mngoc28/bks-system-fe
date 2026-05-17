import React from "react";
import { useTranslation } from "react-i18next";
import {
  useBookingsByPropertyQuery,
  useBookingsPerMonthQuery,
  useRevenueByMonthQuery,
  useSystemRoom,
  useTotalPartner,
  useTotalUser,
} from "@/hooks/useDashboardQuery";
import { useCheckPermissionQuery } from "@/hooks/useAuthQuery";
import { useBookingsQuery } from "@/hooks/useBookingQuery";
import { PERMISSIONS, ROUTERS } from "@/constant";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { ArrowRight, Building2, CalendarClock, ShieldAlert, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const { data: dataCheckPermission, isLoading: isPermissionLoading } = useCheckPermissionQuery();
  const permission = dataCheckPermission?.data?.role;
  const isAdmin = permission === PERMISSIONS.ADMIN;

  const { data: usersData } = useTotalUser();
  const { data: partnersData } = useTotalPartner();
  const { data: roomsData } = useSystemRoom();
  const { data: bookingsByPropertyData, isLoading: isBookingsByPropertyLoading } = useBookingsByPropertyQuery();
  const { data: bookingsPerMonthData, isLoading: isBookingsPerMonthLoading } = useBookingsPerMonthQuery(startDate, endDate);
  const { data: revenueByMonthData, isLoading: isRevenueByMonthLoading } = useRevenueByMonthQuery(startDate, endDate);
  const { data: pendingBookingsData } = useBookingsQuery({ page: 1, per_page: 1, status: 0 });
  const { data: totalBookingsData } = useBookingsQuery({ page: 1, per_page: 1 });



  const users = usersData?.data;
  const partners = partnersData?.data;
  const rooms = roomsData?.data;
  const pendingBookings = pendingBookingsData?.data?.total ?? 0;
  const totalBookings = totalBookingsData?.data?.total ?? 0;

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

  const getMonthRange = (monthText: string) => {
    const yyyyMm = monthText.match(/^(\d{4})-(\d{1,2})$/);
    if (yyyyMm) {
      const year = Number(yyyyMm[1]);
      const month = Number(yyyyMm[2]);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
      };
    }

    const mmYyyy = monthText.match(/^(\d{1,2})\/(\d{4})$/);
    if (mmYyyy) {
      const month = Number(mmYyyy[1]);
      const year = Number(mmYyyy[2]);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
      };
    }

    return null;
  };

  const bookingsTrend = React.useMemo(
    () =>
      (bookingsPerMonthData?.data?.bookingsPerMonth ?? []).map((item) => ({
        month: item.month,
        total: item.total ?? 0,
      })),
    [bookingsPerMonthData],
  );

  const revenueTrend = React.useMemo(
    () =>
      (revenueByMonthData?.data?.revenueByMonth ?? []).map((item) => ({
        month: item.month,
        revenue: item.revenue ?? 0,
      })),
    [revenueByMonthData],
  );

  const revenueComposedData = React.useMemo(
    () =>
      revenueTrend.map((item, index, arr) => {
        const from = Math.max(0, index - 2);
        const slice = arr.slice(from, index + 1);
        const avg = slice.reduce((sum, row) => sum + row.revenue, 0) / (slice.length || 1);
        return {
          ...item,
          avg,
        };
      }),
    [revenueTrend],
  );

  const propertyTrend = React.useMemo(
    () =>
      (bookingsByPropertyData?.data ?? [])
        .slice()
        .sort((a, b) => b.total - a.total)
        .slice(0, 8)
        .map((item) => {
          const label = item.property_name ?? "";
          return {
            property_id: item.property_id,
            property_name: label,
            name: label.length > 24 ? `${label.slice(0, 24)}...` : label,
            total: item.total,
          };
        }),
    [bookingsByPropertyData],
  );

  const overviewHealthData = React.useMemo(() => {
    const userTotal = users?.totalUsers ?? 0;
    const userAttention = (users?.userPending ?? 0) + (users?.userBlock ?? 0);

    const partnerTotal = partners?.totalPartners ?? 0;
    const partnerAttention = (partners?.partnerPending ?? 0) + (partners?.partnerBlock ?? 0);

    const roomTotal = rooms?.totalRooms ?? 0;
    const roomAttention = Math.max(0, roomTotal - (rooms?.totalAvailableRooms ?? 0));

    const bookingTotal = totalBookings;
    const bookingAttention = pendingBookings;

    const rows = [
      { metric: "User", total: userTotal, attention: userAttention },
      { metric: "Partner", total: partnerTotal, attention: partnerAttention },
      { metric: "Phòng", total: roomTotal, attention: roomAttention },
      { metric: "Booking", total: bookingTotal, attention: bookingAttention },
    ];

    return rows.map((row) => ({
      ...row,
      stable: Math.max(0, row.total - row.attention),
      attentionRate: row.total > 0 ? Number(((row.attention / row.total) * 100).toFixed(1)) : 0,
    }));
  }, [users, partners, rooms, totalBookings, pendingBookings]);

  const actionCards = [
    {
      title: t("dashboard.partner_pending", { defaultValue: "Partner đang chờ" }),
      value: partners?.partnerPending ?? 0,
      icon: UserCheck,
      className: "border-amber-200 bg-amber-50/70",
      onClick: () => goToModule(ROUTERS.PARTNER_MANAGEMENT, { status: 0, page: 1 }),
    },
    {
      title: t("dashboard.partner_block", { defaultValue: "Partner bị khóa" }),
      value: partners?.partnerBlock ?? 0,
      icon: ShieldAlert,
      className: "border-rose-200 bg-rose-50/70",
      onClick: () => goToModule(ROUTERS.PARTNER_MANAGEMENT, { status: 2, page: 1 }),
    },
    {
      title: t("dashboard.user_pending", { defaultValue: "User đang chờ" }),
      value: users?.userPending ?? 0,
      icon: UserCheck,
      className: "border-sky-200 bg-sky-50/70",
      onClick: () => goToModule(ROUTERS.USER_MANAGEMENT, { status: 0, page: 1 }),
    },
    {
      title: t("dashboard.user_block", { defaultValue: "User bị khóa" }),
      value: users?.userBlock ?? 0,
      icon: UserX,
      className: "border-fuchsia-200 bg-fuchsia-50/70",
      onClick: () => goToModule(ROUTERS.USER_MANAGEMENT, { status: 2, page: 1 }),
    },
    {
      title: t("dashboard.pending_bookings", { defaultValue: "Booking chờ duyệt" }),
      value: pendingBookings,
      icon: CalendarClock,
      className: "border-orange-200 bg-orange-50/70",
      onClick: () => goToModule(ROUTERS.BOOKING_MANAGE, { status: 0, page: 1 }),
    },
    {
      title: t("dashboard.total_available_rooms", { defaultValue: "Phòng đang trống" }),
      value: rooms?.totalAvailableRooms ?? 0,
      icon: Building2,
      className: "border-emerald-200 bg-emerald-50/70",
      onClick: () => goToModule(ROUTERS.ROOMS, { page: 1 }),
    },
  ];

  const queueItems = [
    {
      label: t("dashboard.partner_pending", { defaultValue: "Partner đang chờ duyệt" }),
      count: partners?.partnerPending ?? 0,
      action: () => goToModule(ROUTERS.PARTNER_MANAGEMENT, { status: 0, page: 1 }),
    },
    {
      label: t("dashboard.user_pending", { defaultValue: "Tài khoản user đang chờ" }),
      count: users?.userPending ?? 0,
      action: () => goToModule(ROUTERS.USER_MANAGEMENT, { status: 0, page: 1 }),
    },
    {
      label: t("dashboard.pending_bookings", { defaultValue: "Booking chưa xử lý" }),
      count: pendingBookings,
      action: () => goToModule(ROUTERS.BOOKING_MANAGE, { status: 0, page: 1 }),
    },
  ];

  const healthDonutData = [
    {
      name: t("dashboard.partner_pending", { defaultValue: "Partner chờ duyệt" }),
      value: partners?.partnerPending ?? 0,
      color: "#f59e0b",
    },
    {
      name: t("dashboard.user_pending", { defaultValue: "User chờ duyệt" }),
      value: users?.userPending ?? 0,
      color: "#0ea5e9",
    },
    {
      name: t("dashboard.pending_bookings", { defaultValue: "Booking chờ" }),
      value: pendingBookings,
      color: "#f97316",
    },
    {
      name: t("dashboard.partner_block", { defaultValue: "Partner bị khóa" }),
      value: partners?.partnerBlock ?? 0,
      color: "#ef4444",
    },
    {
      name: t("dashboard.user_block", { defaultValue: "User bị khóa" }),
      value: users?.userBlock ?? 0,
      color: "#8b5cf6",
    },
  ].filter((item) => item.value > 0);

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
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500">{t("dashboard.start_date", { defaultValue: "Từ ngày" })}</p>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 w-40" />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500">{t("dashboard.end_date", { defaultValue: "Đến ngày" })}</p>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 w-40" />
            </div>
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

      <section className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actionCards.map((card, idx) => (
          <button
            key={`${card.title}-${idx}`}
            onClick={card.onClick}
            className={`group rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${card.className}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{card.value.toLocaleString()}</p>
              </div>
              <card.icon className="mt-1 size-5 text-slate-600" />
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
              {t("common.view_more", { defaultValue: "Xử lý ngay" })}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
              {t("dashboard.bookings_per_month", { defaultValue: "Xu hướng booking theo tháng" })}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToModule(ROUTERS.BOOKING_MANAGE, { start_date: startDate, end_date: endDate, page: 1 })}
            >
              {t("common.view_more", { defaultValue: "Xem danh sách" })}
            </Button>
          </div>
          {isBookingsPerMonthLoading ? (
            <div className="flex h-72 items-center justify-center">
              <Spinner size="md" showText text={t("common.loading_data")} />
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingsTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="total" stroke="#0f766e" fill="url(#bookingGradient)" strokeWidth={2.5} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#0f766e"
                    strokeWidth={2.5}
                    dot={{ r: 4, cursor: "pointer" }}
                    activeDot={{
                      r: 6,
                      onClick: (point: any) => {
                        const month = point?.payload?.month;
                        if (!month) return;
                        const range = getMonthRange(month);
                        if (!range) {
                          goToModule(ROUTERS.BOOKING_MANAGE, { page: 1 });
                          return;
                        }
                        goToModule(ROUTERS.BOOKING_MANAGE, {
                          start_date: range.startDate,
                          end_date: range.endDate,
                          page: 1,
                        });
                      },
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
            {t("dashboard.work_queue", { defaultValue: "Hàng đợi xử lý" })}
          </h2>
          <div className="mb-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 10 }}>
                <Pie data={healthDonutData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={84} paddingAngle={2}>
                  {healthDonutData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {queueItems.map((item, idx) => (
              <button
                key={`${item.label}-${idx}`}
                onClick={item.action}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-colors hover:bg-slate-100"
              >
                <span className="text-sm text-slate-700">{item.label}</span>
                <span className="inline-flex min-w-8 justify-center rounded-full bg-white px-2 py-0.5 text-sm font-bold text-slate-900">
                  {item.count.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
              {t("dashboard.revenue_by_month", { defaultValue: "Doanh thu theo tháng" })}
            </h2>
            <p className="text-xs font-semibold text-emerald-700">
              {formatCurrency(revenueByMonthData?.data?.totalRevenue ?? 0)}
            </p>
          </div>
          {isRevenueByMonthLoading ? (
            <div className="flex h-72 items-center justify-center">
              <Spinner size="md" showText text={t("common.loading_data")} />
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueComposedData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCompact(Number(value))} />
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      if (name === t("dashboard.moving_avg", { defaultValue: "Trung bình 3 tháng" })) {
                        return [formatCurrency(Number(value)), name];
                      }
                      return [formatCurrency(Number(value)), name];
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" fill="url(#revenueAreaGradient)" stroke="none" />
                  <Bar dataKey="revenue" name={t("dashboard.revenue", { defaultValue: "Doanh thu" })} fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  <Line dataKey="avg" name={t("dashboard.moving_avg", { defaultValue: "Trung bình 3 tháng" })} stroke="#0f766e" strokeWidth={2.2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
            {t("dashboard.system_overview", { defaultValue: "Biểu đồ tổng quan hệ thống" })}
          </h2>
          <p className="mb-2 text-xs text-slate-500">
            {t("dashboard.overview_hint", { defaultValue: "Cột đậm thể hiện phần cần xử lý, đường line là tỷ lệ cần xử lý (%)." })}
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={overviewHealthData} margin={{ top: 10, right: 18, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(value) => formatCompact(Number(value))} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value: any, name: string | undefined) => {
                    if (name === t("dashboard.attention_rate", { defaultValue: "Tỷ lệ cần xử lý" })) {
                      return [`${value}%`, name || ""];
                    }
                    return [Number(value).toLocaleString(), name || ""];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="stable" stackId="a" name={t("dashboard.stable", { defaultValue: "Ổn định" })} fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="attention" stackId="a" name={t("dashboard.need_attention", { defaultValue: "Cần xử lý" })} fill="#f97316" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="attentionRate" name={t("dashboard.attention_rate", { defaultValue: "Tỷ lệ cần xử lý" })} stroke="#7c3aed" strokeWidth={2.2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
            {t("dashboard.bookings_by_property", { defaultValue: "Đặt phòng theo cơ sở" })}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              goToModule(ROUTERS.BOOKING_MANAGE, {
                start_date: startDate,
                end_date: endDate,
                page: 1,
              })
            }
          >
            {t("common.view_more", { defaultValue: "Xem danh sách" })}
          </Button>
        </div>
        {isBookingsByPropertyLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Spinner size="md" showText text={t("common.loading_data")} />
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyTrend} layout="vertical" margin={{ top: 10, right: 10, left: 50, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="total"
                  fill="#6366f1"
                  radius={[0, 6, 6, 0]}
                  onClick={() => {
                    goToModule(ROUTERS.BOOKING_MANAGE, {
                      start_date: startDate,
                      end_date: endDate,
                      page: 1,
                    });
                  }}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <span>
          {t("dashboard.quick_links_hint", {
            defaultValue: "Tất cả KPI và điểm trên biểu đồ đều có thể click để nhảy đến module và tự động lọc dữ liệu.",
          })}
        </span>
        <Button variant="outline" size="sm" onClick={() => goToModule(ROUTERS.PARTNER_MANAGEMENT, { status: 0, page: 1 })}>
          {t("dashboard.partner_pending", { defaultValue: "Partner đang chờ" })}
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;

