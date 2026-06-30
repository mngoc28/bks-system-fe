import { useState, useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, Mail, KeyRound, CreditCard, LogIn, AlertCircle } from "lucide-react";

type StepItemProps = {
  step: number;
  icon: ReactNode;
  title: string;
  description: string;
  highlighted?: boolean;
  badge?: string;
};

const StepItem = ({ step, icon, title, description, highlighted, badge }: StepItemProps) => (
  <li
    className={
      highlighted
        ? "flex gap-3 border-l-4 border-sky-500 bg-sky-50/50 py-3 pl-4"
        : "flex gap-3 border-l-4 border-transparent py-3 pl-4"
    }
  >
    <div
      className={
        highlighted
          ? "flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600"
          : "flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400"
      }
      aria-hidden="true"
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1 space-y-0.5 text-sm">
      {badge && (
        <span className="text-[10px] font-black uppercase tracking-widest text-sky-600">{badge}</span>
      )}
      <p className={highlighted ? "font-bold text-slate-900" : "font-bold text-slate-700"}>
        <span className="sr-only">{`Bước ${step}: `}</span>
        {title}
      </p>
      <p className="text-xs leading-relaxed text-slate-600">{description}</p>
    </div>
  </li>
);

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
  const isConfirmedOrPaid = qPaymentStatus === "success" || bookingData.status === 1;
  const isPayAtCounter = bookingData.paymentMethod === "pay_at_counter";
  const showGraceTimer = !isConfirmedOrPaid && !isPayAtCounter;

  const renderLoggedInStep2 = () => {
    if (isConfirmedOrPaid) {
      return (
        <StepItem
          step={2}
          icon={<CreditCard className="size-4" />}
          title={t("public.bookingSuccess.steps.loggedIn.step2VoucherTitle")}
          description={t("public.bookingSuccess.steps.loggedIn.step2VoucherDesc")}
        />
      );
    }
    if (isPayAtCounter) {
      return (
        <StepItem
          step={2}
          icon={<CreditCard className="size-4" />}
          title={t("public.bookingSuccess.steps.loggedIn.step2CounterTitle")}
          description={t("public.bookingSuccess.steps.loggedIn.step2CounterDesc")}
        />
      );
    }
    return (
      <StepItem
        step={2}
        icon={<CreditCard className="size-4" />}
        title={t("public.bookingSuccess.steps.loggedIn.step2DepositTitle")}
        description={t("public.bookingSuccess.steps.loggedIn.step2DepositDesc")}
      />
    );
  };

  const renderGuestStep3 = () => {
    if (isConfirmedOrPaid) {
      return (
        <StepItem
          step={3}
          icon={<CreditCard className="size-4" />}
          title={t("public.bookingSuccess.steps.guest.step3VoucherTitle")}
          description={t("public.bookingSuccess.steps.guest.step3VoucherDesc")}
        />
      );
    }
    if (isPayAtCounter) {
      return (
        <StepItem
          step={3}
          icon={<CreditCard className="size-4" />}
          title={t("public.bookingSuccess.steps.guest.step3CounterTitle")}
          description={t("public.bookingSuccess.steps.guest.step3CounterDesc")}
        />
      );
    }
    return (
      <StepItem
        step={3}
        icon={<CreditCard className="size-4" />}
        title={t("public.bookingSuccess.steps.guest.step3DepositTitle")}
        description={t("public.bookingSuccess.steps.guest.step3DepositDesc")}
      />
    );
  };

  const renderStatusPanel = () => {
    if (isConfirmedOrPaid) {
      return (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm">
            <CheckCircle2 className="size-5" aria-hidden="true" />
            <span>{t("public.bookingSuccess.status.confirmedPaid")}</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t("public.bookingSuccess.status.confirmedPaidDesc")}
          </p>
        </div>
      );
    }

    if (isPayAtCounter) {
      return (
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm">
            <Clock className="size-5" aria-hidden="true" />
            <span>{t("public.bookingSuccess.status.payAtCounter")}</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t("public.bookingSuccess.status.payAtCounterDesc")}
          </p>
        </div>
      );
    }

    if (isLoggedIn) {
      return (
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-5 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-rose-600 font-bold text-sm">
            <Clock className="size-5 animate-pulse" aria-hidden="true" />
            <span>{t("public.bookingSuccess.status.pendingDeposit")}</span>
          </div>
          {qPaymentStatus === "failed" && (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
              <AlertCircle className="size-4" aria-hidden="true" />
              <span>{t("public.bookingSuccess.status.paymentFailed")}</span>
            </div>
          )}
          <p className="text-sm text-slate-600 leading-relaxed">
            {t("public.bookingSuccess.status.pendingDepositDesc")}
          </p>
          {showGraceTimer && (
            <>
              <div
                role="timer"
                aria-live="polite"
                aria-atomic="true"
                className="inline-block bg-slate-900 text-white font-mono text-2xl font-black px-6 py-2 rounded-xl tracking-wider"
              >
                {formatTime(timeLeft)}
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                {t("public.bookingSuccess.gracePayment")}
              </p>
            </>
          )}
          <Button asChild className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 font-bold text-white shadow-md hover:from-sky-600 hover:to-sky-700 h-10">
            <Link to={`/bks-stay/bookings/${bookingData.bookingId}`}>
              {t("public.bookingSuccess.actions.payDepositPortal")}
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-amber-600 font-bold text-sm">
          <AlertCircle className="size-5 animate-pulse" aria-hidden="true" />
          <span>{t("public.bookingSuccess.status.pendingEmailVerify")}</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          {t("public.bookingSuccess.status.pendingEmailVerifyDesc", { email: bookingData.guestEmail })}
        </p>
        {showGraceTimer && (
          <>
            <div
              role="timer"
              aria-live="polite"
              aria-atomic="true"
              className="inline-block bg-slate-900 text-white font-mono text-2xl font-black px-6 py-2 rounded-xl tracking-wider"
            >
              {formatTime(timeLeft)}
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
              {t("public.bookingSuccess.graceDeposit")}
            </p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900">
      <PublicHeader />

      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl py-2.5 px-4 sm:px-6">
          <Breadcrumb
            items={[
              { label: t("common.home"), href: ROUTERS.HOME },
              { label: t("public.bookingSuccess.breadcrumb") },
            ]}
            className="text-sm"
          />
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-6 md:py-8 sm:px-6">
        <div className="mb-6 flex flex-col items-center text-center space-y-2">
          <Badge className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            {t("public.bookingSuccess.badge")}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t("public.bookingSuccess.title")}
          </h1>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            {t("public.bookingSuccess.subtitle")}
          </p>
        </div>

        <Card className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
          <CardContent className="space-y-6 p-0">
            {/* Row 1: Booking identity | Status + timer */}
            <div className="grid gap-6 border-b border-slate-100 pb-6 lg:grid-cols-5 lg:gap-8">
              <div className="flex flex-col items-center text-center space-y-3 lg:col-span-2 lg:items-start lg:text-left lg:border-r lg:border-slate-100 lg:pr-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t("public.bookingSuccess.bookingCodeLabel")}
                </span>
                <span className="text-xl font-mono font-black text-slate-900 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 select-all w-full text-center lg:text-left">
                  {codeLabel}
                </span>
                {bookingData.guestEmail && (
                  <div className="flex w-full flex-col items-center gap-2 lg:items-start">
                    <p className="text-xs font-semibold text-slate-500">
                      {t("public.bookingSuccess.emailSentTo", { email: bookingData.guestEmail })}
                    </p>
                    {!isLoggedIn && (
                      <div className="flex w-full flex-col items-center gap-1.5 lg:items-start">
                        {isEditingEmail ? (
                          <div className="flex w-full max-w-sm flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                            <input
                              type="email"
                              placeholder={t("public.bookingSuccess.emailPlaceholder")}
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              className="h-8 w-full text-xs px-3 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                              aria-label={t("public.bookingSuccess.emailPlaceholder")}
                            />
                            <div className="flex shrink-0 gap-1.5">
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
                            type="button"
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

              <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
                {renderStatusPanel()}
              </div>
            </div>

            {/* Row 2: Next steps stepper */}
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
                {t("public.bookingSuccess.nextSteps")}
              </h3>

              <ol className="divide-y divide-slate-100" aria-label={t("public.bookingSuccess.nextSteps")}>
                {isLoggedIn ? (
                  <>
                    <StepItem
                      step={1}
                      highlighted
                      badge={t("public.bookingSuccess.steps.loggedIn.step1Badge")}
                      icon={<LogIn className="size-4" />}
                      title={t("public.bookingSuccess.steps.loggedIn.step1Title")}
                      description={t("public.bookingSuccess.steps.loggedIn.step1Desc")}
                    />
                    {renderLoggedInStep2()}
                  </>
                ) : (
                  <>
                    <StepItem
                      step={1}
                      highlighted
                      badge={t("public.bookingSuccess.steps.guest.step1Badge")}
                      icon={<Mail className="size-4" />}
                      title={t("public.bookingSuccess.steps.guest.step1Title")}
                      description={t("public.bookingSuccess.steps.guest.step1Desc", {
                        email: bookingData.guestEmail || t("public.bookingSuccess.registeredEmail"),
                      })}
                    />
                    <StepItem
                      step={2}
                      icon={<KeyRound className="size-4" />}
                      title={t("public.bookingSuccess.steps.guest.step2Title")}
                      description={t("public.bookingSuccess.steps.guest.step2Desc")}
                    />
                    {renderGuestStep3()}
                  </>
                )}
              </ol>
            </div>

            {/* Row 3: Alert + Actions */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-center">
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

              {isLoggedIn && (
                <Button asChild variant="outline" className="h-11 w-full rounded-xl font-bold border-sky-300 text-sky-700 hover:bg-sky-50 gap-2">
                  <Link to={`/bks-stay/bookings/${bookingData.bookingId}`}>
                    <LogIn className="size-4" aria-hidden="true" />
                    <span>{t("public.bookingSuccess.actions.viewBookingLoggedIn")}</span>
                  </Link>
                </Button>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {isLoggedIn && (isConfirmedOrPaid || isPayAtCounter) ? (
                  <>
                    <Button asChild className="h-11 flex-1 rounded-xl font-bold sm:order-2">
                      <Link to={ROUTERS.SEARCH_ROOMS}>
                        {t("public.bookingSuccess.actions.continueSearch")}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-11 flex-1 rounded-xl font-bold sm:order-1">
                      <Link to={ROUTERS.HOME}>
                        {t("public.bookingSuccess.actions.backHome")}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="h-11 flex-1 rounded-xl font-bold sm:order-2">
                      <Link to={ROUTERS.SEARCH_ROOMS}>
                        {t("public.bookingSuccess.actions.continueSearch")}
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="h-11 flex-1 rounded-xl font-bold text-slate-600 sm:order-1">
                      <Link to={ROUTERS.HOME}>
                        {t("public.bookingSuccess.actions.backHome")}
                      </Link>
                    </Button>
                  </>
                )}
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
