import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { 
  CalendarDays, 
  MapPin, 
  Wifi, 
  Key, 
  PhoneCall, 
  MessageSquare, 
  AlertCircle,
  ChevronRight,
  Zap,
  Coffee,
  ArrowLeft,
  Share2,
  Info,
  ExternalLink,
  Copy,
  CheckCircle2,
  CreditCard,
  User,
  BedDouble,
  CookingPot,
  ShowerHead,
  Tv,
  Refrigerator,
  WashingMachine,
  Mountain,
  Shield,
  AirVent,
  Plus,
  Check,
  Sparkles,
  Eraser,
  Stethoscope,
  Printer,
  ParkingCircle,
  Waves,
  Plane,
  X,
  History,
  FileText,
  ArrowRight,
  Clock,
  QrCode,
  Download,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Label } from "@/components/ui/label";
import { PlainTextarea as Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTERS } from "@/constant";
import {
  computeBookingRoomStayTotal,
  computeBookingServicesTotal,
  computeBookingTotalAmount,
} from "@/utils/bookingAmount";
import {
  BOOKING_DAYS_LABEL,
  countBookingNights,
  countBookingDaysInclusive,
  formatBookingNightsCount,
  formatBookingDaysCount,
  BOOKING_NIGHTS_LABEL,
  formatRoomRentalLineLabel,
} from "@/utils/dateUtils";
import { formatPrice } from "@/utils/utils";
import { toastSuccess, toastError, toastInfo } from "@/components/ui/toast";
import { useUserStore } from "@/store/useUserStore";
import { Star } from "lucide-react";
import { useBookingReviewsQuery, useSubmitReviewMutation } from "@/hooks/useReviewQuery";
import { useUploadImageMutation } from "@/hooks/useCloudinariQuery";

import stayService, {
  BookingDetail as IBookingDetail,
  type StayCancellationReason,
} from "@/services/stayService";
import { parseStayCancellationError } from "@/utils/stayCancellationError";

const getAmenityIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("wifi")) return Wifi;
    if (n.includes("ti vi") || n.includes("tv")) return Tv;
    if (n.includes("tủ lạnh") || n.includes("fridge")) return Refrigerator;
    if (n.includes("máy giặt") || n.includes("washing")) return WashingMachine;
    if (n.includes("bếp") || n.includes("kitchen")) return CookingPot;
    if (n.includes("ban công") || n.includes("balcony")) return Mountain;
    if (n.includes("bảo vệ") || n.includes("security")) return Shield;
    if (n.includes("điều hòa") || n.includes("máy lạnh") || n.includes("air")) return AirVent;
    if (n.includes("tắm") || n.includes("shower")) return ShowerHead;
    return Check;
};

const getServiceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("bữa sáng") || n.includes("breakfast")) return Coffee;
    if (n.includes("massage")) return Sparkles;
    if (n.includes("dọn phòng") || n.includes("cleaning")) return Eraser;
    if (n.includes("điện nước") || n.includes("electricity")) return Zap;
    if (n.includes("y tế") || n.includes("medical")) return Stethoscope;
    if (n.includes("in ấn") || n.includes("print")) return Printer;
    if (n.includes("bãi đỗ") || n.includes("parking")) return ParkingCircle;
    if (n.includes("giặt ủi") || n.includes("laundry")) return Waves;
    if (n.includes("đưa đón") || n.includes("airport") || n.includes("shuttle")) return Plane;
    return CheckCircle2;
};

const Confetti = () => {
  const colors = ['#0ea5e9', '#6366f1', '#f59e0b', '#ec4899', '#10b981'];
  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animation: `confetti-fall ${3 + Math.random() * 4}s linear forwards`,
            animationDelay: `${Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          25% { transform: translateY(25vh) rotate(180deg) translateX(20px); }
          50% { transform: translateY(50vh) rotate(360deg) translateX(-20px); }
          75% { transform: translateY(75vh) rotate(540deg) translateX(20px); }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const hasConfirmedParam = searchParams.get("confirmed") === "true";
    if (!hasConfirmedParam || !id) return;

    const sessionKey = `confirmed_toast_shown_${id}`;
    if (sessionStorage.getItem(sessionKey)) {
      setSearchParams({}, { replace: true });
      return;
    }

    sessionStorage.setItem(sessionKey, "true");
    setShowCelebration(true);
    toastSuccess("Tuyệt vời! Kỳ nghỉ của bạn đã chính thức được xác nhận.");
    setSearchParams({}, { replace: true });
    setTimeout(() => setShowCelebration(false), 8000);
  }, [searchParams, setSearchParams, id]);

  const [showCelebration, setShowCelebration] = useState(false);
  const { userName } = useUserStore();
  const [showWifi, setShowWifi] = useState(false);
  const [booking, setBooking] = useState<IBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, isStarted: false });

  // Reviews queries and states
  const { data: bookingReviews, isLoading: isLoadingReviews } = useBookingReviewsQuery(Number(id), {
    enabled: !!id && (booking?.status === 3 || booking?.stay_status === 'checked_out')
  });
  const submitReviewMutation = useSubmitReviewMutation();

  const [roomRating, setRoomRating] = useState<number>(5);
  const [roomComment, setRoomComment] = useState<string>("");
  const [partnerRating, setPartnerRating] = useState<number>(5);
  const [partnerComment, setPartnerComment] = useState<string>("");

  // States for professional flows
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedReasonCode, setSelectedReasonCode] = useState("");
  const [reasonNote, setReasonNote] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawCountdown, setWithdrawCountdown] = useState<number | null>(null);
  const [withdrawIntervalId, setWithdrawIntervalId] = useState<any>(null);
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] = useState(false);
  const [paymentMethodSubmitting, setPaymentMethodSubmitting] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [isRulesDialogOpen, setIsRulesDialogOpen] = useState(false);

  const uploadMutation = useUploadImageMutation();
  const [isDragging, setIsDragging] = useState(false);
  const [graceTimeLeft, setGraceTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!booking || booking.deposit_status !== "pending") return;

    const createdAt = new Date(booking.created_at).getTime();
    const start = new Date(booking.start_date).getTime();
    const now = new Date().getTime();

    const isWithin48h = (start - createdAt) <= 172800000;
    const graceDuration = isWithin48h ? 2 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
    const expirationTime = createdAt + graceDuration;

    const remaining = Math.max(0, Math.floor((expirationTime - now) / 1000));
    setGraceTimeLeft(remaining);

    const timer = setInterval(() => {
      const currentNow = new Date().getTime();
      const currentRemaining = Math.max(0, Math.floor((expirationTime - currentNow) / 1000));
      setGraceTimeLeft(currentRemaining);
      if (currentRemaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking]);

  const formatGraceTime = (seconds: number | null) => {
    if (seconds === null) return "00:00:00";
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleFileUpload = async (file: File) => {
    if (!booking) return;
    if (!canPayDeposit) {
      toastError("Vui lòng ký hợp đồng thuê trước khi thanh toán tiền đặt cọc.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toastError("Vui lòng tải lên một file ảnh hợp lệ (PNG/JPG/JPEG).");
      return;
    }

    try {
      toastInfo("Đang tải ảnh biên lai lên hệ thống...");
      const uploadRes = await uploadMutation.mutateAsync({
        image: file,
        folder: "booking-deposits",
      });

      if (uploadRes?.data?.url) {
        const imageUrl = uploadRes.data.url;
        const submitRes: any = await stayService.submitReceipt(booking.id, imageUrl);
        if (submitRes.status === "success" || submitRes.success) {
          toastSuccess("Gửi biên lai thành công! Đang chờ đối tác xác thực cọc.");
          void reloadBookingDetail();
        } else {
          toastError(submitRes.message || "Không thể gửi biên lai cọc.");
        }
      } else {
        toastError("Tải ảnh biên lai thất bại.");
      }
    } catch (e: any) {
      toastError(e?.message || "Đã xảy ra lỗi khi tải ảnh.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void handleFileUpload(e.target.files[0]);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toastSuccess(`Đã sao chép ${label}!`);
  };

  const reloadBookingDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res: any = await stayService.getBookingDetail(id);
      if (res.status === "success") {
        const resData = res.data as IBookingDetail;
        setBooking(resData);

        const start = new Date(resData.start_date);
        const end = new Date(resData.end_date);
        const now = new Date();

        if (now >= start && now <= end) {
          setCountdown({ days: 0, hours: 0, mins: 0, isStarted: true });
        } else {
          const diff = start.getTime() - now.getTime();
          if (diff > 0) {
            setCountdown({
              days: Math.floor(diff / (1000 * 60 * 60 * 24)),
              hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
              mins: Math.floor((diff / (1000 * 60)) % 60),
              isStarted: false,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch booking detail", error);
      toastError("Không thể tải thông tin đặt phòng.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (searchParams.get("confirmed") === "true") {
      void reloadBookingDetail();
    }
  }, [searchParams, reloadBookingDetail]);

  useEffect(() => {
    void reloadBookingDetail();
  }, [reloadBookingDetail]);

  const canLoadCancelReasons = booking !== null && (booking.status === 0 || booking.status === 1);

  const reasonsQuery = useQuery({
    queryKey: ["stay", "cancellation-reasons"],
    enabled: canLoadCancelReasons,
    queryFn: async (): Promise<StayCancellationReason[]> => {
      const res = (await stayService.getCancellationReasons()) as unknown as {
        status?: string;
        data?: StayCancellationReason[];
      };
      if (res.status !== "success" || !Array.isArray(res.data)) {
        return [];
      }
      return res.data;
    },
    retry: false,
  });

  const reasonsForbidden =
    reasonsQuery.isError &&
    isAxiosError(reasonsQuery.error) &&
    reasonsQuery.error.response?.status === 403;

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const t = window.setTimeout(() => setCooldownRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [cooldownRemaining]);

  useEffect(() => {
    if (!isCancelDialogOpen || booking?.status !== 1) return;
    const k =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `idem-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    setIdempotencyKey(k);
  }, [isCancelDialogOpen, booking?.status]);

  useEffect(() => {
    const rows = reasonsQuery.data;
    if (!rows?.length) return;
    if (!selectedReasonCode || !rows.some((r) => r.code === selectedReasonCode)) {
      setSelectedReasonCode(rows[0].code);
    }
  }, [reasonsQuery.data, selectedReasonCode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.isStarted) return prev;
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59 };
        return prev;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Polling for booking status when it is PENDING (0)
  useEffect(() => {
    if (!booking || booking.status !== 0) return;

    const interval = setInterval(async () => {
      try {
        const res: any = await stayService.getBookingDetail(id!);
        if (res.status === "success") {
          const resData = res.data as IBookingDetail;
          if (resData.status === 1) {
            clearInterval(interval);
            void reloadBookingDetail();
            
            const sessionKey = `confirmed_toast_shown_${id}`;
            if (!sessionStorage.getItem(sessionKey)) {
              sessionStorage.setItem(sessionKey, "true");
              setShowCelebration(true);
              toastSuccess("Tuyệt vời! Kỳ nghỉ của bạn đã chính thức được xác nhận.");
              setTimeout(() => setShowCelebration(false), 8000);
            }
          } else if (resData.status !== 0) {
            clearInterval(interval);
            void reloadBookingDetail();
          }
        }
      } catch (error) {
        console.error("Failed to poll booking status", error);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [booking?.status, id, reloadBookingDetail]);

  // Polling khi đang chờ thanh toán phần còn lại (QR trên trang chi tiết / webhook SePay)
  useEffect(() => {
    if (!id || !booking) return;
    if (booking.status !== 1) return;
    if (booking.payment_method !== "online") return;
    if (booking.payment_status !== "partially_paid") return;

    const interval = setInterval(async () => {
      try {
        const res: any = await stayService.getBookingDetail(id);
        if (res.status !== "success") return;

        const resData = res.data as IBookingDetail;
        const remaining = resData.amount_remaining ?? 0;
        if (resData.payment_status === "paid" || remaining <= 0) {
          clearInterval(interval);
          setBooking(resData);
          toastSuccess("Thanh toán thành công! Đơn phòng đã được thanh toán đủ.");
        }
      } catch (error) {
        console.error("Failed to poll remainder payment status", error);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [id, booking?.status, booking?.payment_method, booking?.payment_status]);

  useEffect(() => {
    return () => {
      if (withdrawIntervalId) {
        clearInterval(withdrawIntervalId);
      }
    };
  }, [withdrawIntervalId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <AlertCircle className="mb-4 size-12 text-slate-200" />
        <h2 className="text-xl font-bold text-slate-900">Không tìm thấy đơn đặt phòng</h2>
        <Button asChild variant="link" className="mt-2 text-sky-600">
          <Link to={ROUTERS.BKS_STAY_HISTORY}>Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  const handleShare = () => {
    const text = `Thông tin đặt phòng BKS Stay: ${booking.room?.title} tại ${booking.room?.property?.address}. Mã đơn: ${booking.id}`;
    navigator.clipboard.writeText(text);
    toastSuccess("Đã sao chép liên kết vào bộ nhớ tạm!");
  };

  const openInMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.room?.property?.address || "")}`, "_blank");
  };

  const handleCancelBooking = async () => {
    if (!selectedReasonCode) {
      toastError("Vui lòng chọn lý do.");
      return;
    }
    const reasons = reasonsQuery.data ?? [];
    const row = reasons.find((r) => r.code === selectedReasonCode);
    if (row?.requires_note && reasonNote.trim() === "") {
      toastError("Vui lòng nhập chi tiết cho lý do đã chọn.");
      return;
    }
    setCancelSubmitting(true);
    try {
      if (booking.status === 0) {
        await stayService.cancelBooking(booking.id, {
          reason_code: selectedReasonCode,
          ...(reasonNote.trim() !== "" ? { reason_text: reasonNote.trim() } : {}),
        });
        toastSuccess("Đã hủy đặt phòng.");
      } else if (booking.status === 1) {
        await stayService.cancelBookingRequest(booking.id, {
          reason_code: selectedReasonCode,
          reason_text: reasonNote.trim() || undefined,
          idempotency_key: idempotencyKey || `idem-${Date.now()}`,
        });
        toastSuccess("Đã gửi yêu cầu hủy. Partner sẽ xử lý.");
      } else {
        toastError("Trạng thái đơn không cho phép thao tác này.");
        setCancelSubmitting(false);
        return;
      }
      setIsCancelDialogOpen(false);
      setReasonNote("");
      await reloadBookingDetail();
    } catch (e) {
      const p = parseStayCancellationError(e);
      if (p.retryAfterSeconds != null && p.retryAfterSeconds > 0) {
        setCooldownRemaining(p.retryAfterSeconds);
      }
      toastError(p.message);
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleWithdrawClick = () => {
    if (!booking) return;

    if (withdrawCountdown !== null) {
      // User clicked "Hoàn tác" -> Cancel countdown
      if (withdrawIntervalId) {
        clearInterval(withdrawIntervalId);
      }
      setWithdrawCountdown(null);
      setWithdrawIntervalId(null);
      toastSuccess("Đã hoàn tác. Yêu cầu hủy đặt phòng vẫn được giữ lại.");
      return;
    }

    // Start 15s countdown
    setWithdrawCountdown(15);
    const interval = setInterval(() => {
      setWithdrawCountdown((prev) => {
        if (prev === null) {
          clearInterval(interval);
          return null;
        }
        if (prev <= 1) {
          clearInterval(interval);
          setWithdrawIntervalId(null);
          // Trigger actual withdrawal API call
          void triggerWithdrawCancelRequest();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    setWithdrawIntervalId(interval);
  };

  const triggerWithdrawCancelRequest = async () => {
    if (!booking) return;
    setWithdrawSubmitting(true);
    try {
      await stayService.withdrawCancelBookingRequest(booking.id);
      toastSuccess("Đã rút yêu cầu hủy đặt phòng thành công. Kỳ nghỉ của bạn vẫn được giữ nguyên!");
      await reloadBookingDetail();
    } catch (_e) {
      toastError("Không thể rút yêu cầu hủy phòng. Vui lòng thử lại sau.");
    } finally {
      setWithdrawSubmitting(false);
      setWithdrawCountdown(null);
    }
  };

  const handleChangePaymentMethod = async () => {
    if (!booking) return;
    const newMethod = booking.payment_method === "online" ? "pay_at_counter" : "online";
    setPaymentMethodSubmitting(true);
    try {
      await stayService.changePaymentMethod(booking.id, newMethod);
      const label = newMethod === "online" ? "Thanh toán trực tuyến" : "Thanh toán tại quầy";
      toastSuccess(`Đã đổi sang ${label} thành công!`);
      setIsPaymentMethodDialogOpen(false);
      await reloadBookingDetail();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Không thể đổi phương thức thanh toán. Vui lòng thử lại.";
      toastError(msg);
    } finally {
      setPaymentMethodSubmitting(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!booking) return;
    const content = `HOA DON DIEN TU BKS STAY
--------------------------------------------------
Ma don dat phong: ${booking.id}
Ma dat phong: ${booking.booking_code || "N/A"}
Ten phong: ${booking.room?.title || "Phong nghi"}
Co so luu tru: ${booking.room?.property?.name || "BKS Stay Property"}
Khach hang: ${userName || "Khach hang"}
Ngay nhan phong: ${new Date(booking.start_date).toLocaleDateString("vi-VN")}
Ngay tra phong: ${new Date(booking.end_date).toLocaleDateString("vi-VN")}
Phuong thuc thanh toan: ${booking.payment_method === "online" ? "Thanh toan truc tuyen" : "Thanh toan tai quay"}
Trang thai thanh toan: ${booking.payment_status === "paid" ? "Da thanh toan" : "Chua thanh toan"}

CHI TIET THANH TOAN:
Tien phong: ${formatPrice(booking.price?.price)}
So dem luu tru: ${bookingDays}
Tong cong: ${formatPrice(totalAmount)}
(Da bao gom 10% VAT va phi dich vu)

--------------------------------------------------
Hoa don nay duoc tao tu dong boi he thong BKS Stay.
Cam on quy khach da tin tuong va su dung dich vu!
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Hoa_Don_BKS_Stay_${booking.id}.txt`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess("Hóa đơn điện tử đã được tải xuống!");
  };

  const handleReschedule = async () => {
    if (!booking) return;
    if (!newStartDate || !newEndDate) {
      toastError("Vui lòng chọn đầy đủ ngày nhận và trả phòng mới.");
      return;
    }
    
    const currentEndDate = booking.end_date;
    if (newEndDate > currentEndDate && newStartDate === booking.start_date) {
      try {
        await stayService.extendBooking(booking.id, newEndDate);
        toastSuccess(`Yêu cầu gia hạn lưu trú đến ngày ${new Date(newEndDate).toLocaleDateString("vi-VN")} đã được gửi thành công!`);
        setIsRescheduleDialogOpen(false);
        await reloadBookingDetail();
      } catch {
        toastError("Không thể gửi yêu cầu gia hạn ngày trả phòng. Vui lòng thử lại.");
      }
    } else {
      toastInfo("Yêu cầu thay đổi ngày lưu trú đang được xử lý. Lễ tân sẽ liên hệ xác nhận tình trạng phòng trống.");
      setIsRescheduleDialogOpen(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!booking) return;
    try {
      await submitReviewMutation.mutateAsync({
        booking_id: booking.id,
        room_rating: roomRating,
        room_comment: roomComment.trim() || undefined,
        partner_rating: partnerRating,
        partner_comment: partnerComment.trim() || undefined,
      });
    } catch (_e) {
      // handled in mutation
    }
  };

  const priceInput = { price: booking.price?.price, unit: booking.price?.unit };
  const isMonthlyRate = (priceInput.unit ?? "night").toLowerCase() === "month";
  const bookingDays = isMonthlyRate
    ? countBookingDaysInclusive(booking.start_date, booking.end_date)
    : countBookingNights(booking.start_date, booking.end_date);
  const roomStayTotal = computeBookingRoomStayTotal({
    start_date: booking.start_date,
    end_date: booking.end_date,
    price: priceInput,
  });
  const servicesTotal = computeBookingServicesTotal(booking.services);
  const totalAmount = computeBookingTotalAmount({
    start_date: booking.start_date,
    end_date: booking.end_date,
    price: priceInput,
    services: booking.services,
    total_amount: booking.total_amount,
  });
  const amountPaid = booking.amount_paid ?? (
    booking.payment_status === "paid"
      ? totalAmount
      : ["confirmed_by_partner", "held_in_escrow"].includes(booking.deposit_status ?? "") && booking.deposit_amount
        ? Number(booking.deposit_amount)
        : 0
  );
  const amountRemaining = booking.amount_remaining ?? Math.max(0, totalAmount - amountPaid);
  const showRemainderPaymentCard =
    booking.payment_method === "online" &&
    booking.payment_status === "partially_paid" &&
    amountRemaining > 0;

  const propertyTypeSlug = booking.room?.property?.property_type?.slug ?? "";
  const isLongTerm =
    ['can-ho', 'apartment', 'can-ho-dich-vu'].includes(propertyTypeSlug.toLowerCase()) ||
    booking.contracts?.some((c) => c.contract_type === 'LEASE_AGREEMENT') ||
    booking.price?.unit === 'month';

  const isPartnerConfirmed = booking.status === 1;
  const leaseContract = booking.contracts?.find(
    (contract) => contract.contract_type === "LEASE_AGREEMENT",
  ) ?? (isLongTerm ? booking.contracts?.[0] : undefined);
  const hasPendingContract = booking.contracts?.some((c) => c.status === 0) ?? false;
  const isLeaseContractSigned = leaseContract != null && leaseContract.status !== 0;
  const canPayDeposit = !isLongTerm || isLeaseContractSigned;
  const showDepositPaymentCard =
    Boolean(booking.deposit_amount && booking.deposit_amount > 0) &&
    (booking.deposit_status === "pending" || booking.deposit_status === "payment_submitted");
  const showDepositPaymentBlockedCard =
    showDepositPaymentCard && booking.deposit_status === "pending" && !canPayDeposit;
  const showDepositPaymentActiveCard =
    showDepositPaymentCard && !showDepositPaymentBlockedCard;
  const showContractSignCard =
    booking.status === 0 ||
    (isPartnerConfirmed && (isLongTerm ? hasPendingContract : true));
  const showContractReviewCard =
    isLongTerm &&
    isLeaseContractSigned &&
    booking.status !== 2 &&
    booking.status !== 4;

  const handleViewLeaseContract = () => {
    if (!leaseContract?.id) {
      toastInfo("Hợp đồng đang được khởi tạo, vui lòng đợi trong giây lát...");
      return;
    }
    navigate(`/bks-stay/contracts/${leaseContract.id}`);
  };

  const steps = [
    { label: "Đã đặt", active: booking.status === 0, completed: booking.status >= 0 && booking.status !== 2 && booking.status !== 4 },
    { label: "Xác nhận", active: booking.status === 1 && booking.stay_status !== 'checked_in', completed: booking.status >= 1 && booking.status !== 2 && booking.status !== 4 },
    { label: "Nhận phòng", active: booking.status === 1 && booking.stay_status === 'checked_in', completed: (booking.status === 3 || booking.stay_status === 'checked_in' || booking.stay_status === 'checked_out') && booking.status !== 2 && booking.status !== 4 },
    { label: "Hoàn thành", active: booking.status === 3 || booking.stay_status === 'checked_out', completed: (booking.status === 3 || booking.stay_status === 'checked_out') && booking.status !== 2 && booking.status !== 4 }
  ];

  const amenities = booking.room?.amenities || [
    "Điều hòa", "Wifi tốc độ cao", "Bếp đầy đủ", "Máy nước nóng", 
    "Smart TV", "Khóa thông minh", "Máy pha cà phê", "Tủ lạnh", "Máy giặt"
  ];

  return (
    <div className="space-y-8 pb-20 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {showCelebration && <Confetti />}
      {/* Back Navigation & Share */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" asChild className="h-10 rounded-xl border border-transparent px-3 text-slate-500 transition-all hover:border-slate-200 hover:bg-white hover:text-slate-900">
          <Link to={ROUTERS.BKS_STAY_HISTORY} className="flex items-center gap-2">
            <ArrowLeft className="size-4" /> Quay lại danh sách
          </Link>
        </Button>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="h-10 gap-2 rounded-xl border-slate-200" onClick={handleShare}>
              <Share2 className="size-4" /> Chia sẻ
           </Button>
        </div>
      </div>

      {/* Booking Stepper */}
      {booking.status === 2 ? (
         <div className="flex items-center gap-4 rounded-[24px] border border-rose-100 bg-rose-50 p-6 text-rose-900 mx-4">
            <AlertCircle className="size-8 shrink-0 text-rose-500" />
            <div>
               <h4 className="font-bold text-rose-950 text-base">Đặt phòng này đã bị hủy</h4>
               <p className="text-xs font-medium text-rose-800 mt-1 leading-relaxed">
                  Đơn đặt phòng của bạn đã bị hủy thành công. Mọi thắc mắc hoặc cần hỗ trợ đặt phòng mới, vui lòng liên hệ bộ phận CSKH của BKS Stay.
               </p>
            </div>
         </div>
      ) : booking.status === 4 ? (
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[24px] border border-amber-100 bg-amber-50 p-6 text-amber-900 mx-4">
            <div className="flex items-center gap-4">
               <AlertCircle className="size-8 shrink-0 text-amber-500 animate-pulse" />
               <div>
                  <h4 className="font-bold text-amber-950 text-base">
                     {withdrawCountdown !== null ? "Đang chuẩn bị rút yêu cầu hủy..." : "Đang chờ xử lý yêu cầu hủy"}
                  </h4>
                  <p className="text-xs font-medium text-amber-800 mt-1 leading-relaxed">
                     {withdrawCountdown !== null
                        ? `Hệ thống sẽ gửi yêu cầu rút lại đơn hủy đặt phòng sau ${withdrawCountdown} giây nữa.`
                        : "Yêu cầu hủy đặt phòng của bạn đã được tiếp nhận và đang chờ Partner duyệt."}
                  </p>
               </div>
            </div>
            <Button
               type="button"
               variant={withdrawCountdown !== null ? "destructive" : "outline"}
               onClick={handleWithdrawClick}
               disabled={withdrawSubmitting}
               className={`${
                  withdrawCountdown !== null
                     ? "bg-rose-600 hover:bg-rose-500 text-white border-transparent"
                     : "border-amber-300 text-amber-900 hover:bg-amber-100 hover:text-amber-950"
               } rounded-xl transition-all self-start md:self-center font-bold px-4 h-10 shrink-0`}
            >
               {withdrawSubmitting ? (
                 <span className="flex items-center gap-2">
                   <Spinner size="sm" spinnerClassName="border-y-amber-900" /> Đang rút...
                 </span>
                ) : withdrawCountdown !== null ? (
                   `Hoàn tác (${withdrawCountdown}s)`
                ) : (
                  "Rút yêu cầu hủy"
                )}
            </Button>
         </div>
      ) : (
         <div className="flex w-full items-center justify-between px-4">
            {steps.map((step, idx) => (
               <div key={idx} className="relative flex flex-1 flex-col items-center">
                  <div className={`z-10 flex size-8 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                     step.completed 
                     ? "border-sky-600 bg-sky-600 text-white" 
                     : step.active 
                     ? "border-sky-600 bg-white text-sky-600" 
                     : "border-slate-200 bg-white text-slate-300"
                  }`}>
                     {step.completed ? <CheckCircle2 className="size-5" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                  </div>
                  <span className={`mt-2 text-[10px] font-black uppercase tracking-wider ${step.active || step.completed ? "text-slate-900" : "text-slate-400"}`}>
                     {step.label}
                  </span>
                  {idx < steps.length - 1 && (
                     <div className={`absolute left-1/2 top-4 h-[2px] w-full -translate-y-1/2 transition-all duration-500 ${
                        steps[idx+1].completed ? "bg-sky-600" : "bg-slate-100"
                     }`} />
                  )}
               </div>
            ))}
         </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden rounded-[32px] shadow-2xl shadow-slate-900/10">
        <div className="absolute inset-0 z-0">
          <img 
            src={booking.room?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000"} 
            alt={booking.room?.title} 
            className="size-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-center px-10 md:px-12">
          {booking.status === 2 ? (
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-rose-300 backdrop-blur-md">
              <X className="size-3" />
              Kỳ nghỉ đã hủy
            </div>
          ) : booking.status === 4 ? (
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-300 backdrop-blur-md">
              <Clock className="size-3" />
              Đang yêu cầu hủy
            </div>
          ) : (
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-300 backdrop-blur-md">
              <Zap className="size-3" />
              {countdown.isStarted ? "Kỳ nghỉ đang diễn ra" : "Chi tiết kỳ nghỉ sắp tới"}
            </div>
          )}
          <h1 className="mb-6 max-w-2xl text-4xl font-black tracking-tight text-white md:text-5xl">
            {booking.room?.title || "Kỳ nghỉ của bạn"}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6">
             {booking.status === 2 ? (
                <div className="flex items-center gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 px-6 py-4 backdrop-blur-md">
                   <div className="flex size-10 items-center justify-center rounded-full bg-rose-50/20 text-rose-400">
                      <X className="size-6" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-rose-300">Rất tiếc!</p>
                      <p className="text-sm font-black text-white">Đơn đặt phòng này không còn hiệu lực</p>
                   </div>
                </div>
             ) : booking.status === 4 ? (
                <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-6 py-4 backdrop-blur-md">
                   <div className="flex size-10 items-center justify-center rounded-full bg-amber-550/20 text-amber-400">
                      <Clock className="size-6" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-amber-300">Đang chờ xử lý</p>
                      <p className="text-sm font-black text-white">Yêu cầu hủy đang được Partner kiểm tra</p>
                   </div>
                </div>
             ) : countdown.isStarted ? (
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-md">
                   <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="size-6" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-white/60">Chào mừng bạn!</p>
                      <p className="text-sm font-black text-white">Bạn đang trong thời gian lưu trú</p>
                   </div>
                </div>
             ) : (
                <div className="flex items-center gap-3">
                   <div className="min-w-[60px] rounded-xl border border-white/10 bg-white/10 p-2.5 text-center backdrop-blur-md">
                      <div className="text-lg font-bold leading-none text-white">{countdown.days}</div>
                      <div className="mt-1 text-[9px] font-black uppercase text-white/60">Ngày</div>
                   </div>
                   <div className="min-w-[60px] rounded-xl border border-white/10 bg-white/10 p-2.5 text-center backdrop-blur-md">
                      <div className="text-lg font-bold leading-none text-white">{countdown.hours}</div>
                      <div className="mt-1 text-[9px] font-black uppercase text-white/60">Giờ</div>
                   </div>
                   <div className="min-w-[60px] rounded-xl border border-white/10 bg-white/10 p-2.5 text-center backdrop-blur-md">
                      <div className="text-lg font-bold leading-none text-white">{countdown.mins}</div>
                      <div className="mt-1 text-[9px] font-black uppercase text-white/60">Phút</div>
                   </div>
                   <div className="max-w-[150px] ml-2 text-xs font-medium text-white/60">đến thời điểm nhận phòng dự kiến.</div>
                </div>
             )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Column */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* Deposit blocked until lease signed (long-term) */}
          {showDepositPaymentBlockedCard ? (
            <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-amber-900">Chưa thể thanh toán tiền cọc</h3>
                    <p className="text-sm leading-relaxed text-amber-800/90">
                      Đơn thuê dài hạn yêu cầu ký hợp đồng thuê trước khi nộp tiền đặt cọc. Vui lòng hoàn tất ký hợp đồng bên dưới, sau đó quay lại mục thanh toán cọc.
                    </p>
                    {leaseContract?.id ? (
                      <Button
                        type="button"
                        onClick={handleViewLeaseContract}
                        className="mt-1 rounded-xl bg-amber-600 font-bold text-white hover:bg-amber-700"
                      >
                        <FileText className="mr-2 size-4" />
                        Ký hợp đồng ngay
                      </Button>
                    ) : (
                      <p className="text-xs font-medium text-amber-700">
                        Hợp đồng đang được khởi tạo. Vui lòng chờ chủ nhà xác nhận đơn.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* VietQR & Receipt Dropzone Card */}
          {showDepositPaymentActiveCard ? (
            <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="size-5 text-sky-600 animate-pulse" />
                      Thanh toán tiền đặt cọc phòng
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Phương thức chuyển khoản VietQR
                    </p>
                  </div>
                  {booking.deposit_status === "pending" && graceTimeLeft !== null && (
                    <div className="flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1.5 rounded-full text-xs font-bold font-mono">
                      <Clock className="size-4" />
                      <span>{formatGraceTime(graceTimeLeft)}</span>
                    </div>
                  )}
                </div>

                {booking.deposit_status === "payment_submitted" ? (
                  <div className="rounded-2xl border border-emerald-100 bg-[#f0fdf4] p-6 text-center space-y-4 shadow-sm">
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                      <CheckCircle2 className="size-6 text-emerald-500 animate-bounce" />
                      <span>Đã gửi biên lai cọc thành công</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                      Biên lai chuyển khoản cọc đã được lưu nhận trên hệ thống. Vui lòng chờ phía lễ tân/chủ phòng xác thực số dư để hoàn tất đặt cọc.
                    </p>
                    {booking.booking_deposit?.receipt_path && (
                      <div className="relative mx-auto w-32 h-32 rounded-xl overflow-hidden border border-slate-200 shadow-inner group">
                        <img 
                          src={booking.booking_deposit.receipt_path} 
                          alt="Receipt Preview" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* VietQR QR Block */}
                    <div className="flex flex-col items-center justify-center border border-slate-100 bg-slate-50/50 rounded-2xl p-6 space-y-3">
                      <div className="relative p-2 bg-white border border-slate-200 rounded-2xl shadow-inner">
                        <img
                          src={`https://img.vietqr.io/image/mb-0333494850-compact2.png?amount=${booking.deposit_amount}&addInfo=BKS%20DEPOSIT%20${booking.id}&accountName=HO%20MINH%20NGOC`}
                          alt="VietQR code"
                          className="w-44 h-44 object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <QrCode className="size-3.5" />
                        Quét mã VietQR để thanh toán
                      </span>
                    </div>

                    {/* Bank Transfer Details & Copy actions */}
                    <div className="space-y-4 flex flex-col justify-center">
                      <div className="space-y-2 text-xs font-semibold text-slate-500">
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span>Ngân hàng</span>
                          <span className="text-slate-900 font-bold">Ngân hàng TMCP Quân Đội (MB)</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span>Số tài khoản</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 font-bold">0333494850</span>
                            <button
                              onClick={() => handleCopyText("0333494850", "Số tài khoản")}
                              className="text-sky-600 hover:text-sky-500"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span>Chủ tài khoản</span>
                          <span className="text-slate-900 font-bold">HO MINH NGOC</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span>Số tiền cọc</span>
                          <span className="text-rose-600 font-bold text-sm">{formatPrice(booking.deposit_amount)} VNĐ</span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                          <span>Nội dung chuyển khoản</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 font-bold">BKS DEPOSIT {booking.id}</span>
                            <button
                              onClick={() => handleCopyText(`BKS DEPOSIT ${booking.id}`, "Nội dung chuyển khoản")}
                              className="text-sky-600 hover:text-sky-500"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {booking.payment_method === "online" && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <Button asChild className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 font-bold text-white shadow-md hover:from-rose-600 hover:to-red-700 transition-all h-10">
                            <a href={`${import.meta.env.VITE_URL}/payments/checkout?booking_id=${booking.id}&redirect_to=${encodeURIComponent(window.location.origin + "/bks-stay/bookings/" + booking.id)}`}>
                              Thanh toán trực tuyến
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dropzone for Receipt Upload */}
                {booking.deposit_status === "pending" && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                      isDragging 
                        ? "border-sky-600 bg-sky-50/50" 
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <input
                      type="file"
                      id="receipt-file-input"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="receipt-file-input"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-1">
                        <Download className="size-5 transform rotate-180" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Kéo thả ảnh hoặc click để chọn ảnh biên lai cọc
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Hỗ trợ định dạng JPG, JPEG, PNG dung lượng dưới 5MB.
                      </p>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Online Payment Card (No Deposit) */}
          {booking.payment_method === "online" && 
           (booking.payment_status === "unpaid" || (!booking.payment_status && booking.status === 0)) && 
           (!booking.deposit_amount || booking.deposit_amount <= 0) ? (
            <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="size-5 text-sky-600 animate-pulse" />
                      Thanh toán trực tuyến đơn hàng
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Phương thức chuyển khoản VietQR hoặc Thanh toán trực tuyến
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* VietQR QR Block */}
                  <div className="flex flex-col items-center justify-center border border-slate-100 bg-slate-50/50 rounded-2xl p-6 space-y-3">
                    <div className="relative p-2 bg-white border border-slate-200 rounded-2xl shadow-inner">
                      <img
                        src={`https://img.vietqr.io/image/mb-0333494850-compact2.png?amount=${totalAmount}&addInfo=${booking.booking_code || `BKS_${booking.id}`}&accountName=HO%20MINH%20NGOC`}
                        alt="VietQR code"
                        className="w-44 h-44 object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <QrCode className="size-3.5" />
                      Quét mã VietQR để thanh toán nhanh
                    </span>
                  </div>

                  {/* Bank Transfer Details & Copy actions */}
                  <div className="space-y-4 flex flex-col justify-center">
                    <div className="space-y-2 text-xs font-semibold text-slate-500">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Ngân hàng</span>
                        <span className="text-slate-900 font-bold">Ngân hàng TMCP Quân Đội (MB)</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span>Số tài khoản</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-bold">0333494850</span>
                          <button
                            onClick={() => handleCopyText("0333494850", "Số tài khoản")}
                            className="text-sky-600 hover:text-sky-500"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Chủ tài khoản</span>
                        <span className="text-slate-900 font-bold">HO MINH NGOC</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Tổng tiền phòng</span>
                        <span className="text-rose-600 font-bold text-sm">{formatPrice(totalAmount)} VNĐ</span>
                      </div>
                      <div className="flex justify-between items-center pb-2">
                        <span>Nội dung chuyển khoản</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-bold">{booking.booking_code || `BKS_${booking.id}`}</span>
                          <button
                            onClick={() => handleCopyText(booking.booking_code || `BKS_${booking.id}`, "Nội dung chuyển khoản")}
                            className="text-sky-600 hover:text-sky-500"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <Button asChild className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 font-bold text-white shadow-md hover:from-sky-700 hover:to-indigo-700 transition-all h-10">
                        <a href={`${import.meta.env.VITE_URL}/payments/checkout?booking_id=${booking.id}&redirect_to=${encodeURIComponent(window.location.origin + "/bks-stay/bookings/" + booking.id)}`}>
                          Thanh toán trực tuyến
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Remainder payment after deposit confirmed */}
          {showRemainderPaymentCard ? (
            <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="size-5 text-amber-600" />
                      Thanh toán phần còn lại
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Đã đặt cọc {formatPrice(amountPaid)} — còn lại {formatPrice(amountRemaining)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center justify-center border border-slate-100 bg-slate-50/50 rounded-2xl p-6 space-y-3">
                    <div className="relative p-2 bg-white border border-slate-200 rounded-2xl shadow-inner">
                      <img
                        src={`https://img.vietqr.io/image/mb-0333494850-compact2.png?amount=${amountRemaining}&addInfo=BKS%20REMAIN%20${booking.id}&accountName=HO%20MINH%20NGOC`}
                        alt="VietQR code"
                        className="w-44 h-44 object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <QrCode className="size-3.5" />
                      Quét mã để thanh toán phần còn lại
                    </span>
                  </div>

                  <div className="space-y-4 flex flex-col justify-center">
                    <div className="space-y-2 text-xs font-semibold text-slate-500">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span>Số tiền còn lại</span>
                        <span className="text-amber-700 font-bold text-sm">{formatPrice(amountRemaining)} VNĐ</span>
                      </div>
                      <div className="flex justify-between items-center pb-2">
                        <span>Nội dung chuyển khoản</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-bold">BKS REMAIN {booking.id}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(`BKS REMAIN ${booking.id}`, "Nội dung chuyển khoản")}
                            className="text-sky-600 hover:text-sky-500"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button asChild className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-white shadow-md hover:from-amber-600 hover:to-orange-700 transition-all h-10">
                      <a href={`${import.meta.env.VITE_URL}/payments/checkout?booking_id=${booking.id}&payment_phase=remainder&redirect_to=${encodeURIComponent(window.location.origin + "/bks-stay/bookings/" + booking.id)}`}>
                        Thanh toán trực tuyến
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Main Details */}
          <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
            <CardContent className="p-8">
              <div className="mb-8 flex items-center justify-between">
                <div className="space-y-1">
                   <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                      Mã đơn hàng <span className="text-sky-600">#{booking.id}</span>
                   </h2>
                   <div className="flex flex-wrap gap-2">
                  <Badge className={`rounded-full border-none px-4 py-1.5 font-bold ${
                     booking.status === 1 ? "bg-emerald-100 text-emerald-700" : 
                     booking.status === 2 ? "bg-rose-100 text-rose-700" : 
                     booking.status === 3 ? "bg-sky-100 text-sky-700" : 
                     booking.status === 4 ? "bg-orange-100 text-orange-700" : 
                     "bg-amber-100 text-amber-700"
                  }`}>
                     {booking.status === 1 ? "ĐÃ XÁC NHẬN" : 
                      booking.status === 2 ? "ĐÃ HỦY" : 
                      booking.status === 3 ? "HOÀN THÀNH" : 
                      booking.status === 4 ? "CHỜ DUYỆT HỦY" : 
                      "CHỜ XÁC NHẬN"}
                  </Badge>

                  {(() => {
                    const payStatus =
                      booking.payment_status === "paid" && amountRemaining > 0
                        ? "partially_paid"
                        : (booking.payment_status ?? "unpaid");
                    return (
                      <Badge className={`rounded-full border-none px-4 py-1.5 font-bold ${
                         payStatus === "paid" ? "bg-emerald-100 text-emerald-700" :
                         payStatus === "partially_paid" ? "bg-sky-100 text-sky-700" :
                         payStatus === "refunded" ? "bg-slate-100 text-slate-700" :
                         "bg-amber-100 text-amber-700"
                      }`}>
                         {payStatus === "paid" ? "ĐÃ THANH TOÁN" :
                          payStatus === "partially_paid" ? "ĐÃ ĐẶT CỌC" :
                          payStatus === "refunded" ? "ĐÃ HOÀN TIỀN" :
                          "CHƯA THANH TOÁN"}
                      </Badge>
                    );
                  })()}
                </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đặt ngày: {new Date(booking.created_at).toLocaleDateString("vi-VN")}</p>
                 </div>
              </div>

              {/* Cancellation Details */}
              {booking.status === 2 && (
                <div className="mb-8 rounded-[24px] border border-rose-100 bg-rose-50/40 p-6">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-rose-950">
                    <AlertCircle className="size-4 text-rose-600" />
                    Thông tin hủy đặt phòng
                  </h4>
                  <div className="mt-4 space-y-3 text-xs text-rose-800">
                    {booking.cancelled_at && (
                      <div className="flex justify-between border-b border-rose-100/50 pb-2">
                        <span className="font-semibold text-rose-700">Thời điểm hủy</span>
                        <span className="font-bold">{new Date(booking.cancelled_at).toLocaleString("vi-VN")}</span>
                      </div>
                    )}
                    {booking.cancellation_reason && (
                      <div className="flex flex-col gap-1 pt-1">
                        <span className="font-semibold text-rose-700">Lý do hủy</span>
                        <p className="mt-1 rounded-xl bg-white p-3 font-medium text-slate-800 border border-rose-100 leading-relaxed">
                          {booking.cancellation_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Confirmation Action Card */}
              {showContractSignCard && (
                <div className="relative mb-8 overflow-hidden rounded-[32px] border border-sky-100 bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/40 p-6 shadow-lg shadow-sky-900/5 sm:p-8">
                  <div className="pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
                  <div className="pointer-events-none absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

                  <div className="relative space-y-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      <div
                        className={`flex size-16 shrink-0 items-center justify-center self-start rounded-[20px] shadow-lg sm:size-20 sm:rounded-[24px] ${
                          isPartnerConfirmed
                            ? "bg-sky-600 shadow-sky-600/20"
                            : "bg-amber-500 shadow-amber-500/20"
                        }`}
                      >
                        <FileText className="size-7 text-white sm:size-8" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-slate-900 sm:text-2xl">
                            {isPartnerConfirmed
                              ? isLongTerm
                                ? "Xác nhận hợp đồng thuê của bạn"
                                : "Phiếu xác nhận lưu trú đã sẵn sàng"
                              : "Đang chờ Partner xác nhận"}
                          </h3>
                          {isPartnerConfirmed && (
                            <Badge className="border-none bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                              <CheckCircle2 className="mr-1 size-3.5" />
                              {isLongTerm ? "Sẵn sàng ký" : "Đã phát hành"}
                            </Badge>
                          )}
                        </div>

                        <div className="rounded-2xl border border-sky-100/80 bg-white/80 p-4 text-sm font-medium leading-relaxed text-slate-600">
                          {isLongTerm ? (
                            isPartnerConfirmed ? (
                              <ul className="list-disc space-y-2 pl-4">
                                <li>
                                  Đơn đặt phòng dài hạn đã được đối tác xác nhận{" "}
                                  <span className="font-bold text-emerald-600">thành công</span>.
                                </li>
                                <li>
                                  Bấm <strong>&quot;Ký hợp đồng &amp; Xác nhận&quot;</strong> để ký tay hoặc tải chữ ký số hoàn tất thủ tục.
                                </li>
                                <li>
                                  Sau khi ký, chọn <strong>&quot;In hợp đồng / Xem trước&quot;</strong> để lưu bản sao về máy.
                                </li>
                              </ul>
                            ) : (
                              <ul className="list-disc space-y-2 pl-4">
                                <li>Đơn đặt phòng của bạn đang được Partner xem xét.</li>
                                <li>
                                  Sau khi được xác nhận, hợp đồng thuê sẽ được khởi tạo để bạn ký trực tuyến trước khi check-in.
                                </li>
                              </ul>
                            )
                          ) : isPartnerConfirmed ? (
                            <ul className="list-disc space-y-2 pl-4">
                              <li>
                                Đơn ngắn hạn đã được xác nhận{" "}
                                <span className="font-bold text-emerald-600">thành công</span> và phiếu lưu trú đã được cấp.
                              </li>
                              <li>
                                <strong>Khuyến nghị:</strong> Bấm <strong>&quot;Nhận phiếu xác nhận&quot;</strong>, chọn{" "}
                                <strong>&quot;Tải ảnh (PNG)&quot;</strong> để lưu phiếu về máy — tiện xuất trình khi check-in dù không có mạng.
                              </li>
                            </ul>
                          ) : (
                            <ul className="list-disc space-y-2 pl-4">
                              <li>Đơn đặt phòng đang được Partner xem xét.</li>
                              <li>
                                Sau khi xác nhận, phiếu lưu trú sẽ được phát hành tự động. Hãy tải ảnh phiếu ngay khi nhận được.
                              </li>
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-sky-100/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 sm:text-sm">
                        <span className="inline-flex items-center gap-2">
                          <span className="size-2 rounded-full bg-green-500" />
                          Thông tin đã sẵn sàng
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${
                              isPartnerConfirmed ? "bg-amber-500" : "animate-pulse bg-amber-500"
                            }`}
                          />
                          {isPartnerConfirmed
                            ? isLongTerm
                              ? "Chờ ký hợp đồng"
                              : "Đã phát hành phiếu"
                            : "Chờ Partner xác nhận"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${
                              isPartnerConfirmed ? "bg-sky-500" : "bg-slate-300"
                            }`}
                          />
                          {isLongTerm
                            ? isPartnerConfirmed
                              ? "Bước 2/4: Ký hợp đồng"
                              : "Bước 2/4: Xác nhận Partner"
                            : isPartnerConfirmed
                              ? "Bước 2/3: Nhận phiếu"
                              : "Bước 2/3: Xác nhận Partner"}
                        </span>
                      </div>

                      <Button
                        disabled={!isPartnerConfirmed}
                        onClick={() => {
                          if (!isPartnerConfirmed) return;
                          if (isLongTerm) {
                            handleViewLeaseContract();
                          } else {
                            navigate(`/bks-stay/bookings/${booking.id}/voucher`);
                          }
                        }}
                        className="h-12 w-full shrink-0 gap-2 rounded-full bg-sky-600 px-8 font-black text-white shadow-lg shadow-sky-600/20 transition-all hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[220px]"
                      >
                        {isLongTerm ? "Ký hợp đồng & Xác nhận" : "Nhận phiếu xác nhận"}
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {showContractReviewCard && (
                <div className="relative mb-8 overflow-hidden rounded-[32px] border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/40 p-6 shadow-lg shadow-emerald-900/5 sm:p-8">
                  <div className="pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

                  <div className="relative space-y-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      <div className="flex size-16 shrink-0 items-center justify-center self-start rounded-[20px] bg-emerald-600 shadow-lg shadow-emerald-600/20 sm:size-20 sm:rounded-[24px]">
                        <FileText className="size-7 text-white sm:size-8" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-slate-900 sm:text-2xl">
                            Hợp đồng thuê của bạn
                          </h3>
                          <Badge className="border-none bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            <CheckCircle2 className="mr-1 size-3.5" />
                            Đã ký
                          </Badge>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-slate-600">
                          Hợp đồng thuê căn hộ dịch vụ đã được ký thành công. Bạn có thể xem lại, in hoặc lưu bản sao
                          để xuất trình khi nhận bàn giao phòng hoặc trong suốt thời gian lưu trú.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-emerald-100/80 pt-5 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        onClick={handleViewLeaseContract}
                        className="h-12 w-full gap-2 rounded-full bg-emerald-600 px-8 font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 sm:w-auto"
                      >
                        <FileText className="size-4" />
                        Xem lại hợp đồng
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(ROUTERS.BKS_STAY_CONTRACTS)}
                        className="h-12 w-full rounded-full border-emerald-200 bg-white px-6 font-bold text-emerald-700 hover:bg-emerald-50 sm:w-auto"
                      >
                        Danh sách hợp đồng
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sky-600"><CalendarDays className="size-6" /></div>
                    <div>
                      <p className="mb-1 text-[10px] font-black uppercase leading-none tracking-widest text-slate-400">Thời gian lưu trú</p>
                      <p className="font-bold text-slate-900">
                         {new Date(booking.start_date).toLocaleDateString("vi-VN")} — {new Date(booking.end_date).toLocaleDateString("vi-VN")}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">
                        {isMonthlyRate ? BOOKING_DAYS_LABEL : BOOKING_NIGHTS_LABEL}:{" "}
                        {isMonthlyRate ? formatBookingDaysCount(bookingDays) : formatBookingNightsCount(bookingDays)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sky-600"><MapPin className="size-6" /></div>
                    <div className="flex-1">
                      <p className="mb-1 text-[10px] font-black uppercase leading-none tracking-widest text-slate-400">Vị trí & Địa chỉ</p>
                      <p className="font-bold text-slate-900">{booking.room?.property?.name || "BKS Stay Property"}</p>
                      <p className="text-xs font-medium leading-relaxed text-slate-500">{booking.room?.property?.address || "Địa chỉ đang cập nhật"}</p>
                      <button onClick={openInMaps} className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase text-sky-600 hover:underline">
                         Mở trong bản đồ <ExternalLink className="size-2" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sky-600"><User className="size-6" /></div>
                      <div>
                        <p className="mb-1 text-[10px] font-black uppercase leading-none tracking-widest text-slate-400">Người lưu trú</p>
                        <p className="font-bold text-slate-900">{userName || "Khách hàng"}</p>
                        <p className="text-xs font-medium text-slate-500">Người đặt & Người nhận phòng</p>
                      </div>
                   </div>
                   <div className="relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
                      <div className="absolute right-0 top-0 p-4 opacity-5"><CreditCard className="size-16" /></div>
                      <div className="relative z-10">
                         <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Tổng thanh toán</p>
                         <p className="text-2xl font-black text-white">{formatPrice(totalAmount)}</p>
                      </div>
                      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                         <p className="text-[10px] font-medium text-slate-400">Đã bao gồm thuế & phí</p>
                         <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold text-sky-400 hover:bg-white/5 hover:text-white" onClick={handleDownloadInvoice}>Tải hóa đơn</Button>
                      </div>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review & Comment Section */}
          {(booking.status === 3 || booking.stay_status === "checked_out") && (
            <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
              <CardContent className="p-8">
                <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-slate-900">
                  <Star className="size-5 text-amber-500 fill-amber-500" />
                  {bookingReviews && bookingReviews.length > 0 ? "Đánh giá của bạn" : "Đánh giá kỳ nghỉ của bạn"}
                </h3>
                <p className="mb-6 text-xs font-medium text-slate-500">
                  {bookingReviews && bookingReviews.length > 0
                    ? "Cảm ơn bạn đã đóng góp ý kiến để BKS Stay ngày một hoàn thiện hơn."
                    : "Chia sẻ trải nghiệm lưu trú của bạn để giúp các vị khách tiếp theo và nâng cao chất lượng dịch vụ."}
                </p>

                {isLoadingReviews ? (
                  <div className="py-4 text-center">
                    <Spinner size="sm" />
                  </div>
                ) : bookingReviews && bookingReviews.length > 0 ? (
                  <div className="space-y-6">
                    {bookingReviews.map((review) => (
                      <div key={review.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {review.room_id ? "Đánh giá phòng nghỉ" : "Đánh giá chủ nhà / đối tác"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(review.created_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`size-4 ${
                                i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-bold text-slate-800">{review.rating} / 5</span>
                        </div>
                        {review.comment && (
                          <p className="mt-3 text-sm text-slate-600 italic leading-relaxed">
                            "{review.comment}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Room Review */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-800">1. Đánh giá phòng nghỉ ({booking.room?.title})</h4>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRoomRating(star)}
                            className="transition-transform duration-200 hover:scale-125 focus:outline-none"
                          >
                            <Star
                              className={`size-7 ${
                                star <= roomRating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm font-black text-amber-500">
                          {roomRating === 5 ? "Rất tốt" : roomRating === 4 ? "Tốt" : roomRating === 3 ? "Bình thường" : roomRating === 2 ? "Kém" : "Rất kém"}
                        </span>
                      </div>
                      <Textarea
                        placeholder="Nhập cảm nhận của bạn về phòng nghỉ (không gian, nội thất, tiện nghi...)..."
                        value={roomComment}
                        onChange={(e) => setRoomComment(e.target.value)}
                        className="min-h-[80px] rounded-2xl border-slate-200 text-sm focus-visible:ring-sky-500"
                      />
                    </div>

                    {/* Partner Review */}
                    <div className="space-y-3 border-t border-slate-100 pt-6">
                      <h4 className="text-sm font-bold text-slate-800">2. Đánh giá đối tác / chủ nhà</h4>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setPartnerRating(star)}
                            className="transition-transform duration-200 hover:scale-125 focus:outline-none"
                          >
                            <Star
                              className={`size-7 ${
                                star <= partnerRating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm font-black text-amber-500">
                          {partnerRating === 5 ? "Rất tốt" : partnerRating === 4 ? "Tốt" : partnerRating === 3 ? "Bình thường" : partnerRating === 2 ? "Kém" : "Rất kém"}
                        </span>
                      </div>
                      <Textarea
                        placeholder="Nhập cảm nhận của bạn về chủ nhà (thái độ phục vụ, hỗ trợ, giao tiếp...)..."
                        value={partnerComment}
                        onChange={(e) => setPartnerComment(e.target.value)}
                        className="min-h-[80px] rounded-2xl border-slate-200 text-sm focus-visible:ring-sky-500"
                      />
                    </div>

                    <Button
                      onClick={() => void handleSubmitReview()}
                      disabled={submitReviewMutation.isPending}
                      className="mt-2 w-full h-11 rounded-2xl bg-sky-600 hover:bg-sky-700 font-bold shadow-lg shadow-sky-100 text-white"
                    >
                      {submitReviewMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <Spinner size="sm" spinnerClassName="border-y-white" /> Đang gửi đánh giá...
                        </span>
                      ) : (
                        "Gửi đánh giá kỳ nghỉ"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Selected Services Section */}
          {(booking.services && booking.services.length > 0) && (
             <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
                <CardContent className="p-8">
                   <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                      <Zap className="size-5 text-sky-600" /> Dịch vụ đi kèm
                   </h3>
                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {booking.services.map((svc, idx) => {
                         const Icon = getServiceIcon(svc.name);
                         return (
                            <div key={idx} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-sky-200 hover:bg-white">
                               <div className="rounded-xl bg-white p-2.5 text-sky-600 shadow-sm">
                                  <Icon className="size-5" />
                               </div>
                               <div className="flex-1">
                                  <p className="text-sm font-bold text-slate-900">{svc.name}</p>
                                  <p className="text-[10px] font-medium text-slate-400">Đã bao gồm trong giá phòng</p>
                               </div>
                               <CheckCircle2 className="size-5 text-emerald-500" />
                            </div>
                         );
                      })}
                   </div>
                </CardContent>
             </Card>
          )}

          {/* Amenities with Dialog */}
          <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
             <CardContent className="p-8">
                <div className="mb-6 flex items-center justify-between">
                   <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                      <BedDouble className="size-5 text-sky-600" /> Tiện nghi phòng
                   </h3>
                   <Dialog>
                      <DialogTrigger asChild>
                         <button className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:underline">Xem tất cả</button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl overflow-hidden rounded-[32px] border-none p-0">
                         <DialogHeader className="bg-slate-900 p-8 text-white">
                            <div className="flex items-center justify-between">
                               <div>
                                  <DialogTitle className="text-2xl font-black">Tất cả tiện nghi</DialogTitle>
                                  <p className="text-xs text-slate-400">Danh sách các trang thiết bị có sẵn trong phòng của bạn</p>
                               </div>
                               <DialogClose className="rounded-full bg-white/10 p-2 text-white/60 hover:bg-white/20 hover:text-white">
                                  <X className="size-5" />
                               </DialogClose>
                            </div>
                         </DialogHeader>
                         <div className="grid grid-cols-2 gap-4 p-8 sm:grid-cols-3">
                            {amenities.map((item, idx) => {
                               const Icon = getAmenityIcon(item);
                               return (
                                  <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-50 p-3">
                                     <Icon className="size-4 text-sky-600" />
                                     <span className="text-sm font-medium text-slate-700">{item}</span>
                                  </div>
                               );
                            })}
                         </div>
                         <DialogFooter className="bg-slate-50 p-6">
                            <DialogClose asChild>
                               <Button variant="outline" className="rounded-xl px-8">Đóng cửa sổ</Button>
                            </DialogClose>
                         </DialogFooter>
                      </DialogContent>
                   </Dialog>
                </div>
                <div className="grid grid-cols-2 gap-y-6 md:grid-cols-4">
                   {amenities.slice(0, 7).map((item, idx) => {
                      const Icon = getAmenityIcon(item);
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 text-center">
                           <div className="rounded-full bg-slate-50 p-3 text-slate-600"><Icon className="size-5" /></div>
                           <span className="text-xs font-bold text-slate-700">{item}</span>
                        </div>
                      );
                   })}
                   <Dialog>
                      <DialogTrigger asChild>
                        <button className="group flex flex-col items-center gap-2 text-center text-slate-400 hover:text-sky-600">
                           <div className="rounded-full bg-slate-50 p-3 transition-colors group-hover:bg-sky-50"><Plus className="size-5" /></div>
                           <span className="text-xs font-bold">Xem thêm...</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl overflow-hidden rounded-[32px] border-none p-0">
                         <DialogHeader className="bg-slate-900 p-8 text-white">
                            <div className="flex items-center justify-between">
                               <DialogTitle className="text-2xl font-black">Tất cả tiện nghi</DialogTitle>
                               <DialogClose className="rounded-full bg-white/10 p-2 text-white/60 hover:bg-white/20 hover:text-white">
                                  <X className="size-5" />
                               </DialogClose>
                            </div>
                         </DialogHeader>
                         <div className="grid grid-cols-2 gap-4 p-8 sm:grid-cols-3">
                            {amenities.map((item, idx) => {
                               const Icon = getAmenityIcon(item);
                               return (
                                  <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-50 p-3">
                                     <Icon className="size-4 text-sky-600" />
                                     <span className="text-sm font-medium text-slate-700">{item}</span>
                                  </div>
                               );
                            })}
                         </div>
                         <DialogFooter className="bg-slate-50 p-6">
                            <DialogClose asChild>
                               <Button variant="outline" className="rounded-xl px-8">Đóng</Button>
                            </DialogClose>
                         </DialogFooter>
                      </DialogContent>
                   </Dialog>
                </div>
             </CardContent>
          </Card>

          {/* Quick Access Wifi/Key */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="group relative overflow-hidden rounded-[32px] border-none bg-sky-900 text-white shadow-lg">
              <div className="absolute -bottom-4 -right-4 opacity-5 transition-transform duration-500 group-hover:scale-110">
                <Wifi className="size-32" />
              </div>
              <CardContent className="relative z-10 p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="rounded-2xl border border-sky-500/20 bg-sky-500/20 p-3 backdrop-blur-md">
                    <Wifi className="size-6 text-sky-400" />
                  </div>
                  <button onClick={() => setShowWifi(!showWifi)} className="text-[10px] font-black uppercase tracking-widest text-sky-400 transition-colors hover:text-white">
                    {showWifi ? "Ẩn" : "Hiện"} pass
                  </button>
                </div>
                <h3 className="mb-4 text-xl font-bold">Kết nối Wi-Fi</h3>
                <div className="space-y-3">
                   <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                      <span className="font-medium text-sky-400">SSID</span>
                      <span className="font-mono font-bold tracking-tight">BKS_Premium_Guest</span>
                   </div>
                   <div className="flex items-center justify-between pt-1 text-sm">
                      <span className="font-medium text-sky-400">Password</span>
                      <div className="flex items-center gap-2">
                         <span className="font-mono text-lg font-bold tracking-wider">
                           {showWifi ? "stay_at_bks_2026" : "••••••••••••"}
                         </span>
                         {showWifi && (
                           <button onClick={() => { navigator.clipboard.writeText("stay_at_bks_2026"); toastSuccess("Đã sao chép mật khẩu!"); }} className="rounded p-1 hover:bg-white/10">
                              <Copy className="size-3 text-sky-400" />
                           </button>
                         )}
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-[32px] border border-none border-slate-100 bg-white shadow-lg">
               <div className="absolute -bottom-4 -right-4 p-8 opacity-[0.03] transition-transform duration-500 group-hover:scale-110">
                <Key className="size-32" />
              </div>
              <CardContent className="p-8">
                <div className="mb-6 w-fit rounded-2xl border border-amber-500/10 bg-amber-500/10 p-3">
                    <Key className="size-6 text-amber-600" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-slate-900">Truy cập phòng</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Số phòng</p>
                      <p className="text-2xl font-black text-slate-900">P.808</p>
                   </div>
                   <div>
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Mã cửa</p>
                      <p className="bg-gradient-to-br from-amber-600 to-rose-600 bg-clip-text text-2xl font-black tracking-widest text-transparent">
                        283944
                      </p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
           <Card className="rounded-[32px] border-none bg-white p-8 shadow-xl shadow-slate-200/50">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                 <CreditCard className="size-4 text-sky-600" /> Chi phí lưu trú
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{formatRoomRentalLineLabel(bookingDays, booking.price?.unit)}</span>
                    <span className="font-bold text-slate-900">{formatPrice(roomStayTotal)}</span>
                 </div>
                 {booking.services && booking.services.length > 0 ? (
                   booking.services.map((svc) => (
                     <div key={svc.id} className="flex justify-between text-sm">
                       <span className="text-slate-500">{svc.name}</span>
                       <span className="font-bold text-slate-900">{formatPrice(svc.price)}</span>
                     </div>
                   ))
                 ) : servicesTotal > 0 ? (
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-500">Dịch vụ bổ sung</span>
                     <span className="font-bold text-slate-900">{formatPrice(servicesTotal)}</span>
                   </div>
                 ) : null}
                 <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">Tổng cộng</span>
                    <span className="text-xl font-black text-sky-600">{formatPrice(totalAmount)}</span>
                 </div>
                 {amountPaid > 0 && booking.payment_status !== "paid" && (
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-500">Đã thanh toán (cọc)</span>
                     <span className="font-bold text-emerald-600">{formatPrice(amountPaid)}</span>
                   </div>
                 )}
                 {amountRemaining > 0 && booking.payment_status === "partially_paid" && (
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-500">Còn lại</span>
                     <span className="font-bold text-amber-700">{formatPrice(amountRemaining)}</span>
                   </div>
                 )}
                 {booking.payment_method && (
                   <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                     <span className="text-xs font-semibold text-slate-400">Phương thức thanh toán</span>
                     <div className="flex items-center gap-2">
                       <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                         booking.payment_method === "online"
                           ? "bg-sky-50 text-sky-700 border border-sky-100"
                           : "bg-slate-100 text-slate-700 border border-slate-200"
                       }`}>
                         <CreditCard className="size-3" />
                         {booking.payment_method === "online" ? "Thanh toán trực tuyến" : "Thanh toán tại quầy"}
                       </span>
                       {!booking.payment_method_changed_at &&
                         (booking.status === 0 || booking.status === 1) &&
                         (() => {
                           const hoursLeft = (new Date(booking.start_date).getTime() - Date.now()) / 3600000;
                           const blocked = booking.payment_method === "online" && booking.payment_status === "paid";
                           return hoursLeft > 12 && !blocked ? (
                             <Dialog open={isPaymentMethodDialogOpen} onOpenChange={setIsPaymentMethodDialogOpen}>
                               <DialogTrigger asChild>
                                 <button className="text-[10px] font-black uppercase tracking-wider text-sky-600 hover:underline">
                                   Đổi
                                 </button>
                               </DialogTrigger>
                               <DialogContent className="max-w-sm overflow-hidden rounded-[32px] border-none p-0">
                                 <DialogHeader className="bg-slate-900 p-8 text-white">
                                   <div className="flex items-center gap-3">
                                     <div className="rounded-full bg-white/20 p-2"><CreditCard className="size-5" /></div>
                                     <DialogTitle className="text-lg font-black">Đổi phương thức thanh toán</DialogTitle>
                                   </div>
                                   <DialogDescription className="mt-2 text-slate-400 text-sm">
                                     Bạn chỉ được đổi một lần duy nhất.
                                   </DialogDescription>
                                 </DialogHeader>
                                 <div className="p-8 space-y-4">
                                   <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 space-y-1">
                                     <p><span className="text-slate-400 font-medium">Hiện tại:</span> <span className="font-bold">{booking.payment_method === "online" ? "Thanh toán trực tuyến" : "Thanh toán tại quầy"}</span></p>
                                     <p><span className="text-slate-400 font-medium">Đổi sang:</span> <span className="font-bold text-sky-700">{booking.payment_method === "online" ? "Thanh toán tại quầy" : "Thanh toán trực tuyến"}</span></p>
                                   </div>
                                   <p className="text-xs text-slate-500 leading-relaxed">
                                     Sau khi đổi, bạn không thể thay đổi lại. Nếu cần hỗ trợ thêm, vui lòng liên hệ lễ tân.
                                   </p>
                                 </div>
                                 <DialogFooter className="bg-slate-50 px-8 pb-8 gap-2">
                                   <DialogClose asChild>
                                     <Button type="button" variant="ghost" className="rounded-xl flex-1">Hủy bỏ</Button>
                                   </DialogClose>
                                   <Button
                                     type="button"
                                     disabled={paymentMethodSubmitting}
                                     onClick={() => void handleChangePaymentMethod()}
                                     className="rounded-xl flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold"
                                   >
                                     {paymentMethodSubmitting ? "Đang đổi..." : "Xác nhận đổi"}
                                   </Button>
                                 </DialogFooter>
                               </DialogContent>
                             </Dialog>
                           ) : null;
                         })()
                       }
                     </div>
                   </div>
                 )}
              </div>
           </Card>

           <div className="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 text-white shadow-xl shadow-slate-900/20">
              <h3 className="mb-6 text-xl font-bold">Hỗ trợ khẩn cấp</h3>
              <div className="space-y-4">
                  <div className="flex h-16 w-full justify-between items-center gap-4 rounded-2xl bg-white/5 px-6 text-white/70">
                     <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-sky-500/20 p-2"><PhoneCall className="size-5 text-sky-400" /></div>
                        <div className="text-left">
                           <p className="text-sm font-bold text-white">Lễ tân 24/7</p>
                           <p className="mt-1 text-[10px] font-semibold text-white/40">
                             Hotline: {booking.room?.property?.user?.phone || "0333494850"}
                           </p>
                        </div>
                     </div>
                  </div>
                 <Button
                   type="button"
                   onClick={() => navigate(ROUTERS.BKS_STAY_CHAT)}
                   className="h-16 w-full justify-between gap-4 rounded-2xl border-none bg-white/5 px-6 text-white shadow-none hover:bg-white/10"
                 >
                    <div className="flex items-center gap-4">
                       <div className="rounded-xl bg-sky-500/20 p-2"><MessageSquare className="size-5 text-sky-400" /></div>
                       <div className="text-left">
                          <p className="text-sm font-bold">Nhắn chủ nhà</p>
                          <p className="mt-1 text-[9px] font-black uppercase text-white/40">CHAT REALTIME</p>
                       </div>
                    </div>
                    <ChevronRight className="size-4 text-white/20" />
                 </Button>
              </div>
           </div>

           <Card className="rounded-[32px] border-none bg-white p-8 shadow-md">
              <div className="flex gap-4">
                 <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Info className="size-5" /></div>
                 <div>
                    <h3 className="mb-1 text-sm font-bold text-slate-900">Nội quy & Chính sách</h3>
                    <p className="mb-4 text-[11px] leading-relaxed text-slate-500">
                      Vui lòng tham khảo các quy định về giờ giấc và an toàn.
                    </p>
                     <Button onClick={() => setIsRulesDialogOpen(true)} variant="ghost" className="h-auto p-0 text-xs font-bold text-sky-600 hover:bg-transparent">Xem toàn bộ <ChevronRight className="size-3 ml-1" /></Button>
                 </div>
              </div>
           </Card>

           {(booking.status === 0 || booking.status === 1 || booking.status === 4) && (
           <Card className="rounded-[32px] border-none bg-rose-50 p-8 shadow-md">
              <div className="flex gap-4">
                 <AlertCircle className="size-6 text-rose-500" />
                 <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-sm font-bold text-rose-900">Quy tắc hủy phòng</h3>
                    {booking.status === 4 ? (
                      <div className="space-y-2">
                        <p className="text-[11px] leading-relaxed text-rose-800">
                          Đơn đang <span className="font-semibold">chờ Partner xử lý yêu cầu hủy</span>. Bạn không cần gửi lại; kết quả sẽ được cập nhật trên hệ thống và email.
                        </p>
                        <Button
                          type="button"
                          variant="link"
                          onClick={handleWithdrawClick}
                          disabled={withdrawSubmitting}
                          className="h-auto p-0 text-xs font-black uppercase tracking-wider text-amber-600 hover:text-amber-700 transition-colors disabled:opacity-50"
                        >
                          {withdrawSubmitting ? (
                            "Đang rút..."
                          ) : withdrawCountdown !== null ? (
                            `Hoàn tác (${withdrawCountdown}s)`
                          ) : (
                            "Rút yêu cầu hủy"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <>
                    <p className="mb-4 text-[11px] leading-relaxed text-rose-700/70">
                       Hủy miễn phí trước {new Date(new Date(booking.start_date).getTime() - 2*24*60*60*1000).toLocaleDateString("vi-VN")}.
                    </p>
                    {booking.booking_code && (
                      <p className="mb-2 text-[11px] font-mono text-rose-800/90">Mã đặt phòng: {booking.booking_code}</p>
                    )}
                    {cooldownRemaining > 0 && (
                      <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-900">
                        Bạn vừa thao tác hủy gần đây. Vui lòng thử lại sau{" "}
                        <span className="font-bold tabular-nums">{cooldownRemaining}s</span>.
                      </div>
                    )}
                    {reasonsForbidden && (
                      <p className="mb-3 text-[11px] text-rose-800">
                        Tính năng hủy qua cổng BKS Stay chưa bật hoặc bạn không có quyền. Vui lòng liên hệ hỗ trợ hoặc dùng email xác nhận kèm mã đặt phòng.
                      </p>
                    )}
                    {!reasonsForbidden && reasonsQuery.isError && !reasonsQuery.isFetching && (
                      <p className="mb-3 text-[11px] text-rose-800">Không tải được danh mục lý do hủy. Thử lại sau hoặc liên hệ hỗ trợ.</p>
                    )}
                    <div className="flex flex-col gap-2">
                       <Dialog
                         open={isCancelDialogOpen}
                         onOpenChange={(open) => {
                           setIsCancelDialogOpen(open);
                           if (!open) setReasonNote("");
                         }}
                       >
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              disabled={
                                reasonsForbidden ||
                                reasonsQuery.isLoading ||
                                cooldownRemaining > 0 ||
                                (reasonsQuery.isError && !reasonsForbidden) ||
                                (((reasonsQuery.data?.length ?? 0) === 0) &&
                                  !reasonsQuery.isLoading &&
                                  !reasonsQuery.isFetching &&
                                  !reasonsForbidden)
                              }
                              className="h-auto w-fit p-0 text-xs font-bold text-rose-600 hover:bg-transparent disabled:opacity-40"
                            >
                              {booking.status === 0 ? "Hủy đặt phòng" : "Yêu cầu hủy"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md overflow-hidden rounded-[32px] border-none p-0">
                             <DialogHeader className="bg-rose-600 p-8 text-white">
                                <div className="flex items-center gap-3">
                                   <div className="rounded-full bg-white/20 p-2"><AlertCircle className="size-6" /></div>
                                   <DialogTitle className="text-xl font-black">
                                     {booking.status === 0 ? "Hủy đặt phòng" : "Yêu cầu hủy đặt phòng"}
                                   </DialogTitle>
                                </div>
                                <DialogDescription className="mt-2 text-rose-100">
                                   {booking.status === 0
                                     ? `Xác nhận hủy đơn #${booking.id} (chỉ áp dụng khi đơn đang chờ xác nhận).`
                                     : `Gửi yêu cầu hủy đơn #${booking.id} tới Partner. Đơn sẽ chuyển trạng thái chờ duyệt hủy.`}
                                </DialogDescription>
                             </DialogHeader>
                             <div className="p-8">
                                <div className="space-y-4">
                                   <div className="space-y-2">
                                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Lý do</Label>
                                      {reasonsQuery.isLoading ? (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                          <Spinner size="sm" className="inline-block" spinnerClassName="border-y-slate-500" /> Đang tải danh mục…
                                        </div>
                                      ) : (
                                        <Select
                                          value={selectedReasonCode}
                                          onValueChange={(val) => setSelectedReasonCode(val)}
                                        >
                                          <SelectTrigger className="w-full rounded-2xl">
                                            <SelectValue placeholder="Chọn lý do..." />
                                          </SelectTrigger>
                                          <SelectContent className="rounded-2xl">
                                            {(reasonsQuery.data ?? []).map((r) => (
                                              <SelectItem key={r.code} value={r.code} className="rounded-xl">
                                                {r.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                   </div>
                                   {(reasonsQuery.data ?? []).find((r) => r.code === selectedReasonCode)?.requires_note && (
                                   <div className="space-y-2">
                                      <Label htmlFor="reason-note" className="text-xs font-bold uppercase tracking-wider text-slate-400">Chi tiết (bắt buộc)</Label>
                                      <Textarea
                                        id="reason-note"
                                        placeholder="Mô tả ngắn gọn…"
                                        className="min-h-[100px] rounded-2xl"
                                        value={reasonNote}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReasonNote(e.target.value)}
                                      />
                                   </div>
                                   )}
                                   <div className="rounded-2xl bg-slate-50 p-4">
                                      <div className="flex items-start gap-3">
                                         <Info className="mt-0.5 size-4 text-slate-400" />
                                         <p className="text-[11px] leading-relaxed text-slate-500">
                                            {booking.status === 0
                                              ? "Hủy trực tiếp áp dụng khi đơn đang chờ xác nhận; sau khi hủy bạn có thể đặt lại phòng khác."
                                              : "Yêu cầu hủy dành cho đơn đã xác nhận; Partner sẽ xử lý theo chính sách."}
                                         </p>
                                      </div>
                                   </div>
                                </div>
                             </div>
                             <DialogFooter className="bg-slate-50 p-6">
                                <DialogClose asChild>
                                   <Button type="button" variant="ghost" className="rounded-xl">Bỏ qua</Button>
                                </DialogClose>
                                <Button
                                  type="button"
                                  disabled={cancelSubmitting || reasonsQuery.isLoading}
                                  onClick={() => void handleCancelBooking()}
                                  className="rounded-xl bg-rose-600 hover:bg-rose-700"
                                >
                                  {cancelSubmitting ? (
                                    <span className="inline-flex items-center gap-2">
                                      <Spinner size="sm" className="inline-block" spinnerClassName="border-y-white" /> Đang gửi…
                                    </span>
                                  ) : booking.status === 0 ? (
                                    "Xác nhận hủy"
                                  ) : (
                                    "Gửi yêu cầu hủy"
                                  )}
                                </Button>
                             </DialogFooter>
                          </DialogContent>
                       </Dialog>

                       {(booking.status === 0 || booking.status === 1) && (
                       <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" className="h-auto w-fit p-0 text-xs font-bold text-rose-600 hover:bg-transparent">Dời ngày nghỉ</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md overflow-hidden rounded-[32px] border-none p-0">
                             <DialogHeader className="bg-slate-900 p-8 text-white">
                                <div className="flex items-center gap-3">
                                   <div className="rounded-full bg-white/10 p-2"><History className="size-6" /></div>
                                   <DialogTitle className="text-xl font-black">Thay đổi ngày nghỉ</DialogTitle>
                                </div>
                                <DialogDescription className="mt-2 text-slate-400">
                                   Vui lòng chọn khung thời gian mới mà bạn mong muốn.
                                </DialogDescription>
                             </DialogHeader>
                             <div className="p-8">
                                <div className="grid grid-cols-2 gap-4">
                                   <DatePickerField
                                      id="booking-detail-new-start-date"
                                      label="Nhận phòng"
                                      labelClassName="text-[10px] font-black uppercase tracking-widest text-slate-400"
                                      value={newStartDate}
                                      onChange={setNewStartDate}
                                      maxDate={newEndDate || undefined}
                                      className="space-y-2"
                                      triggerClassName="h-10 min-h-0 rounded-xl text-sm font-normal shadow-none hover:shadow-none"
                                   />
                                   <DatePickerField
                                      id="booking-detail-new-end-date"
                                      label="Trả phòng"
                                      labelClassName="text-[10px] font-black uppercase tracking-widest text-slate-400"
                                      value={newEndDate}
                                      onChange={setNewEndDate}
                                      minDate={newStartDate || undefined}
                                      className="space-y-2"
                                      triggerClassName="h-10 min-h-0 rounded-xl text-sm font-normal shadow-none hover:shadow-none"
                                   />
                                </div>
                                <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                                   <div className="flex gap-3">
                                      <Info className="size-4 text-sky-600" />
                                      <p className="text-[11px] leading-relaxed text-sky-800">
                                         Việc dời ngày có thể làm thay đổi tổng tiền thanh toán tùy theo giá phòng tại thời điểm mới.
                                      </p>
                                   </div>
                                </div>
                             </div>
                             <DialogFooter className="bg-slate-50 p-6">
                                <DialogClose asChild>
                                   <Button variant="ghost" className="rounded-xl">Hủy bỏ</Button>
                                </DialogClose>
                                <Button onClick={handleReschedule} className="rounded-xl bg-sky-600 hover:bg-sky-700">Xác nhận thay đổi</Button>
                             </DialogFooter>
                          </DialogContent>
                       </Dialog>
                       )}
                    </div>
                      </>
                    )}
                 </div>
              </div>
           </Card>
           )}
         </div>

         {/* Rules Modal */}
         <Dialog open={isRulesDialogOpen} onOpenChange={setIsRulesDialogOpen}>
           <DialogContent className="rounded-[32px] border-none bg-white p-8 max-w-lg shadow-2xl">
             <DialogHeader className="mb-4 text-left">
               <DialogTitle className="text-2xl font-black text-slate-900">Nội quy & Chính sách Hủy phòng</DialogTitle>
               <DialogDescription className="text-sm font-medium text-slate-500">
                 Vui lòng tuân thủ các nội quy để đảm bảo một kỳ nghỉ tuyệt vời.
               </DialogDescription>
             </DialogHeader>
             <div className="space-y-4 my-2 text-sm leading-relaxed text-slate-600 max-h-[300px] overflow-y-auto pr-2">
               <div>
                 <h4 className="font-bold text-slate-900">1. Quy định Nhận & Trả phòng</h4>
                 <p className="text-xs mt-1">Giờ nhận phòng tiêu chuẩn là từ 14:00. Giờ trả phòng tiêu chuẩn là trước 12:00 trưa. Việc nhận phòng sớm hoặc trả phòng muộn sẽ chịu thêm phí tùy thuộc vào tình trạng phòng trống tại thời điểm đó.</p>
               </div>
               <div>
                 <h4 className="font-bold text-slate-900">2. Quy định Lưu trú & An toàn</h4>
                 <p className="text-xs mt-1">Không mang theo chất cấm, vũ khí hoặc chất dễ cháy nổ vào khu vực lưu trú. Hãy tôn trọng sự yên tĩnh chung sau 22:00 đêm. Không tự ý thay đổi kết cấu hoặc di chuyển đồ đạc lớn trong phòng.</p>
               </div>
               <div>
                 <h4 className="font-bold text-slate-900">3. Chính sách phạt hủy (Ngắn hạn)</h4>
                 <p className="text-xs mt-1">Miễn phí hủy đơn trước giờ check-in 7 ngày. Hủy từ 2 đến dưới 7 ngày chịu phí phạt 50% tiền cọc. Hủy dưới 48 giờ trước check-in chịu phạt 100% tiền cọc (không hoàn tiền).</p>
               </div>
             </div>
             <DialogFooter className="mt-6">
               <Button onClick={() => setIsRulesDialogOpen(false)} className="w-full rounded-2xl bg-slate-900 font-bold text-white">Đã hiểu</Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>

      </div>
    </div>
  );
};

export default BookingDetail;

