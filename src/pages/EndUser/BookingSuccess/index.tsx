import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, Mail, KeyRound, CreditCard, LogIn, AlertCircle } from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTERS } from "@/constant";
import { getAccessToken } from "@/utils/storage";
import { bookingApi } from "@/api/EU/bookingApi";
import { useUserStore } from "@/store/useUserStore";

type BookingSuccessState = {
  bookingCode?: string;
  bookingId?: number;
  roomId?: number;
  guestEmail?: string;
  roomTitle: string;
  startDate: string;
  endDate: string;
  createdAt?: string; // ISO string — dùng để tính grace period chính xác
  paymentMethod?: string;
  status?: number;
  paymentUrl?: string;
};

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const qBookingCode = searchParams.get("bookingCode");
  const qEmail = searchParams.get("email");
  const qPaymentStatus = searchParams.get("paymentStatus");

  const stateRef = (location.state as BookingSuccessState | null) ?? null;

  const [bookingData, setBookingData] = useState<BookingSuccessState | null>(stateRef);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasSynced, setHasSynced] = useState(false);
  const { userEmail } = useUserStore();

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const handleUpdateEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      setUpdateError("Vui lòng nhập email hợp lệ.");
      return;
    }
    setUpdateError("");
    setUpdateSuccess("");
    setIsUpdating(true);
    try {
      const res = await bookingApi.updateBookingEmail({
        booking_code: bookingData?.bookingCode,
        old_email: bookingData?.guestEmail,
        new_email: newEmail.trim()
      }) as any;
      if (res?.success || res?.status === "success") {
        setUpdateSuccess("Cập nhật email thành công! Một email kích hoạt mới đã được gửi đi.");
        setBookingData((prev: any) => prev ? { ...prev, guestEmail: newEmail.trim() } : null);
        setIsEditingEmail(false);
        setNewEmail("");
      } else {
        setUpdateError(res?.message || "Cập nhật email thất bại.");
      }
    } catch (err: any) {
      console.error(err);
      setUpdateError(err?.response?.data?.message || "Cập nhật email thất bại.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Tính grace period đồng bộ với BookingDetail.tsx:
  // Nếu check-in trong vòng 48h kể từ lúc đặt → grace 2h, còn lại → 12h
  const computeInitialGraceSeconds = (startDate: string, createdAt?: string): number => {
    const createdMs = createdAt ? new Date(createdAt).getTime() : Date.now();
    const startMs   = new Date(startDate).getTime();
    const diffHours = (startMs - createdMs) / (1000 * 60 * 60);
    return diffHours <= 48 ? 2 * 60 * 60 : 12 * 60 * 60;
  };

  useEffect(() => {
    const code = qBookingCode || bookingData?.bookingCode;
    const email = qEmail || bookingData?.guestEmail;

    if (!code || !email || hasSynced) return;

    const shouldShowSpinner = !bookingData;
    if (shouldShowSpinner) {
      setLoading(true);
    }

    bookingApi.lookupBooking({ email, booking_code: code })
      .then((res) => {
        if ((res?.success || res?.status === "success") && res?.data) {
          const d = res.data;
          setBookingData({
            bookingCode: d.booking_code,
            bookingId: d.booking_id,
            roomId: d.room_id,
            guestEmail: email,
            roomTitle: d.room_title,
            startDate: d.start_date,
            endDate: d.end_date,
            createdAt: d.created_at,
            paymentMethod: d.payment_method,
            status: d.status,
          });
          setHasSynced(true);
        }
      })
      .catch((err) => {
        console.error("Failed to lookup booking:", err);
      })
      .finally(() => {
        if (shouldShowSpinner) {
          setLoading(false);
        }
      });
  }, [bookingData?.bookingCode, bookingData?.guestEmail, qBookingCode, qEmail, hasSynced]);

  useEffect(() => {
    if (bookingData) {
      const initialGrace = computeInitialGraceSeconds(bookingData.startDate, bookingData.createdAt);
      const createdMs = bookingData.createdAt ? new Date(bookingData.createdAt).getTime() : Date.now();
      const elapsedSeconds = Math.floor((Date.now() - createdMs) / 1000);
      const remaining = Math.max(0, initialGrace - elapsedSeconds);
      setTimeLeft(remaining);
    }
  }, [bookingData]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-12 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Đang tải thông tin đặt phòng...</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!bookingData) {
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

  const codeLabel = bookingData.bookingCode?.trim() || (bookingData.bookingId != null ? `Mã đặt phòng #${bookingData.bookingId}` : "—");
  const isLoggedIn = !!getAccessToken() && !!userEmail && userEmail.toLowerCase() === bookingData.guestEmail?.toLowerCase();

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
              {bookingData.guestEmail && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-semibold text-slate-500">
                    Thông tin chi tiết đã được gửi tới: <span className="text-sky-600 font-bold">{bookingData.guestEmail}</span>
                  </p>
                  
                  {!isLoggedIn && (
                    <div className="flex flex-col items-center gap-1.5 mt-1">
                      {isEditingEmail ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2 max-w-sm w-full">
                          <input
                            type="email"
                            placeholder="Nhập lại email đúng..."
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="h-8 text-xs px-3 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 w-full"
                          />
                          <div className="flex gap-1.5 shrink-0">
                            <Button 
                              onClick={handleUpdateEmail} 
                              disabled={isUpdating}
                              className="h-8 text-[10px] px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold"
                            >
                              {isUpdating ? "Đang lưu..." : "Xác nhận"}
                            </Button>
                            <Button 
                              onClick={() => {
                                setIsEditingEmail(false);
                                setUpdateError("");
                              }} 
                              variant="secondary"
                              className="h-8 text-[10px] px-3 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 rounded-lg"
                            >
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsEditingEmail(true)} 
                          className="text-[11px] text-amber-600 hover:text-amber-700 font-bold underline underline-offset-2 transition-colors"
                        >
                          Bạn không nhận được email? Nhấp để sửa lại email nhận tin
                        </button>
                      )}
                      
                      {updateError && (
                        <p className="text-[10px] font-semibold text-rose-500">{updateError}</p>
                      )}
                      {updateSuccess && (
                        <p className="text-[10px] font-semibold text-emerald-600">{updateSuccess}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dynamic Status Banner */}
            {(() => {
              const isConfirmedOrPaid = qPaymentStatus === "success" || bookingData.status === 1;
              const isPayAtCounter = bookingData.paymentMethod === "pay_at_counter";

              if (isConfirmedOrPaid) {
                return (
                  <div className="rounded-2xl border border-emerald-100 bg-[#f0fdf4] p-6 text-center space-y-3 shadow-sm">
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                      <CheckCircle2 className="size-5 animate-pulse" />
                      <span>Trạng thái: Đã xác nhận &amp; Đã thanh toán</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                      Cảm ơn bạn! Giao dịch thanh toán trực tuyến đã thành công. Yêu cầu đặt phòng của bạn đã được xác nhận giữ chỗ chính thức.
                    </p>
                  </div>
                );
              }

              if (isPayAtCounter) {
                return (
                  <div className="rounded-2xl border border-blue-100 bg-[#eff6ff] p-6 text-center space-y-3 shadow-sm">
                    <div className="flex items-center justify-center gap-2 text-blue-600 font-bold">
                      <Clock className="size-5" />
                      <span>Trạng thái: Đã xác nhận giữ phòng (Thanh toán tại quầy)</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                      Yêu cầu giữ phòng của bạn đã được ghi nhận. Vui lòng thanh toán trực tiếp tại quầy lễ tân khi làm thủ tục nhận phòng.
                    </p>
                  </div>
                );
              }

              // Default: Pending deposit (online payment but not confirmed)
              return (
                <div className="rounded-2xl border border-rose-100 bg-[#fef2f2] p-6 text-center space-y-4 shadow-sm">
                  {isLoggedIn ? (
                    <>
                      <div className="flex items-center justify-center gap-2 text-rose-600 font-bold">
                        <Clock className="size-5 animate-pulse" />
                        <span>Trạng thái: Chờ thanh toán đặt cọc</span>
                      </div>
                      {qPaymentStatus === "failed" && (
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                          <AlertCircle className="size-4" />
                          <span>Thanh toán trực tuyến thất bại hoặc bị hủy</span>
                        </div>
                      )}
                      <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                        Đơn đặt phòng của bạn đang chờ đặt cọc để hoàn tất giữ chỗ. Vui lòng truy cập trang quản lý Stay Portal để tiến hành thanh toán cọc.
                      </p>
                      <div className="py-1 max-w-xs mx-auto">
                        <Button asChild className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 font-bold text-white shadow-md hover:from-sky-600 hover:to-sky-700 transition-all h-10">
                          <Link to={`/bks-stay/bookings/${bookingData.bookingId}`}>
                            Thanh toán đặt cọc trên Stay Portal
                          </Link>
                        </Button>
                      </div>
                      <div className="inline-block bg-slate-900 text-white font-mono text-2xl font-black px-6 py-2 rounded-xl tracking-wider shadow-inner">
                        {formatTime(timeLeft)}
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                        Thời gian thanh toán còn lại (Grace Period)
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2 text-amber-600 font-bold">
                        <AlertCircle className="size-5 animate-pulse" />
                        <span>Trạng thái: Chờ xác thực email để cọc phòng</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                        Để đảm bảo tính xác thực và an toàn tài chính, hệ thống yêu cầu xác thực email trước khi thanh toán cọc. Vui lòng mở email kích hoạt gửi tới <strong className="text-slate-900 font-bold">{bookingData.guestEmail}</strong> để truy cập Stay Portal và tiến hành cọc giữ phòng.
                      </p>
                      <div className="inline-block bg-slate-900 text-white font-mono text-2xl font-black px-6 py-2 rounded-xl tracking-wider shadow-inner">
                        {formatTime(timeLeft)}
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                        Thời gian cọc còn lại (Grace Period)
                      </p>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Next Steps — Email-first flow */}
            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-500" />
                Hướng dẫn các bước tiếp theo
              </h3>

              {isLoggedIn ? (
                <>
                  {/* Step 1 — Go to details */}
                  <div className="relative flex gap-4 p-4 rounded-2xl bg-sky-50 border-2 border-sky-300 shadow-sm">
                    <div className="absolute -top-2.5 left-4 text-[10px] font-black uppercase tracking-widest text-sky-600 bg-sky-50 px-2">
                      Bước 1 — Xem chi tiết
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                      <LogIn className="size-5" />
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="font-bold text-slate-900">Đi tới trang quản lý đặt phòng</p>
                      <p className="text-xs leading-relaxed text-slate-600">
                        Tài khoản của bạn đã được đăng nhập. Hãy nhấn nút <span className="font-bold text-sky-700">"Xem chi tiết đặt phòng (đã đăng nhập)"</span> ở bên dưới để đi đến Portal lưu trú.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 — Voucher/Contract */}
                  {(() => {
                    const isConfirmedOrPaid = qPaymentStatus === "success" || bookingData.status === 1;
                    const isPayAtCounter = bookingData.paymentMethod === "pay_at_counter";

                    if (isConfirmedOrPaid) {
                      return (
                        <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <CreditCard className="size-5" />
                          </div>
                          <div className="space-y-1 text-sm text-slate-500">
                            <p className="font-bold text-slate-700">Nhận phiếu lưu trú &amp; ký hợp đồng điện tử</p>
                            <p className="text-xs leading-relaxed">
                              Tại trang quản lý đặt phòng, bạn có thể tải ngay <strong>Stay Voucher (Phiếu lưu trú)</strong> đã được phát hành hoặc thực hiện ký hợp đồng thuê điện tử.
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (isPayAtCounter) {
                      return (
                        <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <CreditCard className="size-5" />
                          </div>
                          <div className="space-y-1 text-sm text-slate-500">
                            <p className="font-bold text-slate-700">Thanh toán và làm thủ tục khi nhận phòng</p>
                            <p className="text-xs leading-relaxed">
                              Mang theo giấy tờ tùy thân và thực hiện thanh toán trực tiếp cho lễ tân khi check-in để nhận phòng.
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                          <CreditCard className="size-5" />
                        </div>
                        <div className="space-y-1 text-sm text-slate-500">
                          <p className="font-bold text-slate-700">Hoàn tất đặt cọc &amp; nhận phiếu lưu trú</p>
                          <p className="text-xs leading-relaxed">
                            Vào trang quản lý đặt phòng của bạn để thanh toán cọc trực tuyến và nhận <strong>Stay Voucher</strong>.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <>
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
                        <span className="font-bold text-slate-800">{bookingData.guestEmail || "email đăng ký"}</span>.{" "}
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

                  {/* Step 3 — Deposit / Counter / Voucher */}
                  {(() => {
                    const isConfirmedOrPaid = qPaymentStatus === "success" || bookingData.status === 1;
                    const isPayAtCounter = bookingData.paymentMethod === "pay_at_counter";

                    if (isConfirmedOrPaid) {
                      return (
                        <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <CreditCard className="size-5" />
                          </div>
                          <div className="space-y-1 text-sm text-slate-500">
                            <p className="font-bold text-slate-700">Nhận phiếu lưu trú &amp; ký hợp đồng điện tử</p>
                            <p className="text-xs leading-relaxed">
                              Đăng nhập vào hệ thống để kiểm tra <strong>Stay Voucher</strong> đã được phát hành hoặc thực hiện ký hợp đồng thuê điện tử (nếu có yêu cầu từ chủ nhà).
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (isPayAtCounter) {
                      return (
                        <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <CreditCard className="size-5" />
                          </div>
                          <div className="space-y-1 text-sm text-slate-500">
                            <p className="font-bold text-slate-700">Thanh toán và làm thủ tục khi nhận phòng</p>
                            <p className="text-xs leading-relaxed">
                              Mang theo giấy tờ tùy thân và thực hiện thanh toán trực tiếp cho lễ tân khi check-in để nhận phòng.
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
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
                    );
                  })()}
                </>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              {/* Primary reminder */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center">
                {isLoggedIn ? (
                  <p className="text-xs font-bold text-emerald-700">
                    ✅ Tài khoản của bạn đã được đăng nhập. Bạn có thể xem ngay chi tiết đặt phòng bên dưới.
                  </p>
                ) : (
                  <p className="text-xs font-bold text-amber-700">
                    {bookingData.paymentMethod === "online" && bookingData.status !== 1
                      ? "⚠️ Bạn cần kích hoạt tài khoản qua email trước khi có thể đăng nhập và thanh toán cọc."
                      : "⚠️ Bạn cần kích hoạt tài khoản qua email để có thể đăng nhập quản lý đặt phòng và ký hợp đồng lưu trú."}
                  </p>
                )}
              </div>

              {/* Only show shortcut if user is already logged in (returning guest) */}
              {isLoggedIn && (
                <Button asChild variant="outline" className="h-11 w-full rounded-2xl font-bold border-sky-300 text-sky-700 hover:bg-sky-50 gap-2">
                  <Link to={`/bks-stay/bookings/${bookingData.bookingId}`}>
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
