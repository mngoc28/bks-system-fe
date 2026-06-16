import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock3, MapPin, SearchX } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";

import Breadcrumb from "@/components/common/Breadcrumb";
import { BookingDaysRow } from "@/components/common/BookingDaysDisplay";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTERS } from "@/constant";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { formatPrice } from "@/utils/utils";
import { computeBookingTotalAmount } from "@/utils/bookingAmount";
import { countBookingNights, formatDate } from "@/utils/dateUtils";
import { useUserStore } from "@/store/useUserStore";
import stayService, { type BookingDetail } from "@/services/stayService";
import { bookingApi } from "@/api/EU/bookingApi";
import type { PublicBookingSummary } from "@/dataHelper/EU/booking.dataHelper";

type BookingStatus = "upcoming" | "completed" | "cancelled";

type UserBooking = {
  id: string;
  source: "stay" | "lookup";
  roomId: number;
  roomTitle: string;
  provinceName?: string;
  address?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  customerName: string;
  createdAt: string;
  status: BookingStatus;
  /** Original status from API (0–4). */
  serverStatus?: number;
  bookingCode?: string;
  stayBookingId?: number;
};

const bookingStatusLabel: Record<BookingStatus, string> = {
  upcoming: "Sắp tới",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const bookingStatusBadgeClass: Record<BookingStatus, string> = {
  upcoming: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

function formatYmd(isoOrDate: string): string {
  if (!isoOrDate) return "";
  return isoOrDate.length >= 10 ? isoOrDate.slice(0, 10) : isoOrDate;
}

/** Enum backend: 0 pending, 1 confirmed, 2 cancelled, 3 completed, 4 pending_cancellation */
function mapServerStatusToTab(status: number): BookingStatus {
  if (status === 2) return "cancelled";
  if (status === 3) return "completed";
  return "upcoming";
}

function mapStayBooking(b: BookingDetail): UserBooking {
  const addr = b.room?.property?.address || "";
  return {
    id: `stay-${b.id}`,
    source: "stay",
    roomId: 0,
    roomTitle: b.room?.title || "Phòng",
    address: addr,
    startDate: formatYmd(b.start_date),
    endDate: formatYmd(b.end_date),
    totalPrice: computeBookingTotalAmount({
      start_date: formatYmd(b.start_date),
      end_date: formatYmd(b.end_date),
      price: { price: b.price?.price, unit: b.price?.unit },
      services: b.services,
      total_amount: b.total_amount,
    }),
    customerName: "",
    createdAt: b.created_at,
    status: mapServerStatusToTab(b.status),
    serverStatus: b.status,
    stayBookingId: b.id,
  };
}

function mapLookupSummary(s: PublicBookingSummary): UserBooking {
  return {
    id: `lookup-${s.booking_id}`,
    source: "lookup",
    roomId: s.room_id,
    roomTitle: s.room_title,
    address: s.property_address,
    startDate: formatYmd(s.start_date),
    endDate: formatYmd(s.end_date),
    totalPrice: Number(s.total_amount ?? 0),
    customerName: "",
    createdAt: new Date().toISOString(),
    status: mapServerStatusToTab(s.status),
    serverStatus: s.status,
    bookingCode: s.booking_code,
  };
}

const MyBookings = () => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<BookingStatus>("upcoming");
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupCode, setLookupCode] = useState("");
  const [lookupHit, setLookupHit] = useState<UserBooking | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    void (async () => {
      try {
        window.localStorage.removeItem("publicMyBookings");
      } catch {
        /* ignore */
      }
      await queryClient.invalidateQueries({ queryKey: ["my-bookings", "stay-list"] });
    })();
  }, [isAuthenticated, queryClient]);

  const stayQuery = useQuery({
    queryKey: ["my-bookings", "stay-list"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res: { data?: { data?: BookingDetail[] } } = (await stayService.getBookings(1)) as {
        data?: { data?: BookingDetail[] };
      };
      return res?.data?.data ?? [];
    },
  });

  const stayCards = useMemo(() => (stayQuery.data ?? []).map(mapStayBooking), [stayQuery.data]);

  const allBookings = useMemo(() => {
    const merged = [...stayCards];
    if (lookupHit) {
      merged.push(lookupHit);
    }
    return merged;
  }, [stayCards, lookupHit]);

  const filteredBookings = useMemo(() => allBookings.filter((b) => b.status === tab), [allBookings, tab]);

  const handleLookup = async () => {
    const email = lookupEmail.trim();
    const code = lookupCode.trim();
    if (!email || !code) {
      toastError("Vui lòng nhập email và mã đặt phòng.");
      return;
    }
    setLookupLoading(true);
    try {
      const res = (await bookingApi.lookupBooking({ email, booking_code: code })) as {
        data?: PublicBookingSummary;
        message?: string;
      };
      if (res?.data?.booking_id) {
        const booking = mapLookupSummary(res.data);
        setLookupHit(booking);
        setTab(booking.status);
        toastSuccess(res.message || "Đã tìm thấy đơn đặt phòng.");
      } else {
        setLookupHit(null);
        toastError("Không tìm thấy đơn khớp với thông tin đã nhập.");
      }
    } catch (e: unknown) {
      setLookupHit(null);
      const msg =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toastError(msg || "Tra cứu thất bại. Vui lòng thử lại.");
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900">
      <PublicHeader />

      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Background scenic image */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=75"
            alt="hero background"
            className="h-full w-full object-cover"
            style={{ opacity: 0.35 }}
          />
        </div>
        {/* Multi-layer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />
        {/* Ambient glow orbs */}
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-sky-600/15 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,1) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
            Quản lý đặt phòng
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Đặt phòng của tôi</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Dữ liệu lấy từ hệ thống BKS: tra cứu công khai bằng email + mã đặt (trong email xác nhận), hoặc danh sách đặt qua cổng BKS Stay khi bạn đã đăng nhập.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Đăng nhập để xem toàn bộ lịch sử và chi tiết lưu trú:{" "}
            <Link
              to={ROUTERS.BKS_STAY_LOGIN}
              className="font-semibold text-sky-300 underline-offset-2 hover:underline"
            >
              BKS Stay
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: ROUTERS.HOME },
              { label: "Đặt phòng của tôi" },
            ]}
            className="text-sm"
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="mb-8 rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Tra cứu đơn (không cần đăng nhập)</h2>
            <p className="text-sm text-slate-600">
              Nhập email đã dùng khi đặt và mã đặt phòng (dạng RM-YYYY-XXXXXX) trong email xác nhận.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lookup-email">Email</Label>
                <Input
                  id="lookup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="ban@email.com"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lookup-code">Mã đặt phòng</Label>
                <Input
                  id="lookup-code"
                  placeholder="RM-2026-000042"
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value)}
                  className="rounded-xl font-mono"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" className="rounded-full bg-sky-600 hover:bg-sky-700" onClick={handleLookup} disabled={lookupLoading}>
                {lookupLoading ? (
                  <>
                    <Spinner size="sm" className="inline-block mr-2" spinnerClassName="border-y-white" />
                    Đang tra cứu…
                  </>
                ) : (
                  "Tra cứu"
                )}
              </Button>
              {lookupHit && (
                <Button type="button" variant="secondary" className="rounded-full" onClick={() => setLookupHit(null)}>
                  Xóa kết quả tra cứu
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        


        {isAuthenticated && stayQuery.isLoading && (
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
            <Spinner size="sm" className="inline-block" />
            Đang tải đơn từ BKS Stay…
          </div>
        )}

        {isAuthenticated && stayQuery.isError && (
          <p className="mb-6 text-sm text-rose-600">Không tải được danh sách BKS Stay. Bạn vẫn có thể tra cứu đơn bằng form phía trên.</p>
        )}

        <div className="mb-6 overflow-x-auto pb-1 scrollbar-hide">
          <div className="inline-flex min-w-max rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {(["upcoming", "completed", "cancelled"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setTab(status)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === status ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {bookingStatusLabel[status]}
            </button>
          ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300/70 bg-white/80 px-6 py-14 text-center">
            <SearchX className="mx-auto mb-3 size-8 text-slate-400" />
            <p className="text-base font-semibold text-slate-700">Chưa có đơn đặt phòng nào ở mục này</p>
            <p className="mt-2 text-sm text-slate-500">
              Thử tra cứu bằng email và mã đặt, hoặc đăng nhập BKS Stay để xem lịch sử đầy đủ.
            </p>
            <Button asChild variant="gradient" className="mt-5 rounded-full">
              <Link to={ROUTERS.SEARCH_ROOMS}>Tìm phòng ngay</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings
              .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
              .map((booking) => (
                <Card key={booking.id} className="rounded-3xl border-slate-200 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{booking.roomTitle}</h3>
                          {booking.serverStatus === 4 ? (
                            <Badge className="rounded-full border-0 bg-orange-100 text-orange-700">
                              Chờ duyệt hủy
                            </Badge>
                          ) : (
                            <Badge className={`rounded-full border-0 ${bookingStatusBadgeClass[booking.status]}`}>
                              {bookingStatusLabel[booking.status]}
                            </Badge>
                          )}
                          <Badge variant="outline" className="rounded-full border-slate-300 text-slate-600">
                            {booking.source === "stay" ? "BKS Stay" : "Tra cứu"}
                          </Badge>
                        </div>
                        {booking.bookingCode && (
                          <p className="text-xs font-mono text-slate-500">Mã: {booking.bookingCode}</p>
                        )}
                        {booking.source === "stay" && booking.stayBookingId != null && (
                          <p className="text-xs text-slate-500">Mã đơn hệ thống: #{booking.stayBookingId}</p>
                        )}
                        <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="size-4 text-sky-500" />
                          {booking.address || "Đang cập nhật địa chỉ"}
                        </p>
                        <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="size-4 text-sky-500" />
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </p>
                        <BookingDaysRow days={countBookingNights(booking.startDate, booking.endDate)} />
                        <p className="inline-flex items-center gap-2 text-sm text-slate-500">
                          <Clock3 className="size-4" />
                          {booking.source === "stay" ? `Cập nhật: ${new Date(booking.createdAt).toLocaleString("vi-VN")}` : "Kết quả tra cứu mới nhất"}
                        </p>
                      </div>

                      <div className="space-y-3 md:text-right">
                        <p className="text-sm text-slate-500">Tổng tạm tính</p>
                        <p className="text-2xl font-bold text-sky-600">{formatPrice(booking.totalPrice)}</p>
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          {booking.source === "lookup" && booking.roomId > 0 && (
                            <Button asChild variant="secondary" className="rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                              <Link to={ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", booking.roomId.toString())}>Xem phòng</Link>
                            </Button>
                          )}
                          {booking.source === "stay" && booking.stayBookingId != null && (
                            <Button asChild variant="gradient" className="rounded-full">
                              <Link to={ROUTERS.BKS_STAY_DETAILS.replace(":id", String(booking.stayBookingId))}>
                                <CheckCircle2 className="mr-1 size-4" />
                                Chi tiết Stay
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};

export default MyBookings;
