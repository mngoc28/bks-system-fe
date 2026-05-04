import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  Car,
  Navigation,
  ArrowLeft,
  Share2,
  Info,
  ExternalLink,
  Copy
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTERS } from "@/constant";
import { formatPrice } from "@/utils/utils";
import { toast } from "sonner";

import stayService, { BookingDetail as IBookingDetail } from "@/services/stayService";

const BookingDetail = () => {
  const { id } = useParams();
  const [showWifi, setShowWifi] = useState(false);
  const [booking, setBooking] = useState<IBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res: any = await stayService.getBookingDetail(id);
        if (res.status === "success") {
          setBooking(res.data);
          
          // Calculate countdown
          const start = new Date(res.data.start_date);
          const now = new Date();
          const diff = start.getTime() - now.getTime();
          
          if (diff > 0) {
            setCountdown({
              days: Math.floor(diff / (1000 * 60 * 60 * 24)),
              hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
              mins: Math.floor((diff / (1000 * 60)) % 60),
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch booking detail", error);
        toast.error("Không thể tải thông tin đặt phòng.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
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
    navigator.clipboard.writeText(`Thông tin đặt phòng BKS Stay: ${booking.room?.title || "Phòng"} tại ${booking.room?.building?.address || "địa chỉ hệ thống"}. Mã đơn: ${booking.id}`);
    toast.success("Đã sao chép thông tin để chia sẻ!");
  };

  const openInMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.room?.building?.address || "")}`, "_blank");
  };

  return (
    <div className="space-y-8 pb-20 duration-500 animate-in fade-in slide-in-from-bottom-4">
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

      {/* Floating Hero Section */}
      <section className="relative h-[280px] overflow-hidden rounded-[32px] shadow-2xl shadow-slate-900/10">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury Room" 
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-center px-10 md:px-12">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-300 backdrop-blur-md">
            <Zap className="size-3" />
            Chi tiết kỳ nghỉ của bạn
          </div>
            {booking.room?.title || "Kỳ nghỉ của bạn"}
          
          <div className="flex flex-wrap items-center gap-6">
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
             </div>
             <div className="max-w-[150px] text-xs font-medium text-white/60">đến thời điểm nhận phòng dự kiến.</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Column: Specifics */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* Main Booking Details Card */}
          <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
            <CardContent className="p-8">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                   Mã đơn hàng <span className="text-sky-600">#{booking.id}</span>
                </h2>
                <Badge className="rounded-full border-none bg-emerald-100 px-4 py-1.5 font-bold text-emerald-700 hover:bg-emerald-100">
                   {booking.status === 1 ? "ĐÃ XÁC NHẬN" : booking.status === 2 ? "HOÀN THÀNH" : "CHỜ XÁC NHẬN"}
                </Badge>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sky-600"><CalendarDays className="size-6" /></div>
                    <div>
                      <p className="mb-1 text-[10px] font-black uppercase leading-none tracking-widest text-slate-400">Thời gian lưu trú</p>
                      <p className="font-bold text-slate-900">
                         {new Date(booking.start_date).toLocaleDateString("vi-VN")} — {new Date(booking.end_date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sky-600"><MapPin className="size-6" /></div>
                    <div className="flex-1">
                      <p className="mb-1 text-[10px] font-black uppercase leading-none tracking-widest text-slate-400">Địa chỉ phòng</p>
                      <p className="font-bold leading-snug text-slate-900">{booking.room?.building?.address || "Địa chỉ chưa cập nhật"}</p>
                      <button onClick={openInMaps} className="mt-1 flex items-center gap-1 text-[10px] font-black uppercase text-sky-600 hover:underline">
                         Mở trong bản đồ <ExternalLink className="size-2" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="relative flex flex-col justify-between overflow-hidden rounded-[32px] bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
                   <div className="absolute right-0 top-0 p-4 opacity-5"><Copy className="size-20" /></div>
                   <div className="relative z-10">
                      <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">Tổng thanh toán</p>
                      <p className="text-2xl font-black text-white">{formatPrice(booking.price?.price || 0)}</p>
                   </div>
                   <div className="relative z-10 mt-4 flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-400">Bao gồm VAT & Phí dịch vụ</p>
                      <Button variant="ghost" size="sm" className="font-bold text-sky-400 hover:bg-white/5 hover:text-white" onClick={() => toast.success("Đang tải hóa đơn...")}>Hóa đơn</Button>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Grid */}
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
                           <button onClick={() => { navigator.clipboard.writeText("stay_at_bks_2026"); toast.success("Đã copy mật khẩu!"); }} className="rounded p-1 hover:bg-white/10">
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

          {/* Guide Buttons */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Button onClick={openInMaps} variant="outline" className="group flex h-auto flex-col gap-3 rounded-[32px] border-slate-200 bg-white py-8 transition-all hover:border-sky-300 hover:bg-sky-50">
                <div className="rounded-2xl bg-slate-50 p-3 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                  <Navigation className="size-6" />
                </div>
                <span className="font-bold text-slate-900">Hướng dẫn đường đi</span>
              </Button>
              <Button variant="outline" className="group flex h-auto flex-col gap-3 rounded-[32px] border-slate-200 bg-white py-8 transition-all hover:border-sky-300 hover:bg-sky-50" onClick={() => toast.info("Check-in để xem hướng dẫn gửi xe")}>
                <div className="rounded-2xl bg-slate-50 p-3 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                  <Car className="size-6" />
                </div>
                <span className="font-bold text-slate-900">Nơi gửi xe gần nhất</span>
              </Button>
              <Button variant="outline" className="group flex h-auto flex-col gap-3 rounded-[32px] border-slate-200 bg-white py-8 transition-all hover:border-sky-300 hover:bg-sky-50" onClick={() => toast.info("Đang liệt kê các dịch vụ lân cận...")}>
                <div className="rounded-2xl bg-slate-50 p-3 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                  <Coffee className="size-6" />
                </div>
                <span className="font-bold text-slate-900">Tiện ích ăn uống</span>
              </Button>
          </div>
        </div>

        {/* Right Column: Support & Policy */}
        <div className="space-y-8">
           <div className="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 text-white shadow-xl shadow-slate-900/20">
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/5 blur-3xl" />
              <h3 className="mb-6 text-xl font-bold">Hỗ trợ khẩn cấp</h3>
              <div className="space-y-4">
                 <Button className="h-16 w-full justify-between gap-4 rounded-2xl border-none bg-white/5 px-6 text-white shadow-none hover:bg-white/10">
                    <div className="flex items-center gap-4">
                       <div className="rounded-xl bg-sky-500/20 p-2"><PhoneCall className="size-5 text-sky-400" /></div>
                       <div className="text-left leading-tight">
                          <p className="text-sm font-bold">Lễ tân 24/7</p>
                          <p className="mt-1 text-[9px] font-black uppercase text-white/40">GỌI MIỄN PHÍ</p>
                       </div>
                    </div>
                    <ChevronRight className="size-4 text-white/20" />
                 </Button>
                 <Button className="h-16 w-full justify-between gap-4 rounded-2xl border-none bg-white/5 px-6 text-white shadow-none hover:bg-white/10">
                    <div className="flex items-center gap-4">
                       <div className="rounded-xl bg-sky-500/20 p-2"><MessageSquare className="size-5 text-sky-400" /></div>
                       <div className="text-left leading-tight">
                          <p className="text-sm font-bold">Trợ lý ảo AI</p>
                          <p className="mt-1 text-[9px] font-black uppercase text-white/40">PHẢN HỒI NGAY</p>
                       </div>
                    </div>
                    <ChevronRight className="size-4 text-white/20" />
                 </Button>
              </div>
           </div>

           <Card className="rounded-[32px] border border-none border-slate-100 bg-white p-8 shadow-md">
              <div className="flex gap-4">
                 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Info className="size-5" /></div>
                 <div>
                    <h3 className="mb-1 text-sm font-bold text-slate-900">Nội quy & Chính sách</h3>
                    <p className="mb-4 text-[11px] leading-relaxed text-slate-500">
                      Vui lòng tham khảo các quy định về giờ giấc, vật nuôi và an toàn phòng cháy chữa cháy của phòng này.
                    </p>
                    <Button variant="ghost" className="group flex h-auto w-fit items-center gap-1 p-0 text-xs font-bold text-sky-600 hover:bg-transparent hover:text-sky-800 hover:no-underline">
                       Xem toàn bộ nội quy <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                 </div>
              </div>
           </Card>

           <Card className="rounded-[32px] border border-none border-rose-100 bg-rose-50 p-8 shadow-md">
              <div className="flex gap-4">
                 <AlertCircle className="size-6 shrink-0 text-rose-500" />
                 <div>
                    <h3 className="mb-1 text-sm font-bold text-rose-900">Quy tắc hủy phòng</h3>
                    <p className="mb-4 text-[11px] leading-relaxed text-rose-700/70">
                      Bạn được miễn phí hủy đơn trước ngày 15/04/2026. Phí hủy đơn sau ngày này là 100% giá trị đơn hàng.
                    </p>
                    <div className="flex flex-col gap-2">
                       <Button variant="ghost" className="h-auto w-fit p-0 text-xs font-bold text-rose-600 hover:bg-transparent hover:text-rose-800 hover:no-underline" onClick={() => toast.warning("Yêu cầu hủy đã được gửi đến quản trị viên")}>Yêu cầu hủy đơn</Button>
                       <Button variant="ghost" className="h-auto w-fit p-0 text-xs font-bold text-rose-600 hover:bg-transparent hover:text-rose-800 hover:no-underline" onClick={() => toast.info("Vui lòng chọn ngày mới để dời lịch")}>Yêu cầu dời ngày</Button>
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
