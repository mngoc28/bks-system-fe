import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock3, MapPin, SearchX, XCircle } from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTERS } from "@/constant";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { formatPrice } from "@/utils/utils";

type BookingStatus = "upcoming" | "completed" | "cancelled";

type UserBooking = {
  id: string;
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
};

const STORAGE_KEY = "publicMyBookings";

const safeParseBookings = (): UserBooking[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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

/** Số giờ tối thiểu trước 14:00 ngày nhận phòng để được phép hủy (chính sách demo, có thể chỉnh). */
const CANCEL_MIN_HOURS_BEFORE_CHECKIN = 24;

type CancelEligibility =
  | { allowed: true }
  | { allowed: false; reason: string };

function parseLocalDateOnly(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 14, 0, 0, 0);
}

function getCancelEligibility(booking: UserBooking): CancelEligibility {
  if (booking.status !== "upcoming") {
    return { allowed: false, reason: "Chỉ có thể hủy đơn đang ở trạng thái Sắp tới." };
  }
  const checkInAt = parseLocalDateOnly(booking.startDate);
  const deadline = new Date(checkInAt.getTime() - CANCEL_MIN_HOURS_BEFORE_CHECKIN * 60 * 60 * 1000);
  if (Date.now() > deadline.getTime()) {
    return {
      allowed: false,
      reason: `Đã quá thời hạn hủy online (cần hủy trước ${CANCEL_MIN_HOURS_BEFORE_CHECKIN} giờ so với 14:00 ngày nhận phòng). Vui lòng liên hệ hotline để được hỗ trợ.`,
    };
  }
  return { allowed: true };
}

const MyBookings = () => {
  const [tab, setTab] = useState<BookingStatus>("upcoming");
  const [bookings, setBookings] = useState<UserBooking[]>(() => safeParseBookings());
  const [bookingToCancel, setBookingToCancel] = useState<UserBooking | null>(null);

  const filteredBookings = useMemo(() => bookings.filter((booking) => booking.status === tab), [bookings, tab]);

  const cancelEligibility = useMemo(
    () => (bookingToCancel ? getCancelEligibility(bookingToCancel) : null),
    [bookingToCancel],
  );

  const persistBookings = (nextBookings: UserBooking[]) => {
    setBookings(nextBookings);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBookings));
    }
  };

  const confirmCancelBooking = () => {
    if (!bookingToCancel) return;
    const eligibility = getCancelEligibility(bookingToCancel);
    if (!eligibility.allowed) {
      toastError(eligibility.reason);
      return;
    }
    const nextBookings = bookings.map((booking) =>
      booking.id === bookingToCancel.id ? { ...booking, status: "cancelled" as const } : booking,
    );
    persistBookings(nextBookings);
    toastSuccess("Đã hủy đơn trên thiết bị này. Nếu cần hủy chính thức với khách sạn, vui lòng liên hệ BKS.");
    setBookingToCancel(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900">
      <PublicHeader />

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900/80" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
            Quản lý đặt phòng
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Đặt phòng của tôi</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Theo dõi đơn đặt qua website công khai — dữ liệu được lưu trên trình duyệt thiết bị này.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Để xem lịch sử và quản lý lưu trú đầy đủ trên cổng BKS Stay (sau khi có tài khoản / hệ thống đồng bộ), hãy{" "}
            <Link
              to={ROUTERS.BKS_STAY_LOGIN}
              className="font-semibold text-sky-300 underline-offset-2 hover:underline"
            >
              đăng nhập BKS Stay
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
        <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["upcoming", "completed", "cancelled"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setTab(status)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === status ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {bookingStatusLabel[status]}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300/70 bg-white/80 px-6 py-14 text-center">
            <SearchX className="mx-auto mb-3 size-8 text-slate-400" />
            <p className="text-base font-semibold text-slate-700">Chưa có đơn đặt phòng nào ở mục này</p>
            <p className="mt-2 text-sm text-slate-500">Hãy tìm phòng phù hợp và tạo đơn đặt đầu tiên của bạn.</p>
            <Button asChild className="mt-5 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 hover:opacity-90">
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
                          <Badge className={`rounded-full border-0 ${bookingStatusBadgeClass[booking.status]}`}>{bookingStatusLabel[booking.status]}</Badge>
                        </div>
                        <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="size-4 text-sky-500" />
                          {booking.address || "Đang cập nhật địa chỉ"}
                        </p>
                        <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="size-4 text-sky-500" />
                          {booking.startDate} - {booking.endDate}
                        </p>
                        <p className="inline-flex items-center gap-2 text-sm text-slate-500">
                          <Clock3 className="size-4" />
                          Tạo lúc: {new Date(booking.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>

                      <div className="space-y-3 md:text-right">
                        <p className="text-sm text-slate-500">Tổng tạm tính</p>
                        <p className="text-2xl font-bold text-sky-600">{formatPrice(booking.totalPrice)}</p>
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <Button asChild variant="secondary" className="rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                            <Link to={ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", booking.roomId.toString())}>Xem phòng</Link>
                          </Button>

                          {booking.status === "upcoming" && (
                            <Button
                              variant="secondary"
                              className="rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                              type="button"
                              onClick={() => setBookingToCancel(booking)}
                            >
                              <XCircle className="mr-1 size-4" />
                              Hủy đơn
                            </Button>
                          )}

                          {booking.status === "completed" && (
                            <Button asChild className="rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 hover:opacity-90">
                              <Link to={`${ROUTERS.BOOKING}/${booking.roomId}`}>
                                <CheckCircle2 className="mr-1 size-4" />
                                Đặt lại
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

      <Dialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
        <DialogContent className="max-w-md rounded-2xl sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Hủy đặt phòng?</DialogTitle>
            {bookingToCancel && (
              <DialogDescription>
                Xác nhận hủy đơn {bookingToCancel.roomTitle} ({bookingToCancel.startDate} — {bookingToCancel.endDate}).
              </DialogDescription>
            )}
          </DialogHeader>
          {bookingToCancel && (
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">{bookingToCancel.roomTitle}</span>
                <span className="text-slate-500"> — </span>
                {bookingToCancel.startDate} → {bookingToCancel.endDate}
              </p>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Đơn đang xem chỉ lưu trên trình duyệt (đặt qua website công khai). Thao tác &quot;Hủy&quot; tại đây{" "}
                <strong>không tự động gửi yêu cầu hủy tới khách sạn</strong> — khi hệ thống đồng bộ server, luồng hủy
                sẽ gọi API chính thức.
              </div>
              {cancelEligibility && !cancelEligibility.allowed && (
                <p className="text-sm text-rose-600">{cancelEligibility.reason}</p>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="secondary" className="rounded-xl" onClick={() => setBookingToCancel(null)}>
              Quay lại
            </Button>
            {cancelEligibility?.allowed === true && (
              <Button
                type="button"
                className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                onClick={confirmCancelBooking}
              >
                Xác nhận hủy đơn
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PublicFooter />
    </div>
  );
};

export default MyBookings;
