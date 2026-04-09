import { useState } from "react";
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
  ShoppingCart
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const InStayServices = () => {
  const [waterCount, setWaterCount] = useState(2);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}!`);
  };

  const roomServices = [
    { id: "clean", label: "Dọn dẹp phòng", icon: <Wind className="h-6 w-6" />, desc: "Nhân viên sẽ đến dọn phòng trong 30p", color: "text-sky-600 bg-sky-50" },
    { id: "laundry", label: "Giặt là", icon: <ShoppingCart className="h-6 w-6" />, desc: "Lấy đồ giặt tại phòng", color: "text-indigo-600 bg-indigo-50" },
    { id: "extra", label: "Thêm khăn/Gối", icon: <Plus className="h-6 w-6" />, desc: "Bổ sung đồ dùng cá nhân", color: "text-emerald-600 bg-emerald-50" },
    { id: "fix", label: "Báo cáo sự cố", icon: <Wrench className="h-6 w-6" />, desc: "Sửa chữa thiết bị trong phòng", color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
         <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dịch vụ tại phòng</h1>
         <p className="text-slate-500 text-sm mt-1">Quản lý các tiện ích và yêu cầu dịch vụ ngay trong kỳ nghỉ của bạn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Digital Key & Core Access */}
        <div className="space-y-6">
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 p-8 opacity-10">
                 <Key className="h-32 w-32 rotate-12" />
              </div>
              <CardContent className="p-10 relative z-10">
                 <div className="flex items-center gap-3 mb-8">
                    <Badge className="bg-sky-500/20 text-sky-400 border-none px-3 py-1 font-bold rounded-full text-[10px] uppercase tracking-wider">Active Access</Badge>
                    <span className="text-xs text-slate-400 font-bold">Phòng 1002 • Tầng 10</span>
                 </div>
                 
                 <div className="space-y-2 mb-8">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Mã khóa cửa số (Passcode)</p>
                    <div className="flex items-center gap-4">
                       <h2 className="text-6xl font-black tracking-tighter text-white">882931</h2>
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
           <h3 className="text-xl font-black text-slate-900 px-2">Yêu cầu nhanh</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roomServices.map((service) => (
                <Card 
                  key={service.id} 
                  className="border-2 border-transparent shadow-md rounded-[28px] bg-white transition-all hover:border-sky-200 cursor-pointer group"
                  onClick={() => toast.info(`Đã tiếp nhận yêu cầu: ${service.label}`)}
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

                 <Button className="w-full mt-6 rounded-2xl h-14 bg-sky-600 hover:bg-sky-500 font-black shadow-lg shadow-sky-600/20">Xác nhận gọi thêm</Button>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Emergency & Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white p-8">
           <h3 className="text-xl font-black text-slate-900 mb-6">Tiến độ yêu cầu</h3>
           <div className="space-y-6">
              <div className="flex gap-4 relative">
                 <div className="absolute left-6 top-10 bottom-0 w-[1px] bg-slate-100" />
                 <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                 </div>
                 <div className="flex-1 pt-1 pb-6">
                    <p className="text-sm font-black text-slate-900">Dọn phòng hoàn tất</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">Yêu cầu được thực hiện lúc 09:15 AM</p>
                 </div>
                 <span className="text-[10px] font-bold text-slate-300 mt-2 tracking-widest">10:45 AM</span>
              </div>
              <div className="flex gap-4">
                 <div className="h-12 w-12 bg-sky-50 rounded-2xl flex items-center justify-center shrink-0 border border-sky-100">
                    <Clock className="h-6 w-6 text-sky-600 animate-pulse" />
                 </div>
                 <div className="flex-1 pt-1">
                    <p className="text-sm font-black text-slate-900">Giặt là - Đang xử lý</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">Dự kiến hoàn trả trước 18:00 PM hôm nay</p>
                 </div>
                 <span className="text-[10px] font-bold text-slate-300 mt-2 tracking-widest">TRONG TIẾN ĐỘ</span>
              </div>
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
