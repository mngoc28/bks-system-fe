import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, Mail, KeyRound, CreditCard, LogIn } from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTERS } from "@/constant";
import { getAccessToken } from "@/utils/storage";

type BookingSuccessState = {
  bookingCode?: string;
  bookingId?: number;
  roomId?: number;
  guestEmail?: string;
  roomTitle: string;
  startDate: string;
  endDate: string;
  createdAt?: string; // ISO string — dùng để tính grace period chính xác
};

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Tính grace period đồng bộ với BookingDetail.tsx:
  // Nếu check-in trong vòng 48h kể từ lúc đặt → grace 2h, còn lại → 12h
  const computeInitialGraceSeconds = (startDate: string, createdAt?: string): number => {
    const createdMs = createdAt ? new Date(createdAt).getTime() : Date.now();
    const startMs   = new Date(startDate).getTime();
    const diffHours = (startMs - createdMs) / (1000 * 60 * 60);
    return diffHours <= 48 ? 2 * 60 * 60 : 12 * 60 * 60;
  };

  const stateRef = (location.state as BookingSuccessState | null) ?? null;
  const initialGrace = stateRef ? computeInitialGraceSeconds(stateRef.startDate, stateRef.createdAt) : 2 * 60 * 60;
  const [timeLeft, setTimeLeft] = useState(initialGrace);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const state = stateRef;

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
            <Button onClick={() => navigate(ROUTERS.MY_BOOKINGS)} className="rounded-full">Tra cứu đơn</Button>
            <Button variant="secondary" className="border border-slate-300 bg-white text-slate-700 rounded-full" onClick={() => navigate(ROUTERS.SEARCH_ROOMS)}>
              Tìm phòng khác
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const codeLabel = state.bookingCode?.trim() || (state.bookingId != null ? `Mã đặt phòng #${state.bookingId}` : "—");
  const isLoggedIn = !!getAccessToken();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900">
      <PublicHeader />

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=75"
            alt="hero background"
            className="h-full w-full object-cover"
            style={{ opacity: 0.35 }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-emerald-600/15 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,1) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <CheckCircle2 className="mx-auto size-14 text-emerald-400 animate-bounce" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl text-[#10b981]">Đặt phòng thành công</h1>
          <div className="mt-6 inline-flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-slate-100 leading-relaxed">
              Yêu cầu của bạn đã được ghi nhận trên hệ thống. Chúng tôi đã gửi thông tin xác nhận chi tiết về email mà bạn đã đăng ký.
            </p>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-sm sm:text-base text-slate-300">
              <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider mr-2">
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

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="rounded-[32px] border-none bg-white p-8 shadow-xl shadow-slate-200/50">
          <CardContent className="space-y-8 p-0">
            {/* Minimal booking confirmation */}
            <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mã đặt phòng của bạn</span>
              <span className="text-xl font-mono font-black text-slate-900 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 select-all">
                {codeLabel}
              </span>
              {state.guestEmail && (
                <p className="text-xs font-semibold text-slate-500">
                  Thông tin chi tiết đã được gửi tới: <span className="text-sky-600 font-bold">{state.guestEmail}</span>
                </p>
              )}
            </div>

            {/* Chờ cọc Banner */}
            <div className="rounded-2xl border border-rose-100 bg-[#fef2f2] p-6 text-center space-y-4 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-[#dc2626] font-bold">
                <Clock className="size-5 animate-pulse" />
                <span>Trạng thái: Chờ đặt cọc giữ phòng</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Để hoàn tất việc giữ phòng, vui lòng truy cập BKS Stay Portal để thanh toán đặt cọc trước khi thời gian chờ hết hạn.
              </p>
              <div className="inline-block bg-slate-900 text-white font-mono text-2xl font-black px-6 py-2 rounded-xl tracking-wider shadow-inner">
                {formatTime(timeLeft)}
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Thời gian thanh toán còn lại (Grace Period)</p>
            </div>

            {/* Next Steps — Email-first flow */}
            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-500" />
                Hướng dẫn các bước tiếp theo
              </h3>

              {/* Step 1 — Email (highlighted as mandatory) */}
              <div className="relative flex gap-4 p-4 rounded-2xl bg-sky-50 border-2 border-sky-300 shadow-sm">
                <div className="absolute -top-2.5 left-4 text-[10px] font-black uppercase tracking-widest text-sky-600 bg-sky-50 px-2">
                  Bước 1 — Bắt buộc
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <Mail className="size-5" />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-bold text-slate-900">Mở hộp thư điện tử ngay bây giờ</p>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Chúng tôi đã gửi email xác nhận kèm{" "}
                    <span className="font-bold text-sky-700">đường dẫn kích hoạt tài khoản</span> đến{" "}
                    <span className="font-bold text-slate-800">{state.guestEmail || "email đăng ký"}</span>.{" "}
                    Kiểm tra cả thư mục <span className="italic font-semibold">Spam</span> nếu không thấy email.
                  </p>
                </div>
              </div>

              {/* Step 2 — Activate */}
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <KeyRound className="size-5" />
                </div>
                <div className="space-y-1 text-sm text-slate-500">
                  <p className="font-bold text-slate-700">Nhấn liên kết trong email → Tạo mật khẩu → Đăng nhập</p>
                  <p className="text-xs leading-relaxed">
                    Nếu đây là lần đầu đặt phòng, click vào liên kết thiết lập mật khẩu trong email để kích hoạt tài khoản BKS Stay Portal.
                  </p>
                </div>
              </div>

              {/* Step 3 — Deposit */}
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <CreditCard className="size-5" />
                </div>
                <div className="space-y-1 text-sm text-slate-500">
                  <p className="font-bold text-slate-700">Hoàn tất đặt cọc &amp; nhận phiếu lưu trú</p>
                  <p className="text-xs leading-relaxed">
                    Sau khi đăng nhập, vào <strong>Chi tiết đặt phòng</strong> để thanh toán cọc và tải{" "}
                    <strong>Stay Voucher</strong> hoặc ký hợp đồng điện tử.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              {/* Primary reminder */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center">
                <p className="text-xs font-bold text-amber-700">
                  ⚠️ Bạn cần kích hoạt tài khoản qua email trước khi có thể đăng nhập và thanh toán cọc.
                </p>
              </div>

              {/* Only show shortcut if user is already logged in (returning guest) */}
              {isLoggedIn && (
                <Button asChild variant="outline" className="h-11 w-full rounded-2xl font-bold border-sky-300 text-sky-700 hover:bg-sky-50 gap-2">
                  <Link to={`/bks-stay/bookings/${state.bookingId}`}>
                    <LogIn className="size-4" />
                    <span>Xem chi tiết đặt phòng (đã đăng nhập)</span>
                  </Link>
                </Button>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="secondary" className="h-12 flex-1 rounded-2xl border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50">
                  <Link to={ROUTERS.HOME}>
                    Về trang chủ BKS
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="h-12 flex-1 rounded-2xl border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50">
                  <Link to={ROUTERS.SEARCH_ROOMS}>
                    Tiếp tục tìm phòng
                  </Link>
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
