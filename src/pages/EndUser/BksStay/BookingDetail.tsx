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

const BookingDetail = () => {
  const { id } = useParams();
  const [showWifi, setShowWifi] = useState(false);
  const [countdown, setCountdown] = useState({ days: 2, hours: 14, mins: 45 });

  // Mock data for the specific booking
  const bookingData = {
    id: id || "BKS-99283",
    roomTitle: "Phòng Luxury Ocean View",
    guestName: "Nguyễn Văn A",
    startDate: "20/04/2026",
    endDate: "23/04/2026",
    totalPrice: 4500000,
    address: "Số 123, Đường Võ Nguyên Giáp, Quận Ngũ Hành Sơn, Đà Nẵng",
    wifiSsid: "BKS_Premium_Guest",
    wifiPass: "stay_at_bks_2026",
    roomNumber: "808",
    entryCode: "283944",
    status: "confirmed"
  };

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

  const handleShare = () => {
    navigator.clipboard.writeText(`Thông tin đặt phòng BKS Stay: ${bookingData.roomTitle} tại ${bookingData.address}. Mã đơn: ${bookingData.id}`);
    toast.success("Đã sao chép thông tin để chia sẻ!");
  };

  const openInMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bookingData.address)}`, "_blank");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Back Navigation & Share */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" asChild className="rounded-xl h-10 px-3 hover:bg-white text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all">
          <Link to={ROUTERS.BKS_STAY_HISTORY} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
        </Button>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="rounded-xl h-10 gap-2 border-slate-200" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Chia sẻ
           </Button>
        </div>
      </div>

      {/* Floating Hero Section */}
      <section className="relative h-[280px] overflow-hidden rounded-[32px] shadow-2xl shadow-slate-900/10">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury Room" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center px-10 md:px-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-300 backdrop-blur-md mb-6 border border-sky-500/30 w-fit">
            <Zap className="h-3 w-3" />
            Chi tiết kỳ nghỉ của bạn
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            {bookingData.roomTitle}
          </h1>
          
          <div className="flex flex-wrap gap-6 items-center">
             <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center min-w-[60px]">
                   <div className="text-lg font-bold text-white leading-none">{countdown.days}</div>
                   <div className="text-[9px] uppercase text-white/60 font-black mt-1">Ngày</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center min-w-[60px]">
                   <div className="text-lg font-bold text-white leading-none">{countdown.hours}</div>
                   <div className="text-[9px] uppercase text-white/60 font-black mt-1">Giờ</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center min-w-[60px]">
                   <div className="text-lg font-bold text-white leading-none">{countdown.mins}</div>
                   <div className="text-[9px] uppercase text-white/60 font-black mt-1">Phút</div>
                </div>
             </div>
             <div className="text-white/60 text-xs font-medium max-w-[150px]">đến thời điểm nhận phòng dự kiến.</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Specifics */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Booking Details Card */}
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                   Mã đơn hàng <span className="text-sky-600">#{bookingData.id}</span>
                </h2>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-4 py-1.5 rounded-full font-bold">ĐÃ XÁC NHẬN</Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-sky-600 border border-slate-100"><CalendarDays className="h-6 w-6" /></div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Thời gian lưu trú</p>
                      <p className="font-bold text-slate-900">{bookingData.startDate} — {bookingData.endDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-sky-600 border border-slate-100"><MapPin className="h-6 w-6" /></div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Địa chỉ phòng</p>
                      <p className="font-bold text-slate-900 leading-snug">{bookingData.address}</p>
                      <button onClick={openInMaps} className="text-sky-600 text-[10px] font-black uppercase mt-1 flex items-center gap-1 hover:underline">
                         Mở trong bản đồ <ExternalLink className="h-2 w-2" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-[32px] p-6 text-white flex flex-col justify-between shadow-xl shadow-slate-900/10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5"><Copy className="h-20 w-20" /></div>
                   <div className="relative z-10">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Tổng thanh toán</p>
                      <p className="text-2xl font-black text-white">{formatPrice(bookingData.totalPrice)}</p>
                   </div>
                   <div className="mt-4 flex items-center justify-between relative z-10">
                      <p className="text-xs text-slate-400 font-medium">Bao gồm VAT & Phí dịch vụ</p>
                      <Button variant="ghost" size="sm" className="text-sky-400 hover:text-white hover:bg-white/5 font-bold" onClick={() => toast.success("Đang tải hóa đơn...")}>Hóa đơn</Button>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg rounded-[32px] bg-sky-900 text-white overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Wifi className="h-32 w-32" />
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-sky-500/20 backdrop-blur-md rounded-2xl border border-sky-500/20">
                    <Wifi className="h-6 w-6 text-sky-400" />
                  </div>
                  <button onClick={() => setShowWifi(!showWifi)} className="text-[10px] font-black uppercase tracking-widest text-sky-400 hover:text-white transition-colors">
                    {showWifi ? "Ẩn" : "Hiện"} pass
                  </button>
                </div>
                <h3 className="text-xl font-bold mb-4">Kết nối Wi-Fi</h3>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                      <span className="text-sky-400 font-medium">SSID</span>
                      <span className="font-mono font-bold tracking-tight">{bookingData.wifiSsid}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm pt-1">
                      <span className="text-sky-400 font-medium">Password</span>
                      <div className="flex items-center gap-2">
                         <span className="font-mono font-bold text-lg tracking-wider">
                           {showWifi ? bookingData.wifiPass : "••••••••••••"}
                         </span>
                         {showWifi && (
                           <button onClick={() => { navigator.clipboard.writeText(bookingData.wifiPass); toast.success("Đã copy mật khẩu!"); }} className="p-1 hover:bg-white/10 rounded">
                              <Copy className="h-3 w-3 text-sky-400" />
                           </button>
                         )}
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-[32px] bg-white border border-slate-100 relative group overflow-hidden">
               <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                <Key className="h-32 w-32" />
              </div>
              <CardContent className="p-8">
                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/10 w-fit mb-6">
                    <Key className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Truy cập phòng</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Số phòng</p>
                      <p className="text-2xl font-black text-slate-900">P.{bookingData.roomNumber}</p>
                   </div>
                   <div>
                      <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Mã cửa</p>
                      <p className="text-2xl font-black bg-gradient-to-br from-amber-600 to-rose-600 bg-clip-text text-transparent tracking-widest">
                        {bookingData.entryCode}
                      </p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guide Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={openInMaps} variant="outline" className="h-auto py-8 rounded-[32px] flex flex-col gap-3 border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50 transition-all group">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Navigation className="h-6 w-6" />
                </div>
                <span className="font-bold text-slate-900">Hướng dẫn đường đi</span>
              </Button>
              <Button variant="outline" className="h-auto py-8 rounded-[32px] flex flex-col gap-3 border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50 transition-all group" onClick={() => toast.info("Check-in để xem hướng dẫn gửi xe")}>
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Car className="h-6 w-6" />
                </div>
                <span className="font-bold text-slate-900">Nơi gửi xe gần nhất</span>
              </Button>
              <Button variant="outline" className="h-auto py-8 rounded-[32px] flex flex-col gap-3 border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50 transition-all group" onClick={() => toast.info("Đang liệt kê các dịch vụ lân cận...")}>
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Coffee className="h-6 w-6" />
                </div>
                <span className="font-bold text-slate-900">Tiện ích ăn uống</span>
              </Button>
          </div>
        </div>

        {/* Right Column: Support & Policy */}
        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[32px] p-8 text-white relative shadow-xl shadow-slate-900/20 overflow-hidden">
              <div className="absolute -right-8 -top-8 h-32 w-32 bg-white/5 rounded-full blur-3xl" />
              <h3 className="text-xl font-bold mb-6">Hỗ trợ khẩn cấp</h3>
              <div className="space-y-4">
                 <Button className="w-full h-16 justify-between px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white gap-4 border-none shadow-none">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-sky-500/20 rounded-xl"><PhoneCall className="h-5 w-5 text-sky-400" /></div>
                       <div className="text-left leading-tight">
                          <p className="text-sm font-bold">Lễ tân 24/7</p>
                          <p className="text-[9px] text-white/40 uppercase font-black mt-1">GỌI MIỄN PHÍ</p>
                       </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/20" />
                 </Button>
                 <Button className="w-full h-16 justify-between px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white gap-4 border-none shadow-none">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-sky-500/20 rounded-xl"><MessageSquare className="h-5 w-5 text-sky-400" /></div>
                       <div className="text-left leading-tight">
                          <p className="text-sm font-bold">Trợ lý ảo AI</p>
                          <p className="text-[9px] text-white/40 uppercase font-black mt-1">PHẢN HỒI NGAY</p>
                       </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/20" />
                 </Button>
              </div>
           </div>

           <Card className="border-none shadow-md rounded-[32px] bg-white border border-slate-100 p-8">
              <div className="flex gap-4">
                 <div className="h-10 w-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 shrink-0"><Info className="h-5 w-5" /></div>
                 <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Nội quy & Chính sách</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                      Vui lòng tham khảo các quy định về giờ giấc, vật nuôi và an toàn phòng cháy chữa cháy của phòng này.
                    </p>
                    <Button variant="ghost" className="p-0 h-auto w-fit text-sky-600 text-xs font-bold hover:no-underline hover:text-sky-800 hover:bg-transparent flex items-center gap-1 group">
                       Xem toàn bộ nội quy <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                 </div>
              </div>
           </Card>

           <Card className="border-none shadow-md rounded-[32px] bg-rose-50 border border-rose-100 p-8">
              <div className="flex gap-4">
                 <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
                 <div>
                    <h3 className="text-sm font-bold text-rose-900 mb-1">Quy tắc hủy phòng</h3>
                    <p className="text-[11px] text-rose-700/70 leading-relaxed mb-4">
                      Bạn được miễn phí hủy đơn trước ngày 15/04/2026. Phí hủy đơn sau ngày này là 100% giá trị đơn hàng.
                    </p>
                    <div className="flex flex-col gap-2">
                       <Button variant="ghost" className="p-0 h-auto w-fit text-rose-600 text-xs font-bold hover:no-underline hover:text-rose-800 hover:bg-transparent" onClick={() => toast.warning("Yêu cầu hủy đã được gửi đến quản trị viên")}>Yêu cầu hủy đơn</Button>
                       <Button variant="ghost" className="p-0 h-auto w-fit text-rose-600 text-xs font-bold hover:no-underline hover:text-rose-800 hover:bg-transparent" onClick={() => toast.info("Vui lòng chọn ngày mới để dời lịch")}>Yêu cầu dời ngày</Button>
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
