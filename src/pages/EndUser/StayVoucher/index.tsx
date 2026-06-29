import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import html2canvas from "html2canvas";
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  ShieldCheck,
  User,
  Phone,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ROUTERS } from "@/constant";
import stayService, { BookingDetail } from "@/services/stayService";
import { formatPrice } from "@/utils/utils";
import { toastSuccess, toastError } from "@/components/ui/toast";

const StayVoucher = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const voucherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      try {
        const res: any = await stayService.getBookingDetail(id);
        if (res.status === "success" && res.data) {
          setBooking(res.data);
        }
      } catch (err) {
        console.error(err);
        toastError(t("public.stayVoucher.loadError"));
      } finally {
        setLoading(false);
      }
    };
    void fetchBooking();
  }, [id, t]);

  const handleDownloadPng = async () => {
    if (!voucherRef.current) return;
    try {
      toastSuccess(t("public.stayVoucher.downloadPreparing"));
      const canvas = await html2canvas(voucherRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Stay_Voucher_BKS_${booking?.booking_code || id}.png`;
      link.href = dataUrl;
      link.click();
      toastSuccess(t("public.stayVoucher.downloadSuccess"));
    } catch (err) {
      console.error(err);
      toastError(t("public.stayVoucher.downloadError"));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spinner showText text={t("public.stayVoucher.loading")} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center">
        <p className="text-slate-700 font-bold">{t("public.stayVoucher.errors.notFound")}</p>
        <Button asChild className="mt-4 rounded-xl" variant="outline">
          <Link to={ROUTERS.BKS_STAY_HISTORY}>
            {t("public.stayVoucher.backToHistory")}
          </Link>
        </Button>
      </div>
    );
  }

  const isAuthorized = (booking.status === 1 || booking.status === 3 || booking.status === 4) && 
                       !(booking.payment_method === "online" && booking.payment_status !== "paid");

  if (!isAuthorized) {
    let errorMessage = t("public.stayVoucher.errors.defaultTitle");
    let errorDesc = t("public.stayVoucher.errors.defaultDesc");

    if (booking.status === 0) {
      errorMessage = t("public.stayVoucher.errors.pendingTitle");
      errorDesc = t("public.stayVoucher.errors.pendingDesc");
    } else if (booking.status === 2) {
      errorMessage = t("public.stayVoucher.errors.cancelledTitle");
      errorDesc = t("public.stayVoucher.errors.cancelledDesc");
    } else if (booking.payment_method === "online" && booking.payment_status !== "paid") {
      errorMessage = t("public.stayVoucher.errors.paymentTitle");
      errorDesc = t("public.stayVoucher.errors.paymentDesc");
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-slate-800">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-[28px] p-8 shadow-xl">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertCircle className="size-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">{errorMessage}</h2>
          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">{errorDesc}</p>
          <Button asChild className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 w-full h-11 font-bold" variant="default">
            <Link to={`/bks-stay/bookings/${id}`}>
              {t("public.stayVoucher.backToBooking")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const dateLocale = i18n.language === "en" ? "en-US" : "vi-VN";
  const checkInDate = new Date(booking.start_date).toLocaleDateString(dateLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const checkOutDate = new Date(booking.end_date).toLocaleDateString(dateLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const rentUnitLabel = booking.price?.unit === "month"
    ? t("public.stayVoucher.unitMonth")
    : t("public.stayVoucher.unitDay");
  const roomRentPrice = booking.price?.price
    ? `${formatPrice(booking.price.price)} VND/${rentUnitLabel}`
    : "";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
      {/* Top bar (Hidden in Print) */}
      <div className="mx-auto max-w-2xl mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Button variant="ghost" asChild className="h-10 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900">
          <Link to={`/bks-stay/bookings/${id}`} className="flex items-center gap-2">
            <ArrowLeft className="size-4" /> {t("public.stayVoucher.backToBooking")}
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPng} className="h-10 gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold px-4">
            <Download className="size-4" /> {t("public.stayVoucher.downloadPng")}
          </Button>
          <Button onClick={handlePrint} variant="outline" className="h-10 gap-2 rounded-xl border-slate-200 font-bold px-4 bg-white text-slate-700">
            <Printer className="size-4" /> {t("public.stayVoucher.printA4")}
          </Button>
        </div>
      </div>

      {/* Stay Voucher (Visible in Print, ID maps to CSS) */}
      <div className="mx-auto max-w-2xl">
        <div 
          ref={voucherRef}
          id="voucher-card-print"
          className="bg-white border border-slate-200 rounded-[24px] shadow-xl p-8 space-y-8 print:border-none print:shadow-none"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-6 text-emerald-600" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t("public.stayVoucher.confirmedBadge")}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900">{t("public.stayVoucher.title")}</h1>
              <p className="text-xs text-slate-500 font-medium">{t("public.stayVoucher.bookingCodeLabel")} <span className="font-mono font-bold text-slate-900 select-all">{booking.booking_code || id}</span></p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-lg font-black tracking-tight block">Stay <span className="text-sky-600">Portal</span></span>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">StayConnect System</span>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{t("public.stayVoucher.customerInfo")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100/60">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                    <User className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">{t("public.stayVoucher.guestLabel")}</span>
                    <span className="text-sm font-bold text-slate-800">{booking.user?.name || t("public.stayVoucher.guestFallback")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">{t("public.stayVoucher.phoneLabel")}</span>
                    <span className="text-sm font-bold text-slate-800">{booking.user?.phone || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{t("public.stayVoucher.propertyInfo")}</h2>
              <div className="rounded-2xl border border-slate-100 p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">{booking.room?.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{booking.room?.property?.name}</p>
                </div>
                {(booking.room?.property?.address_detail || booking.room?.property?.address) && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="size-4 shrink-0 text-slate-400" />
                    <span className="relative top-[1px]">{booking.room?.property?.address_detail || booking.room?.property?.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Check-in / Check-out */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-100 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar className="size-4 text-sky-500" />
                  <span>{t("public.stayVoucher.checkIn")}</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{checkInDate}</p>
                <p className="text-[11px] font-semibold text-slate-500">{t("public.stayVoucher.checkInTime")}</p>
              </div>

              <div className="rounded-2xl border border-slate-100 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar className="size-4 text-sky-500" />
                  <span>{t("public.stayVoucher.checkOut")}</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{checkOutDate}</p>
                <p className="text-[11px] font-semibold text-slate-500">{t("public.stayVoucher.checkOutTime")}</p>
              </div>
            </div>

            {/* Price details */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{t("public.stayVoucher.costDetails")}</h2>
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-3">{t("public.stayVoucher.categoryCol")}</th>
                      <th className="px-6 py-3 text-right">{t("public.stayVoucher.totalCol")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-6 py-4 font-semibold">{t("public.stayVoucher.roomRent", { price: roomRentPrice })}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{formatPrice(booking.total_amount || 0)} VNĐ</td>
                    </tr>
                    {booking.deposit_amount && booking.deposit_amount > 0 ? (
                      <tr>
                        <td className="px-6 py-4 font-semibold text-emerald-600">{t("public.stayVoucher.depositPaid")}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">-{formatPrice(booking.deposit_amount || 0)} VNĐ</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Signatures & Stamp Section */}
          <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-6">
            <div className="text-center italic text-slate-400 space-y-4">
              <p className="text-xs font-bold text-slate-500 not-italic">{t("public.stayVoucher.guestSignature")}</p>
              <div className="flex h-24 flex-col items-center justify-center">
                <p className="text-xs font-bold text-emerald-600 not-italic">{t("public.stayVoucher.autoConfirmed")}</p>
                <p className="mt-1 text-[9px] leading-tight opacity-75 not-italic text-slate-500">{t("public.stayVoucher.systemMatch")}<br/>{booking.booking_code || id}</p>
              </div>
            </div>
            <div className="text-center italic text-slate-400 space-y-4">
              <p className="text-xs font-bold text-slate-500 not-italic">{t("public.stayVoucher.partnerRep")}</p>
              <div className="flex h-24 items-center justify-center">
                <div className="relative flex size-24 select-none items-center justify-center rounded-full border-4 border-double border-red-500/80 p-1.5 text-red-500/80 font-black rotate-[-8deg] duration-300 hover:rotate-0">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[6px] font-black uppercase tracking-wider leading-none">{t("public.stayVoucher.stampCompany")}</span>
                    <span className="text-[8px] font-extrabold uppercase tracking-widest border-y border-red-500/80 my-0.5 py-0.5 px-1 leading-none">{t("public.stayVoucher.stampLine")}</span>
                    <span className="text-[6px] font-bold uppercase tracking-wider leading-none">{t("public.stayVoucher.stampSub")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation QR Mock */}
          <div className="flex flex-col items-center justify-center p-6 border-t border-slate-100/60 bg-slate-50/50 rounded-2xl gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-inner">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(booking.booking_code || id || "")}`}
                alt="Booking QR Code" 
                className="size-20 select-none object-contain"
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("public.stayVoucher.qrTitle")}</p>
            <p className="text-xs text-slate-500 font-semibold text-center leading-relaxed max-w-sm">
              {t("public.stayVoucher.qrDesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StayVoucher;
