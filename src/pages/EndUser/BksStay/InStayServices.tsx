import { useEffect, useState } from "react";
import { 
  Key, 
  Wifi, 
  Coffee, 
  Wind, 
  Wrench, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Copy, 
  RefreshCw,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  AlertCircle,
  XCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import stayService from "@/services/stayService";

const InStayServices = () => {
  const [waterCount, setWaterCount] = useState(2);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashRes: any = await stayService.getDashboard();
        const active = dashRes.data?.active_booking;
        setActiveBooking(active);

        if (active) {
          const serviceRes: any = await stayService.getInStayServices(active.id);
          setServices(serviceRes.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOrderService = async (serviceId: number | string, label: string) => {
    if (!activeBooking) {
      toast.error("Bạn không có kỳ nghỉ nào đang diễn ra.");
      return;
    }
    try {
      await stayService.orderService(activeBooking.id, typeof serviceId === 'string' ? 1 : serviceId, orderNote);
      toast.success(`Đã tiếp nhận yêu cầu: ${label}`);
      setOrderNote(""); // Reset note
      
      // Refresh list
      const dashRes: any = await stayService.getDashboard();
      setActiveBooking(dashRes.data?.active_booking);
    } catch (error) {
      toast.error("Không thể gửi yêu cầu lúc này.");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}!`);
  };

  const fallbackServices = [
    { id: "clean", label: "Dọn dẹp phòng", icon: <Wind className="h-6 w-6" />, desc: "Nhân viên sẽ đến dọn phòng trong 30p", color: "text-sky-600 bg-sky-50" },
    { id: "laundry", label: "Giặt là", icon: <ShoppingCart className="h-6 w-6" />, desc: "Lấy đồ giặt tại phòng", color: "text-indigo-600 bg-indigo-50" },
    { id: "extra", label: "Thêm khăn/Gối", icon: <Plus className="h-6 w-6" />, desc: "Bổ sung đồ dùng cá nhân", color: "text-emerald-600 bg-emerald-50" },
    { id: "fix", label: "Báo cáo sự cố", icon: <Wrench className="h-6 w-6" />, desc: "Sửa chữa thiết bị trong phòng", color: "text-rose-600 bg-rose-50" },
  ];

  const displayedServices = services.length > 0 ? services.map(s => ({
    id: s.id,
    label: s.title,
    icon: <Zap className="h-6 w-6" />, 
    desc: s.description || "Dịch vụ tiện ích BKS Stay",
    color: "text-sky-600 bg-sky-50"
  })) : fallbackServices;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
         <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dịch vụ tại phòng</h1>
         <p className="text-slate-500 text-sm mt-1">Quản lý các tiện ích và yêu cầu dịch vụ ngay trong kỳ nghỉ của bạn.</p>
      </div>

      {!activeBooking && (
        <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-8 text-center flex flex-col items-center">
           <AlertCircle className="h-12 w-12 text-amber-600 mb-4" />
           <h3 className="text-xl font-black text-amber-900">Không tìm thấy kỳ nghỉ đang diễn ra</h3>
           <p className="text-amber-700/70 max-w-md mx-auto mt-2">Tính năng này chỉ khả dụng khi bạn đang trong kỳ lưu trú tại BKS Stay.</p>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${!activeBooking ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        
        {/* Digital Key & Core Access */}
        <div className="space-y-6">
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 p-8 opacity-10">
                 <Key className="h-32 w-32 rotate-12" />
              </div>
              <CardContent className="p-10 relative z-10">
                 <div className="flex items-center gap-3 mb-8">
                    <Badge className="bg-sky-500/20 text-sky-400 border-none px-3 py-1 font-bold rounded-full text-[10px] uppercase tracking-wider">Active Access</Badge>
                    <span className="text-xs text-slate-400 font-bold">
                       {activeBooking ? `Phòng ${activeBooking.room?.title} • ${activeBooking.room?.building?.name}` : "Đang tải..."}
                    </span>
                 </div>
                 
                 <div className="space-y-2 mb-8">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Mã khóa cửa số (Passcode)</p>
                    <div className="flex items-center gap-4">
                       <h2 className="text-6xl font-black tracking-tighter text-white">283944</h2>
                       <Button variant="ghost" size="icon" className="hover:bg-white/10 text-slate-400" onClick={() => toast.info("Đang làm mới mã khóa...")}>
                          <RefreshCw className="h-5 w-5" />
                       </Button>
                    </div>
                 </div>

                 <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                    <div className="flex-1">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cơ chế bảo mật</p>
                       <p className="text-xs text-slate-300">Tự động làm mới sau mỗi 24 giờ</p>
                    </div>
                    <Button className="rounded-2xl h-12 px-6 bg-white text-slate-900 font-black hover:bg-slate-200">Hướng dẫn sử dụng</Button>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white">
              <CardContent className="p-8">
                 <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="h-16 w-16 bg-sky-50 rounded-3xl flex items-center justify-center text-sky-600">
                       <Wifi className="h-8 w-8" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                       <h3 className="text-lg font-black text-slate-900">Thông tin Wifi</h3>
                       <p className="text-sm font-bold text-slate-500">BKS_STAY_FREE_5G</p>
                    </div>
                    <Button 
                      onClick={() => copyToClipboard("bksstay2026", "mật khẩu Wifi")}
                      className="rounded-2xl h-12 px-6 bg-slate-900 font-black flex items-center gap-2"
                    >
                       <Copy className="h-4 w-4" /> Sao chép mật khẩu
                    </Button>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Room Service Requests */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-900">Yêu cầu nhanh</h3>
           </div>
           
           <div className="px-2">
              <Input 
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Ghi chú thêm (VD: Phòng cần thêm 2 gối, dọn dẹp lúc 10h...)"
                className="rounded-2xl border-slate-200 bg-white shadow-sm h-12 text-sm"
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedServices.map((service) => (
                <Card 
                  key={service.id} 
                  className="border-2 border-transparent shadow-md rounded-[28px] bg-white transition-all hover:border-sky-200 cursor-pointer group"
                  onClick={() => handleOrderService(service.id, service.label)}
                >
                  <CardContent className="p-6">
                     <div className={`h-12 w-12 rounded-2xl ${service.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                        {service.icon}
                     </div>
                     <p className="text-sm font-black text-slate-900 mb-1">{service.label}</p>
                     <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{service.desc}</p>
                  </CardContent>
                </Card>
              ))}
           </div>

           {/* Custom Request Mockup */}
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-sky-50 overflow-hidden">
              <CardContent className="p-8">
                 <div className="flex items-center gap-2 mb-6">
                    <Coffee className="h-5 w-5 text-sky-600" />
                    <h3 className="text-lg font-black text-sky-900">Gọi thêm nước suối</h3>
                 </div>
                 
                 <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
                    <div className="space-y-1">
                       <p className="text-sm font-bold text-slate-900">Nước Aquafina (500ml)</p>
                       <p className="text-xs text-slate-400">Miễn phí 2 chai đầu/ngày</p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="h-8 w-8 rounded-lg" 
                         onClick={(e) => { e.stopPropagation(); setWaterCount(Math.max(1, waterCount - 1)); }}
                       >
                          <Minus className="h-4 w-4" />
                       </Button>
                       <span className="font-black text-lg w-4 text-center">{waterCount}</span>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="h-8 w-8 rounded-lg" 
                         onClick={(e) => { e.stopPropagation(); setWaterCount(waterCount + 1); }}
                       >
                          <Plus className="h-4 w-4" />
                       </Button>
                    </div>
                 </div>

                 <Button 
                   onClick={() => handleOrderService("water", "Gọi thêm nước suối")}
                   className="w-full mt-6 rounded-2xl h-14 bg-sky-600 hover:bg-sky-500 font-black shadow-lg shadow-sky-600/20"
                 >
                    Xác nhận gọi thêm
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Emergency & Tracking */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 ${!activeBooking ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white p-8">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Tiến độ yêu cầu</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                // Refresh data logic
                const fetchData = async () => {
                  if (activeBooking) {
                    const dashRes: any = await stayService.getDashboard();
                    setActiveBooking(dashRes.data?.active_booking);
                  }
                };
                fetchData();
              }} className="text-sky-600 hover:text-sky-700 font-bold gap-2">
                <RefreshCw size={14} /> Làm mới
              </Button>
           </div>
           
           <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {activeBooking?.booking_services && activeBooking.booking_services.length > 0 ? (
                activeBooking.booking_services.map((req: any, idx: number) => {
                  const isLast = idx === activeBooking.booking_services.length - 1;
                  const statusInfo = ({
                    0: { label: 'Chờ xử lý', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: <Clock size={20} className="text-amber-600" /> },
                    1: { label: 'Đang xử lý', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: <RefreshCw size={20} className="text-blue-600 animate-spin" /> },
                    2: { label: 'Hoàn thành', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: <CheckCircle2 size={20} className="text-emerald-600" /> },
                    3: { label: 'Đã hủy', color: 'text-rose-600', bgColor: 'bg-rose-50', icon: <XCircle size={20} className="text-rose-600" /> },
                  } as any)[req.pivot?.status || 0] || { label: 'N/A', color: 'text-slate-400', bgColor: 'bg-slate-50', icon: <Clock size={20} /> };

                  return (
                    <div key={req.id} className="flex gap-4 relative">
                      {!isLast && <div className="absolute left-6 top-10 bottom-0 w-[1px] bg-slate-100" />}
                      <div className={`h-12 w-12 ${statusInfo.bgColor} rounded-2xl flex items-center justify-center shrink-0 border border-transparent`}>
                        {statusInfo.icon}
                      </div>
                      <div className="flex-1 pt-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-slate-900">{req.title || 'Dịch vụ'}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.label.toUpperCase()}
                          </span>
                        </div>
                        {req.pivot?.note && (
                          <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg">"{req.pivot.note}"</p>
                        )}
                        <p className="text-[10px] text-slate-400 font-medium mt-1">
                          Yêu cầu lúc: {new Date(req.pivot?.created_at || Date.now()).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center text-slate-400 italic text-sm">
                   Chưa có yêu cầu dịch vụ nào trong kỳ nghỉ này.
                </div>
              )}
           </div>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-rose-50 p-8 flex flex-col justify-center items-center text-center">
           <div className="h-20 w-20 bg-white rounded-3xl shadow-md text-rose-600 flex items-center justify-center mb-6">
              <Trash2 className="h-10 w-10" />
           </div>
           <h3 className="text-xl font-black text-rose-900 mb-2">Hỗ trợ khẩn cấp</h3>
           <p className="text-rose-700/60 text-sm font-medium leading-relaxed mb-6 px-4">
              Nếu bạn cần hỗ trợ y tế hoặc bình cứu hỏa, vui lòng nhấn nút bên dưới.
           </p>
           <Button className="w-full rounded-2xl h-14 bg-rose-600 hover:bg-rose-500 font-black shadow-lg shadow-rose-600/20">Gọi cứu hộ (S.O.S)</Button>
        </Card>
      </div>
    </div>
  );
};

export default InStayServices;
