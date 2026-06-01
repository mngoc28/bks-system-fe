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
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toastSuccess, toastError, toastInfo } from "@/components/ui/toast";
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
      toastError("Bạn không có kỳ nghỉ nào đang diễn ra.");
      return;
    }
    try {
      await stayService.orderService(activeBooking.id, typeof serviceId === 'string' ? 1 : serviceId, orderNote);
      toastSuccess(`Đã tiếp nhận yêu cầu: ${label}`);
      setOrderNote(""); // Reset note
      
      // Refresh list
      const dashRes: any = await stayService.getDashboard();
      setActiveBooking(dashRes.data?.active_booking);
    } catch {
      toastError("Không thể gửi yêu cầu lúc này.");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toastSuccess(`Đã sao chép ${label}!`);
  };

  const fallbackServices = [
    { id: "clean", label: "Dọn dẹp phòng", icon: <Wind className="size-6" />, desc: "Nhân viên sẽ đến dọn phòng trong 30p", color: "text-sky-600 bg-sky-50" },
    { id: "laundry", label: "Giặt là", icon: <ShoppingCart className="size-6" />, desc: "Lấy đồ giặt tại phòng", color: "text-indigo-600 bg-indigo-50" },
    { id: "extra", label: "Thêm khăn/Gối", icon: <Plus className="size-6" />, desc: "Bổ sung đồ dùng cá nhân", color: "text-emerald-600 bg-emerald-50" },
    { id: "fix", label: "Báo cáo sự cố", icon: <Wrench className="size-6" />, desc: "Sửa chữa thiết bị trong phòng", color: "text-rose-600 bg-rose-50" },
  ];

  const displayedServices = services.length > 0 ? services.map(s => ({
    id: s.id,
    label: s.title,
    icon: <Zap className="size-6" />, 
    desc: s.description || "Dịch vụ tiện ích BKS Stay",
    color: "text-sky-600 bg-sky-50"
  })) : fallbackServices;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div>
         <h1 className="text-3xl font-black tracking-tight text-slate-900">Dịch vụ tại phòng</h1>
         <p className="mt-1 text-sm text-slate-500">Quản lý các tiện ích và yêu cầu dịch vụ ngay trong kỳ nghỉ của bạn.</p>
      </div>

      {!activeBooking && (
        <div className="flex flex-col items-center rounded-[32px] border border-amber-100 bg-amber-50 p-8 text-center">
           <AlertCircle className="mb-4 size-12 text-amber-600" />
           <h3 className="text-xl font-black text-amber-900">Không tìm thấy kỳ nghỉ đang diễn ra</h3>
           <p className="mx-auto mt-2 max-w-md text-amber-700/70">Tính năng này chỉ khả dụng khi bạn đang trong kỳ lưu trú tại BKS Stay.</p>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-8 lg:grid-cols-2 ${!activeBooking ? 'pointer-events-none opacity-50 grayscale' : ''}`}>
        
        {/* Digital Key & Core Access */}
        <div className="space-y-6">
           <Card className="relative overflow-hidden rounded-[32px] border-none bg-slate-900 text-white shadow-xl shadow-slate-200/50">
              <div className="absolute right-0 top-0 p-8 opacity-10">
                 <Key className="size-32 rotate-12" />
              </div>
              <CardContent className="relative z-10 p-10">
                 <div className="mb-8 flex items-center gap-3">
                    <Badge className="rounded-full border-none bg-sky-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-400">Active Access</Badge>
                    <span className="text-xs font-bold text-slate-400">
                       {activeBooking ? `Phòng ${activeBooking.room?.title} • ${activeBooking.room?.property?.name}` : "Đang tải..."}
                    </span>
                 </div>
                 
                 <div className="mb-8 space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Mã khóa cửa số (Passcode)</p>
                    <div className="flex items-center gap-4">
                       <h2 className="text-6xl font-black tracking-tighter text-white">283944</h2>
                       <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-white/10" onClick={() => toastInfo("Đang làm mới mã khóa...")}>
                          <RefreshCw className="size-5" />
                       </Button>
                    </div>
                 </div>

                 <div className="flex items-center gap-6 border-t border-white/5 pt-4">
                    <div className="flex-1">
                       <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Cơ chế bảo mật</p>
                       <p className="text-xs text-slate-300">Tự động làm mới sau mỗi 24 giờ</p>
                    </div>
                    <Button className="h-12 rounded-2xl bg-white px-6 font-black text-slate-900 hover:bg-slate-200">Hướng dẫn sử dụng</Button>
                 </div>
              </CardContent>
           </Card>

           <Card className="rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
              <CardContent className="p-8">
                 <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <div className="flex size-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600">
                       <Wifi className="size-8" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                       <h3 className="text-lg font-black text-slate-900">Thông tin Wifi</h3>
                       <p className="text-sm font-bold text-slate-500">BKS_STAY_FREE_5G</p>
                    </div>
                    <Button 
                      onClick={() => copyToClipboard("bksstay2026", "mật khẩu Wifi")}
                      className="flex h-12 items-center gap-2 rounded-2xl bg-slate-900 px-6 font-black"
                    >
                       <Copy className="size-4" /> Sao chép mật khẩu
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
                className="h-12 rounded-2xl border-slate-200 bg-white text-sm shadow-sm"
              />
           </div>

           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {displayedServices.map((service) => (
                <Card 
                  key={service.id} 
                  className="group cursor-pointer rounded-[28px] border-2 border-transparent bg-white shadow-md transition-all hover:border-sky-200"
                  onClick={() => handleOrderService(service.id, service.label)}
                >
                  <CardContent className="p-6">
                     <div className={`size-12 rounded-2xl ${service.color} mb-4 flex items-center justify-center transition-transform group-hover:scale-110`}>
                        {service.icon}
                     </div>
                     <p className="mb-1 text-sm font-black text-slate-900">{service.label}</p>
                     <p className="text-[11px] font-medium leading-relaxed text-slate-400">{service.desc}</p>
                  </CardContent>
                </Card>
              ))}
           </div>

           {/* Custom Request Mockup */}
           <Card className="overflow-hidden rounded-[32px] border-none bg-sky-50 shadow-xl shadow-slate-200/50">
              <CardContent className="p-8">
                 <div className="mb-6 flex items-center gap-2">
                    <Coffee className="size-5 text-sky-600" />
                    <h3 className="text-lg font-black text-sky-900">Gọi thêm nước suối</h3>
                 </div>
                 
                 <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                    <div className="space-y-1">
                       <p className="text-sm font-bold text-slate-900">Nước Aquafina (500ml)</p>
                       <p className="text-xs text-slate-400">Miễn phí 2 chai đầu/ngày</p>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-2">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="size-8 rounded-lg" 
                         onClick={(e) => { e.stopPropagation(); setWaterCount(Math.max(1, waterCount - 1)); }}
                       >
                          <Minus className="size-4" />
                       </Button>
                       <span className="w-4 text-center text-lg font-black">{waterCount}</span>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="size-8 rounded-lg" 
                         onClick={(e) => { e.stopPropagation(); setWaterCount(waterCount + 1); }}
                       >
                          <Plus className="size-4" />
                       </Button>
                    </div>
                 </div>

                 <Button 
                   onClick={() => handleOrderService("water", "Gọi thêm nước suối")}
                   className="mt-6 h-14 w-full rounded-2xl bg-sky-600 font-black shadow-lg shadow-sky-600/20 hover:bg-sky-500"
                 >
                    Xác nhận gọi thêm
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Emergency & Tracking */}
      <div className={`grid grid-cols-1 gap-8 pt-4 lg:grid-cols-3 ${!activeBooking ? 'pointer-events-none opacity-50 grayscale' : ''}`}>
        <Card className="rounded-[32px] border-none bg-white p-8 shadow-xl shadow-slate-200/50 lg:col-span-2">
           <div className="mb-6 flex items-center justify-between">
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
              }} className="gap-2 font-bold text-sky-600 hover:text-sky-700">
                <RefreshCw size={14} /> Làm mới
              </Button>
           </div>
           
           <div className="scrollbar-hide max-h-[400px] space-y-6 overflow-y-auto pr-2">
              {activeBooking?.booking_services && activeBooking.booking_services.length > 0 ? (
                activeBooking.booking_services.map((req: any, idx: number) => {
                  const isLast = idx === activeBooking.booking_services.length - 1;
                  const statusInfo = ({
                    0: { label: 'Chờ xử lý', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: <Clock size={20} className="text-amber-600" /> },
                    1: { label: 'Đang xử lý', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: <RefreshCw size={20} className="animate-spin text-blue-600" /> },
                    2: { label: 'Hoàn thành', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: <CheckCircle2 size={20} className="text-emerald-600" /> },
                    3: { label: 'Đã hủy', color: 'text-rose-600', bgColor: 'bg-rose-50', icon: <XCircle size={20} className="text-rose-600" /> },
                  } as any)[req.pivot?.status || 0] || { label: 'N/A', color: 'text-slate-400', bgColor: 'bg-slate-50', icon: <Clock size={20} /> };

                  return (
                    <div key={req.id} className="relative flex gap-4">
                      {!isLast && <div className="absolute bottom-0 left-6 top-10 w-px bg-slate-100" />}
                      <div className={`size-12 ${statusInfo.bgColor} flex shrink-0 items-center justify-center rounded-2xl border border-transparent`}>
                        {statusInfo.icon}
                      </div>
                      <div className="flex-1 pb-4 pt-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-slate-900">{req.title || 'Dịch vụ'}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.label.toUpperCase()}
                          </span>
                        </div>
                        {req.pivot?.note && (
                          <p className="mt-1 rounded-lg bg-slate-50 p-2 text-[11px] italic text-slate-500">"{req.pivot.note}"</p>
                        )}
                        <p className="mt-1 text-[10px] font-medium text-slate-400">
                          Yêu cầu lúc: {new Date(req.pivot?.created_at || Date.now()).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center text-sm italic text-slate-400">
                   Chưa có yêu cầu dịch vụ nào trong kỳ nghỉ này.
                </div>
              )}
           </div>
        </Card>

        <Card className="flex flex-col items-center justify-center rounded-[32px] border-none bg-rose-50 p-8 text-center shadow-xl shadow-slate-200/50">
           <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-white text-rose-600 shadow-md">
              <Trash2 className="size-10" />
           </div>
           <h3 className="mb-2 text-xl font-black text-rose-900">Hỗ trợ khẩn cấp</h3>
           <p className="mb-6 px-4 text-sm font-medium leading-relaxed text-rose-700/60">
              Nếu bạn cần hỗ trợ y tế hoặc bình cứu hỏa, vui lòng nhấn nút bên dưới.
           </p>
           <Button className="h-14 w-full rounded-2xl bg-rose-600 font-black shadow-lg shadow-rose-600/20 hover:bg-rose-500">Gọi cứu hộ (S.O.S)</Button>
        </Card>
      </div>
    </div>
  );
};

export default InStayServices;

