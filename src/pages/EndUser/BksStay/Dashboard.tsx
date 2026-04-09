import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  CalendarDays, 
  ChevronRight, 
  MapPin, 
  Star, 
  TrendingUp, 
  Wallet,
  Zap,
  Wifi,
  Wrench,
  Calendar,
  Clock,
  FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { ROUTERS } from "@/constant";
import { formatPrice } from "@/utils/utils";
import { toast } from "sonner";

const Dashboard = () => {
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [newEndDate, setNewEndDate] = useState("25/04/2026");

  // Mock data for the dashboard
  const activeBooking = {
    id: "BKS-99283",
    roomTitle: "Phòng Luxury Ocean View",
    startDate: "20/04/2026",
    endDate: "23/04/2026",
    status: "Upcoming",
    image: "https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&q=80&w=800"
  };

  const stats = [
    { label: "Tổng số kỳ nghỉ", value: "12", icon: <CalendarDays className="h-5 w-5 text-sky-600" />, color: "bg-sky-50" },
    { label: "Điểm thưởng", value: "2,450", icon: <Star className="h-5 w-5 text-amber-600" />, color: "bg-amber-50" },
    { label: "Chi tiêu tích lũy", value: "15.4M", icon: <Wallet className="h-5 w-5 text-emerald-600" />, color: "bg-emerald-50" },
    { label: "Cấp bậc vinh dự", value: "Gold Member", icon: <TrendingUp className="h-5 w-5 text-indigo-600" />, color: "bg-indigo-50" },
  ];

  const recentHistory = [
    { id: "BKS-99120", hotel: "BKS Đà Nẵng River", date: "12/03/2026", amount: 2400000, status: "Completed" },
    { id: "BKS-98045", hotel: "BKS Hà Nội Boutique", date: "05/01/2026", amount: 1850000, status: "Completed" },
  ];

  const handleExtendSubmit = () => {
    toast.success(`Yêu cầu gia hạn đến ngày ${newEndDate} đã được gửi! Chúng tôi sẽ phản hồi trong 15 phút.`);
    setIsExtendDialogOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Pending Contract Alert */}
      <div className="bg-amber-50 border border-amber-100 rounded-[28px] p-6 flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-4 duration-500">
         <div className="h-14 w-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-600 shrink-0">
            <FileText className="h-7 w-7" />
         </div>
         <div className="flex-1 text-center md:text-left">
            <h4 className="text-lg font-black text-amber-900">Hợp đồng chờ ký kết</h4>
            <p className="text-sm text-amber-700/70 font-medium">Bạn có 1 hợp đồng thuê phòng chưa được ký. Vui lòng hoàn tất để nhận mã cửa phòng.</p>
         </div>
         <Button asChild className="rounded-xl h-12 px-6 bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/10">
            <Link to={ROUTERS.BKS_STAY_CONTRACTS}>Ký ngay bây giờ</Link>
         </Button>
      </div>

      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 hidden lg:block">
           <Zap className="h-full w-full transform translate-x-12 -translate-y-12 rotate-12" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Chào mừng trở lại, Anh A! 👋</h1>
          <p className="text-slate-400 max-w-lg mb-8">
            Hệ thống BKS Stay luôn sẵn sàng hỗ trợ bạn quản lý mọi kỳ nghỉ tại Việt Nam. 
            Bạn đang có <span className="text-sky-400 font-bold">1 đơn đặt phòng sắp tới</span> cần chú ý.
          </p>
          <div className="flex gap-4">
             <Button className="rounded-2xl h-12 px-8 bg-sky-600 hover:bg-sky-500 font-bold transition-all shadow-lg shadow-sky-600/30">Đặt thêm phòng mới</Button>
             <Button variant="outline" className="rounded-2xl h-12 px-8 bg-white/5 border-white/10 hover:bg-white/10 border-none">Xem khuyến mãi</Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-lg font-black text-slate-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 px-2">Phím tắt thông minh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: "Đặt dịch vụ", icon: <Zap className="h-6 w-6" />, color: "bg-sky-600 shadow-sky-600/20", path: ROUTERS.BKS_STAY_SERVICES, type: "link" },
             { label: "Xem Wifi", icon: <Wifi className="h-6 w-6" />, color: "bg-indigo-600 shadow-indigo-600/20", path: ROUTERS.BKS_STAY_SERVICES, type: "link" },
             { label: "Gia hạn ở", icon: <CalendarDays className="h-6 w-6" />, color: "bg-amber-600 shadow-amber-600/20", onClick: () => setIsExtendDialogOpen(true), type: "button" },
             { label: "Báo cáo sự cố", icon: <Wrench className="h-6 w-6" />, color: "bg-rose-600 shadow-rose-600/20", path: ROUTERS.BKS_STAY_SERVICES, type: "link" },
           ].map((action, i) => (
             action.type === "link" ? (
               <Link key={i} to={action.path || "#"} className={`group relative p-6 rounded-[32px] ${action.color} text-white shadow-xl transition-all hover:scale-105 active:scale-95 overflow-hidden`}>
                  <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-125 transition-transform">{action.icon}</div>
                  <div className="relative z-10">
                    <div className="mb-4">{action.icon}</div>
                    <p className="font-black text-sm tracking-tight">{action.label}</p>
                  </div>
               </Link>
             ) : (
               <button key={i} onClick={action.onClick} className={`text-left group relative p-6 rounded-[32px] ${action.color} text-white shadow-xl transition-all hover:scale-105 active:scale-95 overflow-hidden w-full`}>
                  <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-125 transition-transform">{action.icon}</div>
                  <div className="relative z-10">
                    <div className="mb-4">{action.icon}</div>
                    <p className="font-black text-sm tracking-tight">{action.label}</p>
                  </div>
               </button>
             )
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Booking Highlight */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-900">Kỳ nghỉ sắp tới</h3>
            <Link to={ROUTERS.BKS_STAY_HISTORY} className="text-sm font-bold text-sky-600 hover:underline">Xem tất cả</Link>
          </div>
          
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="grid sm:grid-cols-5">
                <div className="sm:col-span-2 h-48 sm:h-auto overflow-hidden">
                  <img src={activeBooking.image} alt="Room" className="w-full h-full object-cover" />
                </div>
                <div className="sm:col-span-3 p-8 flex flex-col justify-between">
                  <div>
                    <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 border-none mb-3 px-3 py-1 font-bold rounded-full">Sắp diễn ra</Badge>
                    <h4 className="text-2xl font-black text-slate-900 mb-2">{activeBooking.roomTitle}</h4>
                    <div className="flex items-center gap-4 text-slate-500 text-sm mb-6">
                       <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {activeBooking.startDate}</span>
                       <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Đà Nẵng</span>
                    </div>
                  </div>
                  <Button asChild className="w-fit rounded-2xl h-12 px-8 bg-slate-900 hover:bg-slate-800 transition-all font-bold group shadow-lg shadow-slate-900/10">
                    <Link to={ROUTERS.BKS_STAY_DETAILS.replace(":id", activeBooking.id)}>
                      Quản lý kỳ nghỉ này <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent History Sidebar */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 px-2">Lịch sử gần đây</h3>
          <div className="space-y-4">
            {recentHistory.map((item) => (
              <Card key={item.id} className="border-none shadow-md rounded-[28px] bg-white border border-slate-50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-black text-slate-900">{item.hotel}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{item.date}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 border-emerald-100 px-2">Xong</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-black text-slate-900">{formatPrice(item.amount)}</p>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-sky-600 transition-colors">Chi tiết</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" asChild className="w-full h-14 rounded-2xl border-slate-200 text-slate-400 hover:text-sky-600 hover:bg-sky-50 border-dashed border-2 bg-transparent transition-all font-bold">
               <Link to={ROUTERS.BKS_STAY_HISTORY}>Xem toàn bộ lịch sử</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Extend Stay Dialog */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
         <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
            <div className="h-24 bg-amber-600 flex items-center justify-center text-white">
               <Calendar className="h-10 w-10 animate-pulse" />
            </div>
            <div className="p-8">
               <DialogHeader className="text-left mb-6">
                  <DialogTitle className="text-2xl font-black text-slate-900">Gia hạn kỳ nghỉ</DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">
                     Bạn muốn ở lại thêm? Hãy chọn ngày checkout mới mong muốn.
                  </DialogDescription>
               </DialogHeader>

               <div className="space-y-6 mb-8">
                  <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Ngày checkout cũ</span>
                     <span className="font-bold text-slate-600">{activeBooking.endDate}</span>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ngày checkout mới</label>
                     <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-600" />
                        <input 
                           type="text" 
                           value={newEndDate} 
                           onChange={(e) => setNewEndDate(e.target.value)}
                           className="w-full h-14 pl-12 pr-4 rounded-2xl bg-amber-50 border-amber-100 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                        />
                     </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 border border-amber-100">
                     <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                     <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                        Yêu cầu gia hạn cần được sự chấp thuận của lễ tân tùy thuộc vào tình trạng phòng trống. Chúng tôi sẽ phản hồi sớm nhất.
                     </p>
                  </div>
               </div>

               <DialogFooter className="sm:justify-start gap-3">
                  <Button onClick={handleExtendSubmit} className="flex-1 h-12 rounded-2xl bg-amber-600 hover:bg-amber-500 font-bold shadow-lg shadow-amber-600/20">Gửi yêu cầu gia hạn</Button>
                  <Button variant="ghost" onClick={() => setIsExtendDialogOpen(false)} className="h-12 rounded-2xl text-slate-400 font-bold">Hủy</Button>
               </DialogFooter>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
