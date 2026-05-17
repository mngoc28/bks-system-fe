import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, CalendarDays, MapPin } from "lucide-react";
import { useEffect } from "react";

import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTERS, PUBLIC_MY_BOOKINGS_STORAGE_KEY } from "@/constant";
import type { LocalPublicBookingRow } from "@/dataHelper/EU/booking.dataHelper";
import { formatPrice } from "@/utils/utils";

type BookingSuccessState = {
  /** Code RM-YYYY-XXXXXX from server (email + API). */
  bookingCode?: string;
  bookingId?: number;
  roomId?: number;
  guestEmail?: string;
  priceId?: number;
  roomTitle: string;
  address?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
};

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state as BookingSuccessState | null) ?? null;

  useEffect(() => {
    if (!state?.roomId || !state.guestEmail || !state.startDate || !state.endDate) {
      return;
    }
    try {
      const localId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `local-${Date.now()}`;
      const row: LocalPublicBookingRow = {
        local_id: localId,
        room_id: state.roomId,
        start_date: state.startDate.slice(0, 10),
        end_date: state.endDate.slice(0, 10),
        email: state.guestEmail.trim().toLowerCase(),
        ...(state.priceId != null && state.priceId > 0 ? { price_id: state.priceId } : {}),
      };
      const raw = window.localStorage.getItem(PUBLIC_MY_BOOKINGS_STORAGE_KEY);
      let list: LocalPublicBookingRow[] = [];
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          list = parsed as LocalPublicBookingRow[];
        }
      }
      list.push(row);
      window.localStorage.setItem(PUBLIC_MY_BOOKINGS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }, [state]);

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40">
        <PublicHeader />
        <main className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-slate-700 font-medium">Không có thông tin đặt phòng trên phiên này.</p>
          <p className="mt-3 text-sm text-slate-600 max-w-lg mx-auto">
            Nếu bạn vừa đặt phòng, hãy kiểm tra email xác nhận (kèm mã đặt). Bạn có thể tra cứu đơn bằng email và mã đặt trên trang{" "}
            <Link to={ROUTERS.MY_BOOKINGS} className="font-semibold text-sky-600 underline-offset-2 hover:underline">
              Đặt phòng của tôi
            </Link>
            , hoặc{" "}
            <Link to={ROUTERS.BKS_STAY_LOGIN} className="font-semibold text-sky-600 underline-offset-2 hover:underline">
              đăng nhập BKS Stay
            </Link>{" "}
            nếu đã có tài khoản.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate(ROUTERS.MY_BOOKINGS)}>Tra cứu đơn</Button>
            <Button variant="secondary" className="border border-slate-300 bg-white text-slate-700" onClick={() => navigate(ROUTERS.SEARCH_ROOMS)}>
              Tìm phòng khác
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const codeLabel = state.bookingCode?.trim() || (state.bookingId != null ? `Mã nội bộ #${state.bookingId}` : "—");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900">
      <PublicHeader />

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900/80" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <CheckCircle2 className="mx-auto size-14 text-emerald-300" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Đặt phòng thành công</h1>
          <div className="mt-6 inline-flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-slate-100 leading-relaxed">
              Yêu cầu của bạn đã được ghi nhận trên hệ thống. Chúng tôi đã gửi thông tin xác nhận chi tiết về email đăng ký.
            </p>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-sm sm:text-base text-slate-300">
              <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mr-2">
                Quan trọng
              </span>
              Vui lòng kiểm tra kỹ hộp thư đến và cả thư mục <span className="font-semibold text-sky-400 italic">Spam (Thư rác)</span> nếu không thấy email.
            </p>
          </div>
        </div>
      </section>

      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: ROUTERS.HOME },
              { label: "Đặt phòng thành công" },
            ]}
            className="text-sm"
          />
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="space-y-4 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <p className="text-sm uppercase tracking-[0.15em] text-slate-500">Mã đặt phòng</p>
              <p className="text-sm font-semibold text-slate-800 text-right break-all">{codeLabel}</p>
            </div>

            <h2 className="text-xl font-semibold text-slate-900">{state.roomTitle}</h2>

            <p className="inline-flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="mt-0.5 size-4 text-sky-500" />
              {state.address || "Đang cập nhật địa chỉ"}
            </p>

            <p className="inline-flex items-center gap-2 text-sm text-slate-600">
              <CalendarDays className="size-4 text-sky-500" />
              {state.startDate} - {state.endDate}
            </p>

            <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-sm text-slate-600">Tổng tạm tính</p>
              <p className="mt-1 text-2xl font-bold text-sky-600">{formatPrice(state.totalPrice)}</p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <p className="text-xs text-slate-500">
                Đơn đã được lưu trên hệ thống BKS. Để xem lại sau này, hãy dùng email và mã đặt trên trang{" "}
                <Link to={ROUTERS.MY_BOOKINGS} className="font-semibold text-sky-600 underline-offset-2 hover:underline">
                  Đặt phòng của tôi
                </Link>
                , hoặc{" "}
                <Link to={ROUTERS.BKS_STAY_LOGIN} className="font-semibold text-sky-600 underline-offset-2 hover:underline">
                  đăng nhập BKS Stay
                </Link>
                .
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 hover:opacity-90">
                  <Link to={ROUTERS.MY_BOOKINGS}>Tra cứu / đơn của tôi</Link>
                </Button>
                <Button asChild variant="secondary" className="rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                  <Link to={ROUTERS.SEARCH_ROOMS}>Tiếp tục tìm phòng</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <PublicFooter />
    </div>
  );
};

export default BookingSuccess;
