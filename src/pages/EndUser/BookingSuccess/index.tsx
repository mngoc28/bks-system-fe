import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, Mail, KeyRound, CreditCard, LogIn, AlertCircle } from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const { t } = useTranslation();
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
      setUpdateError(t("public.bookingSuccess.emailInvalid"));
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
        setUpdateSuccess(t("public.bookingSuccess.emailUpdateSuccess"));
        setBookingData((prev: any) => prev ? { ...prev, guestEmail: newEmail.trim() } : null);
        setIsEditingEmail(false);
        setNewEmail("");
      } else {
        setUpdateError(res?.message || t("public.bookingSuccess.emailUpdateFailed"));
      }
    } catch (err: any) {
      console.error(err);
      setUpdateError(err?.response?.data?.message || t("public.bookingSuccess.emailUpdateFailed"));
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
            <p className="text-sm font-semibold text-slate-600">{t("public.bookingSuccess.loading")}</p>
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
          <p className="text-slate-700 font-medium">{t("public.bookingSuccess.emptyTitle")}</p>
          <p className="mt-3 text-sm text-slate-600 max-w-lg mx-auto">
            {t("public.bookingSuccess.emptyDescriptionBefore")}{" "}
            <Link to={ROUTERS.MY_BOOKINGS} className="font-semibold text-sky-600 underline-offset-2 hover:underline">
              {t("public.myBookings.title")}
            </Link>
            {t("public.bookingSuccess.emptyDescriptionAfter")}{" "}
            <Link to={ROUTERS.BKS_STAY_LOGIN} className="font-semibold text-sky-600 underline-offset-2 hover:underline">
              {t("public.bookingSuccess.signInBksStay")}
            </Link>
            {t("public.bookingSuccess.emptyDescriptionEnd")}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate(ROUTERS.MY_BOOKINGS)} className="rounded-full">{t("public.bookingSuccess.actions.lookupBooking")}</Button>
            <Button variant="secondary" className="border border-slate-300 bg-white text-slate-700 rounded-full" onClick={() => navigate(ROUTERS.SEARCH_ROOMS)}>
              {t("public.bookingSuccess.actions.searchOtherRooms")}
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const codeLabel = bookingData.bookingCode?.trim() || (bookingData.bookingId != null ? t("public.bookingSuccess.codeFallback", { id: bookingData.bookingId }) : "—");
  const isLoggedIn = !!getAccessToken() && !!userEmail && userEmail.toLowerCase() === bookingData.guestEmail?.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900">
      <PublicHeader />

      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1440px] py-2.5 px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: t("common.home"), href: ROUTERS.HOME },
              { label: t("public.bookingSuccess.breadcrumb") },
            ]}
            className="text-sm"
          />
        </div>
      </div>

      {/* Title & Description Section on clean white layout */}
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 sm:px-6 lg:px-8 space-y-2">
        <Badge className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200 transition-all duration-300">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 animate-bounce" />
          {t("public.bookingSuccess.badge")}
        </Badge>
        
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {t("public.bookingSuccess.title")}
        </h1>
        
        <p className="text-sm text-slate-500 max-w-4xl leading-relaxed">
          {t("public.bookingSuccess.subtitle")}
        </p>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="rounded-[32px] border-none bg-white p-8 shadow-xl shadow-slate-200/50">
          <CardContent className="space-y-8 p-0">
            {/* Minimal booking confirmation */}
            <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("public.bookingSuccess.bookingCodeLabel")}</span>
              <span className="text-xl font-mono font-black text-slate-900 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 select-all">
                {codeLabel}
              </span>
              {bookingData.guestEmail && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-semibold text-slate-500">
                    {t("public.bookingSuccess.emailSentTo", { email: bookingData.guestEmail })}
                  </p>
                  
                  {!isLoggedIn && (
                    <div className="flex flex-col items-center gap-1.5 mt-1">
                      {isEditingEmail ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2 max-w-sm w-full">
                          <input
                            type="email"
                            placeholder={t("public.bookingSuccess.emailPlaceholder")}
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
                              {isUpdating ? t("public.bookingSuccess.saving") : t("public.bookingSuccess.confirmEmail")}
                            </Button>
                            <Button 
                              onClick={() => {
                                setIsEditingEmail(false);
                                setUpdateError("");
                              }} 
                              variant="secondary"
                              className="h-8 text-[10px] px-3 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 rounded-lg"
                            >
                              {t("common.cancel")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsEditingEmail(true)} 
                          className="text-[11px] text-amber-600 hover:text-amber-700 font-bold underline underline-offset-2 transition-colors"
                        >
                          {t("public.bookingSuccess.fixEmailPrompt")}
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
                      <span>{t("public.bookingSuccess.status.confirmedPaid")}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                      {t("public.bookingSuccess.status.confirmedPaidDesc")}
                    </p>
                  </div>
                );
              }

              if (isPayAtCounter) {
                return (
                  <div className="rounded-2xl border border-blue-100 bg-[#eff6ff] p-6 text-center space-y-3 shadow-sm">
                    <div className="flex items-center justify-center gap-2 text-blue-600 font-bold">
                      <Clock className="size-5" />
                      <span>{t("public.bookingSuccess.status.payAtCounter")}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                      {t("public.bookingSuccess.status.payAtCounterDesc")}
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
                        <span>{t("public.bookingSuccess.status.pendingDeposit")}</span>
                      </div>
                      {qPaymentStatus === "failed" && (
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                          <AlertCircle className="size-4" />
                          <span>{t("public.bookingSuccess.status.paymentFailed")}</span>
                        </div>
                      )}
                      <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                        {t("public.bookingSuccess.status.pendingDepositDesc")}
                      </p>
                      <div className="py-1 max-w-xs mx-auto">
                        <Button asChild className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 font-bold text-white shadow-md hover:from-sky-600 hover:to-sky-700 transition-all h-10">
                          <Link to={`/bks-stay/bookings/${bookingData.bookingId}`}>
                            {t("public.bookingSuccess.actions.payDepositPortal")}
                          </Link>
                        </Button>
                      </div>
                      <div className="inline-block bg-slate-900 text-white font-mono text-2xl font-black px-6 py-2 rounded-xl tracking-wider shadow-inner">
                        {formatTime(timeLeft)}
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                        {t("public.bookingSuccess.gracePayment")}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2 text-amber-600 font-bold">
                        <AlertCircle className="size-5 animate-pulse" />
                        <span>{t("public.bookingSuccess.status.pendingEmailVerify")}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                        {t("public.bookingSuccess.status.pendingEmailVerifyDesc", { email: bookingData.guestEmail })}
                      </p>
                      <div className="inline-block bg-slate-900 text-white font-mono text-2xl font-black px-6 py-2 rounded-xl tracking-wider shadow-inner">
                        {formatTime(timeLeft)}
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                        {t("public.bookingSuccess.graceDeposit")}
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
                {t("public.bookingSuccess.nextSteps")}
              </h3>

              {isLoggedIn ? (
                <>
                  <div className="relative flex gap-4 p-4 rounded-2xl bg-sky-50 border-2 border-sky-300 shadow-sm">
                    <div className="absolute -top-2.5 left-4 text-[10px] font-black uppercase tracking-widest text-sky-600 bg-sky-50 px-2">
                      {t("public.bookingSuccess.steps.loggedIn.step1Badge")}
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                      <LogIn className="size-5" />
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="font-bold text-slate-900">{t("public.bookingSuccess.steps.loggedIn.step1Title")}</p>
                      <p className="text-xs leading-relaxed text-slate-600">
                        {t("public.bookingSuccess.steps.loggedIn.step1Desc")}
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
                            <p className="font-bold text-slate-700">{t("public.bookingSuccess.steps.loggedIn.step2VoucherTitle")}</p>
                            <p className="text-xs leading-relaxed">
                              {t("public.bookingSuccess.steps.loggedIn.step2VoucherDesc")}
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
                            <p className="font-bold text-slate-700">{t("public.bookingSuccess.steps.loggedIn.step2CounterTitle")}</p>
                            <p className="text-xs leading-relaxed">
                              {t("public.bookingSuccess.steps.loggedIn.step2CounterDesc")}
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
                          <p className="font-bold text-slate-700">{t("public.bookingSuccess.steps.loggedIn.step2DepositTitle")}</p>
                          <p className="text-xs leading-relaxed">
                            {t("public.bookingSuccess.steps.loggedIn.step2DepositDesc")}
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
                      {t("public.bookingSuccess.steps.guest.step1Badge")}
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                      <Mail className="size-5" />
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="font-bold text-slate-900">{t("public.bookingSuccess.steps.guest.step1Title")}</p>
                      <p className="text-xs leading-relaxed text-slate-600">
                        {t("public.bookingSuccess.steps.guest.step1Desc", {
                          email: bookingData.guestEmail || t("public.bookingSuccess.registeredEmail"),
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <KeyRound className="size-5" />
                    </div>
                    <div className="space-y-1 text-sm text-slate-500">
                      <p className="font-bold text-slate-700">{t("public.bookingSuccess.steps.guest.step2Title")}</p>
                      <p className="text-xs leading-relaxed">
                        {t("public.bookingSuccess.steps.guest.step2Desc")}
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
                            <p className="font-bold text-slate-700">{t("public.bookingSuccess.steps.guest.step3VoucherTitle")}</p>
                            <p className="text-xs leading-relaxed">
                              {t("public.bookingSuccess.steps.guest.step3VoucherDesc")}
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
                            <p className="font-bold text-slate-700">{t("public.bookingSuccess.steps.guest.step3CounterTitle")}</p>
                            <p className="text-xs leading-relaxed">
                              {t("public.bookingSuccess.steps.guest.step3CounterDesc")}
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
                          <p className="font-bold text-slate-700">{t("public.bookingSuccess.steps.guest.step3DepositTitle")}</p>
                          <p className="text-xs leading-relaxed">
                            {t("public.bookingSuccess.steps.guest.step3DepositDesc")}
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
                    ✅ {t("public.bookingSuccess.alerts.loggedInReady")}
                  </p>
                ) : (
                  <p className="text-xs font-bold text-amber-700">
                    {bookingData.paymentMethod === "online" && bookingData.status !== 1
                      ? `⚠️ ${t("public.bookingSuccess.alerts.needActivateDeposit")}`
                      : `⚠️ ${t("public.bookingSuccess.alerts.needActivateManage")}`}
                  </p>
                )}
              </div>

              {/* Only show shortcut if user is already logged in (returning guest) */}
              {isLoggedIn && (
                <Button asChild variant="outline" className="h-11 w-full rounded-2xl font-bold border-sky-300 text-sky-700 hover:bg-sky-50 gap-2">
                  <Link to={`/bks-stay/bookings/${bookingData.bookingId}`}>
                    <LogIn className="size-4" />
                    <span>{t("public.bookingSuccess.actions.viewBookingLoggedIn")}</span>
                  </Link>
                </Button>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="secondary" className="h-12 flex-1 rounded-2xl border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50">
                  <Link to={ROUTERS.HOME}>
                    {t("public.bookingSuccess.actions.backHome")}
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="h-12 flex-1 rounded-2xl border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50">
                  <Link to={ROUTERS.SEARCH_ROOMS}>
                    {t("public.bookingSuccess.actions.continueSearch")}
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
