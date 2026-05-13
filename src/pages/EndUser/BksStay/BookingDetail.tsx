import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
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
  Calendar,
  FileText,
  ArrowRight
} from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlainTextarea as Textarea } from "@/components/ui/textarea";
import { ROUTERS } from "@/constant";
import { formatPrice } from "@/utils/utils";
import { toastSuccess, toastError, toastInfo } from "@/components/ui/toast";
import { useUserStore } from "@/store/useUserStore";

import stayService, { BookingDetail as IBookingDetail } from "@/services/stayService";

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
    if (searchParams.get("confirmed") === "true") {
      setShowCelebration(true);
      toastSuccess("Tuyệt vời! Kỳ nghỉ của bạn đã chính thức được xác nhận.");
      setSearchParams({}, { replace: true });
      setTimeout(() => setShowCelebration(false), 8000);
    }
  }, [searchParams, setSearchParams]);

  const [showCelebration, setShowCelebration] = useState(false);
  const { userName } = useUserStore();
  const [showWifi, setShowWifi] = useState(false);
  const [booking, setBooking] = useState<IBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, isStarted: false });

  // States for professional flows
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res: any = await stayService.getBookingDetail(id);
        if (res.status === "success") {
          setBooking(res.data);
          
          const start = new Date(res.data.start_date);
          const end = new Date(res.data.end_date);
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
                 isStarted: false
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
    };
    fetchDetail();
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-y-2 border-sky-600"></div>
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
    const text = `Thông tin đặt phòng BKS Stay: ${booking.room?.title} tại ${booking.room?.building?.address}. Mã đơn: ${booking.id}`;
    navigator.clipboard.writeText(text);
    toastSuccess("Đã sao chép liên kết vào bộ nhớ tạm!");
  };

  const openInMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.room?.building?.address || "")}`, "_blank");
  };

  const handleCancelBooking = () => {
    if (!cancelReason.trim()) {
      toastError("Vui lòng nhập lý do hủy phòng.");
      return;
    }
    // Simulate API call
    toastSuccess("Yêu cầu hủy phòng đã được gửi. Chúng tôi sẽ phản hồi trong vòng 24h.");
    setIsCancelDialogOpen(false);
    setCancelReason("");
  };

  const handleReschedule = () => {
    if (!newStartDate || !newEndDate) {
      toastError("Vui lòng chọn đầy đủ ngày nhận và trả phòng mới.");
      return;
    }
    toastInfo("Yêu cầu dời ngày đang được xử lý. Lễ tân sẽ liên hệ xác nhận tình trạng phòng trống.");
    setIsRescheduleDialogOpen(false);
  };

  const nights = Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24));

  const steps = [
    { label: "Đã đặt", active: true, completed: booking.status >= 0 },
    { label: "Xác nhận", active: booking.status === 0, completed: booking.status >= 1 },
    { label: "Nhận phòng", active: booking.status === 1, completed: booking.status >= 2 },
    { label: "Hoàn thành", active: booking.status === 2, completed: booking.status >= 2 }
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
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-300 backdrop-blur-md">
            <Zap className="size-3" />
            {countdown.isStarted ? "Kỳ nghỉ đang diễn ra" : "Chi tiết kỳ nghỉ sắp tới"}
          </div>
          <h1 className="mb-6 max-w-2xl text-4xl font-black tracking-tight text-white md:text-5xl">
            {booking.room?.title || "Kỳ nghỉ của bạn"}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6">
             {countdown.isStarted ? (
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
          
          {/* Main Details */}
          <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
            <CardContent className="p-8">
              <div className="mb-8 flex items-center justify-between">
                <div className="space-y-1">
                   <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                      Mã đơn hàng <span className="text-sky-600">#{booking.id}</span>
                   </h2>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đặt ngày: {new Date(booking.created_at).toLocaleDateString("vi-VN")}</p>
                </div>
                <Badge className={`rounded-full border-none px-4 py-1.5 font-bold ${
                   booking.status === 1 ? "bg-emerald-100 text-emerald-700" : 
                   booking.status === 2 ? "bg-sky-100 text-sky-700" : 
                   "bg-amber-100 text-amber-700"
                }`}>
                   {booking.status === 1 ? "ĐÃ XÁC NHẬN" : booking.status === 2 ? "HOÀN THÀNH" : "CHỜ XÁC NHẬN"}
                </Badge>
              </div>

              {/* Confirmation Action Card */}
              {booking.status === 0 && (
                <div className="relative overflow-hidden bg-gradient-to-br from-sky-600/10 via-white to-indigo-600/5 backdrop-blur-md border border-sky-100 rounded-[32px] p-8 shadow-xl shadow-sky-900/5 group mb-8">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500" />
                  
                  <div className="relative flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0 w-20 h-20 bg-sky-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-sky-600/20 animate-pulse">
                      <FileText className="text-white" size={32} />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-black text-slate-900 mb-2">
                        Xác nhận kỳ nghỉ của bạn
                      </h3>
                      <p className="text-slate-600 font-medium leading-relaxed max-w-lg">
                        Vui lòng kiểm tra lại thông tin và tiến hành ký hợp đồng lưu trú để chính thức hoàn tất thủ tục đặt phòng.
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0 w-full md:w-auto">
                      <Button
                        onClick={() => {
                          const contractId = booking.contracts?.[0]?.id;
                          if (contractId) {
                            navigate(`/bks-stay/contracts/${contractId}`);
                          } else {
                            toastInfo("Hợp đồng đang được khởi tạo, vui lòng đợi trong giây lát...");
                          }
                        }}
                        className="relative z-20 flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-sky-600 px-8 font-black text-white shadow-xl shadow-sky-600/20 transition-all duration-300 hover:scale-[1.02] hover:bg-sky-500 active:scale-95 md:w-auto"
                      >
                        Ký hợp đồng & Xác nhận
                        <ArrowRight className="size-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Thông tin đã sẵn sàng
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      Chờ ký hợp đồng
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                      <div className="w-2 h-2 rounded-full bg-sky-500" />
                      Bước 2/4: Xác nhận
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
                      <p className="mt-0.5 text-xs font-medium text-slate-500">Tổng cộng {nights} đêm nghỉ</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sky-600"><MapPin className="size-6" /></div>
                    <div className="flex-1">
                      <p className="mb-1 text-[10px] font-black uppercase leading-none tracking-widest text-slate-400">Vị trí & Địa chỉ</p>
                      <p className="font-bold text-slate-900">{booking.room?.building?.name || "BKS Stay Building"}</p>
                      <p className="text-xs font-medium leading-relaxed text-slate-500">{booking.room?.building?.address || "Địa chỉ đang cập nhật"}</p>
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
                         <p className="text-2xl font-black text-white">{formatPrice(booking.price?.price || 0)}</p>
                      </div>
                      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                         <p className="text-[10px] font-medium text-slate-400">Đã bao gồm thuế & phí</p>
                         <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold text-sky-400 hover:bg-white/5 hover:text-white" onClick={() => toastSuccess("Đang chuẩn bị hóa đơn điện tử...")}>Tải hóa đơn</Button>
                      </div>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <span className="text-slate-500">Giá phòng ({nights} đêm)</span>
                    <span className="font-bold text-slate-900">{formatPrice(booking.price?.price * 0.9)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Phí dịch vụ & VAT</span>
                    <span className="font-bold text-slate-900">{formatPrice(booking.price?.price * 0.1)}</span>
                 </div>
                 <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">Tổng cộng</span>
                    <span className="text-xl font-black text-sky-600">{formatPrice(booking.price?.price)}</span>
                 </div>
              </div>
           </Card>

           <div className="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 text-white shadow-xl shadow-slate-900/20">
              <h3 className="mb-6 text-xl font-bold">Hỗ trợ khẩn cấp</h3>
              <div className="space-y-4">
                 <Button className="h-16 w-full justify-between gap-4 rounded-2xl border-none bg-white/5 px-6 text-white shadow-none hover:bg-white/10">
                    <div className="flex items-center gap-4">
                       <div className="rounded-xl bg-sky-500/20 p-2"><PhoneCall className="size-5 text-sky-400" /></div>
                       <div className="text-left">
                          <p className="text-sm font-bold">Lễ tân 24/7</p>
                          <p className="mt-1 text-[9px] font-black uppercase text-white/40">GỌI MIỄN PHÍ</p>
                       </div>
                    </div>
                    <ChevronRight className="size-4 text-white/20" />
                 </Button>
                 <Button className="h-16 w-full justify-between gap-4 rounded-2xl border-none bg-white/5 px-6 text-white shadow-none hover:bg-white/10">
                    <div className="flex items-center gap-4">
                       <div className="rounded-xl bg-sky-500/20 p-2"><MessageSquare className="size-5 text-sky-400" /></div>
                       <div className="text-left">
                          <p className="text-sm font-bold">Trợ lý ảo AI</p>
                          <p className="mt-1 text-[9px] font-black uppercase text-white/40">PHẢN HỒI NGAY</p>
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
                    <Button variant="ghost" className="h-auto p-0 text-xs font-bold text-sky-600 hover:bg-transparent">Xem toàn bộ <ChevronRight className="size-3 ml-1" /></Button>
                 </div>
              </div>
           </Card>

           <Card className="rounded-[32px] border-none bg-rose-50 p-8 shadow-md">
              <div className="flex gap-4">
                 <AlertCircle className="size-6 text-rose-500" />
                 <div>
                    <h3 className="mb-1 text-sm font-bold text-rose-900">Quy tắc hủy phòng</h3>
                    <p className="mb-4 text-[11px] leading-relaxed text-rose-700/70">
                       Hủy miễn phí trước {new Date(new Date(booking.start_date).getTime() - 2*24*60*60*1000).toLocaleDateString("vi-VN")}.
                    </p>
                    <div className="flex flex-col gap-2">
                       {/* Cancel Dialog */}
                       <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" className="h-auto w-fit p-0 text-xs font-bold text-rose-600 hover:bg-transparent">Yêu cầu hủy</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md overflow-hidden rounded-[32px] border-none p-0">
                             <DialogHeader className="bg-rose-600 p-8 text-white">
                                <div className="flex items-center gap-3">
                                   <div className="rounded-full bg-white/20 p-2"><AlertCircle className="size-6" /></div>
                                   <DialogTitle className="text-xl font-black">Xác nhận hủy đơn</DialogTitle>
                                </div>
                                <DialogDescription className="mt-2 text-rose-100">
                                   Bạn có chắc chắn muốn gửi yêu cầu hủy cho đơn hàng #{booking.id}?
                                </DialogDescription>
                             </DialogHeader>
                             <div className="p-8">
                                <div className="space-y-4">
                                   <div className="space-y-2">
                                      <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-wider text-slate-400">Lý do hủy phòng</Label>
                                      <Textarea 
                                        id="reason" 
                                        placeholder="Vui lòng chia sẻ lý do để chúng tôi phục vụ tốt hơn..." 
                                        className="min-h-[100px] rounded-2xl"
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                      />
                                   </div>
                                   <div className="rounded-2xl bg-slate-50 p-4">
                                      <div className="flex items-start gap-3">
                                         <Info className="mt-0.5 size-4 text-slate-400" />
                                         <p className="text-[11px] leading-relaxed text-slate-500">
                                            Yêu cầu của bạn sẽ được bộ phận chăm sóc khách hàng kiểm tra theo chính sách hủy phòng hiện hành.
                                         </p>
                                      </div>
                                   </div>
                                </div>
                             </div>
                             <DialogFooter className="bg-slate-50 p-6">
                                <DialogClose asChild>
                                   <Button variant="ghost" className="rounded-xl">Bỏ qua</Button>
                                </DialogClose>
                                <Button onClick={handleCancelBooking} className="rounded-xl bg-rose-600 hover:bg-rose-700">Gửi yêu cầu hủy</Button>
                             </DialogFooter>
                          </DialogContent>
                       </Dialog>

                       {/* Reschedule Dialog */}
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
                                   <div className="space-y-2">
                                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nhận phòng</Label>
                                      <div className="relative">
                                         <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                         <Input 
                                           type="date" 
                                           className="rounded-xl pl-10" 
                                           value={newStartDate}
                                           onChange={(e) => setNewStartDate(e.target.value)}
                                         />
                                      </div>
                                   </div>
                                   <div className="space-y-2">
                                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trả phòng</Label>
                                      <div className="relative">
                                         <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                         <Input 
                                           type="date" 
                                           className="rounded-xl pl-10" 
                                           value={newEndDate}
                                           onChange={(e) => setNewEndDate(e.target.value)}
                                         />
                                      </div>
                                   </div>
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
                    </div>
                 </div>
              </div>
           </Card>
        </div>

      </div>
    </div>
  );
};

export default BookingDetail;
