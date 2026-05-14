import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  CalendarDays, 
  ChevronRight, 
  MapPin, 
  Star, 
  TrendingUp, 
  Wallet,
  Zap,
  Wrench,
  Calendar,
  Clock,
  FileText,
  BookOpen
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
import { toastSuccess, toastError } from "@/components/ui/toast";

import stayService, { StayDashboardData } from "@/services/stayService";

const Dashboard = () => {
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [newEndDate, setNewEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StayDashboardData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await stayService.getDashboard();
        setData(response.data);
        if (response.data?.active_booking) {
          setNewEndDate(response.data.active_booking.end_date);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleExtendSubmit = async () => {
    if (!data?.active_booking) return;
    if (!newEndDate) {
      toastError("Vui lòng nhập ngày muốn trả phòng mới.");
      return;
    }
    
    try {
      setLoading(true);
      await stayService.extendBooking(data.active_booking.id, newEndDate);
      toastSuccess(`Yêu cầu gia hạn đến ngày ${newEndDate} đã được gửi! Chúng tôi sẽ phản hồi sớm.`);
      setIsExtendDialogOpen(false);
    } catch (error: any) {
      toastError(error.response?.data?.message || "Không thể gửi yêu cầu gia hạn.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-y-2 border-sky-600"></div>
      </div>
    );
  }

  // Mega Safe Check
  if (!data || !data.user || !data.stats) {
    return (
      <div className="rounded-[32px] border border-rose-100 bg-rose-50 p-8 text-center">
        <h3 className="mb-2 text-xl font-black text-rose-900">Thông tin không khả dụng</h3>
        <p className="mb-4 font-medium text-rose-700/70">Chúng tôi không thể tải được thông tin tài khoản của bạn lúc này.</p>
        <Button onClick={() => window.location.reload()} className="rounded-xl bg-rose-600 hover:bg-rose-500">Thử tải lại trang</Button>
      </div>
    );
  }

  const user = data.user;
  const statsData = data.stats;
  const activeBooking = data.active_booking;
  
  const stats = [
    { label: "Tổng số kỳ nghỉ", value: statsData.total_stays?.toString() || "0", icon: <CalendarDays className="size-5 text-sky-600" />, color: "bg-sky-50" },
    { label: "Điểm thưởng", value: user.reward_points?.toLocaleString() || "0", icon: <Star className="size-5 text-amber-600" />, color: "bg-amber-50" },
    { label: "Chi tiêu tích lũy", value: formatPrice(statsData.accumulated_spending || 0), icon: <Wallet className="size-5 text-emerald-600" />, color: "bg-emerald-50" },
    { label: "Cấp bậc vinh dự", value: user.membership_level || "Bronze", icon: <TrendingUp className="size-5 text-indigo-600" />, color: "bg-indigo-50" },
  ];

  const recentHistory = data.recent_history || [];

  return (
    <div className="space-y-8 pb-20 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Pending Contract Alert */}
      {data.has_pending_contract && (
        <div className="flex flex-col items-center gap-6 rounded-[28px] border border-amber-100 bg-amber-50 p-6 duration-500 animate-in slide-in-from-top-4 md:flex-row">
           <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
              <FileText className="size-7" />
           </div>
           <div className="flex-1 text-center md:text-left">
              <h4 className="text-lg font-black text-amber-900">Hợp đồng chờ ký kết</h4>
              <p className="text-sm font-medium text-amber-700/70">Bạn có hợp đồng thuê phòng chưa được ký. Vui lòng hoàn tất để nhận mã cửa phòng.</p>
           </div>
           <Button asChild className="h-12 rounded-xl bg-amber-600 px-6 font-bold text-white shadow-lg shadow-amber-600/10 hover:bg-amber-500">
              <Link to={ROUTERS.BKS_STAY_CONTRACTS}>Ký ngay bây giờ</Link>
           </Button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20 md:p-12">
        <div className="absolute right-0 top-0 hidden h-full w-1/3 opacity-20 lg:block">
           <Zap className="size-full -translate-y-12 translate-x-12 rotate-12" />
        </div>
        <div className="relative z-10">
          <h1 className="mb-4 text-3xl font-black tracking-tight md:text-4xl">Chào mừng trở lại, {user.name || "Bạn"}! 👋</h1>
          <p className="mb-8 max-w-lg text-slate-400">
            Hệ thống BKS Stay luôn sẵn sàng hỗ trợ bạn quản lý mọi kỳ nghỉ tại Việt Nam. 
            Bạn đang có <span className="font-bold text-sky-400">{activeBooking ? "1 đơn đặt phòng" : "0 đơn đặt phòng"} sắp tới</span> cần chú ý.
          </p>
          <div className="flex gap-4">
             <Button className="h-12 rounded-2xl bg-white px-8 font-bold text-slate-900 shadow-lg shadow-white/10 transition-all hover:bg-slate-100">Đặt thêm phòng mới</Button>
             <Button variant="outline" className="h-12 rounded-2xl border-none border-white/10 bg-white/5 px-8 text-white hover:bg-white/10">Xem khuyến mãi</Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-3xl border-none bg-white shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className={`size-12 rounded-2xl ${stat.color} mb-4 flex items-center justify-center`}>
                {stat.icon}
              </div>
              <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className="text-lg font-black text-slate-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-6">
        <h3 className="px-2 text-xl font-black text-slate-900">Phím tắt thông minh</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
           {[
             { label: "Đặt dịch vụ", icon: <Zap className="size-6" />, color: "bg-slate-900 shadow-slate-900/10", path: ROUTERS.BKS_STAY_SERVICES, type: "link" },
             { label: "Hướng dẫn lưu trú", icon: <BookOpen className="size-6" />, color: "bg-slate-800 shadow-slate-900/10", path: ROUTERS.BKS_STAY_GUIDE, type: "link" },
             { label: "Gia hạn ở", icon: <CalendarDays className="size-6" />, color: "bg-slate-700 shadow-slate-900/10", onClick: () => setIsExtendDialogOpen(true), type: "button" },
             { label: "Báo cáo sự cố", icon: <Wrench className="size-6" />, color: "bg-slate-600 shadow-slate-900/10", path: ROUTERS.BKS_STAY_SERVICES, type: "link" },
           ].map((action, i) => (
             action.type === "link" ? (
               <Link key={i} to={action.path || "#"} className={`group relative rounded-[32px] p-6 ${action.color} overflow-hidden text-white shadow-xl transition-all hover:scale-105 active:scale-95`}>
                  <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform group-hover:scale-125">{action.icon}</div>
                  <div className="relative z-10">
                    <div className="mb-4">{action.icon}</div>
                    <p className="text-sm font-black tracking-tight">{action.label}</p>
                  </div>
               </Link>
             ) : (
               <button key={i} onClick={action.onClick} className={`group relative rounded-[32px] p-6 text-left ${action.color} w-full overflow-hidden text-white shadow-xl transition-all hover:scale-105 active:scale-95`}>
                  <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform group-hover:scale-125">{action.icon}</div>
                  <div className="relative z-10">
                    <div className="mb-4">{action.icon}</div>
                    <p className="text-sm font-black tracking-tight">{action.label}</p>
                  </div>
               </button>
             )
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Active Booking Highlight */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-900">Kỳ nghỉ sắp tới</h3>
            <Link to={ROUTERS.BKS_STAY_HISTORY} className="text-sm font-bold text-sky-600 hover:underline">Xem tất cả</Link>
          </div>
          
          {activeBooking ? (
            <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
              <CardContent className="p-0">
                <div className="grid sm:grid-cols-5">
                  <div className="h-48 overflow-hidden sm:col-span-2 sm:h-auto">
                    <img src={activeBooking.room?.room_images?.[0]?.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"} alt="Room" className="size-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-between p-8 sm:col-span-3">
                    <div>
                      <Badge className="mb-3 rounded-full border-none bg-sky-100 px-3 py-1 font-bold text-sky-700 hover:bg-sky-100">
                        {activeBooking.status === 2 ? "ĐANG Ở" : "ĐÃ XÁC NHẬN"}
                      </Badge>
                      <h4 className="mb-2 text-2xl font-black text-slate-900">{activeBooking.room?.title || "Phòng nghỉ"}</h4>
                      <div className="mb-6 flex items-center gap-4 text-sm text-slate-500">
                         <span className="flex items-center gap-1.5"><CalendarDays className="size-4" /> {new Date(activeBooking.start_date).toLocaleDateString("vi-VN")}</span>
                         <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {activeBooking.room?.property?.name || "BKS Stay"}</span>
                      </div>
                    </div>
                    <Button asChild className="group h-12 w-fit rounded-2xl bg-slate-900 px-8 font-bold shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800">
                      <Link to={ROUTERS.BKS_STAY_DETAILS.replace(":id", activeBooking.id.toString())}>
                        Quản lý kỳ nghỉ này <ChevronRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-100 text-slate-400">
               <CalendarDays className="mb-4 size-10 opacity-20" />
               <p className="font-bold">Bạn chưa có đơn đặt phòng nào sắp tới</p>
                <Button variant="ghost" asChild className="text-sky-600">
                  <Link to="/">Khám phá ngay</Link>
                </Button>
            </div>
          )}
        </div>

        {/* Recent History Sidebar */}
        <div className="space-y-6">
          <h3 className="px-2 text-xl font-black text-slate-900">Lịch sử gần đây</h3>
          <div className="space-y-4">
            {recentHistory.map((item) => (
              <Card key={item.id} className="rounded-[28px] border border-none border-slate-50 bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-900">{item.hotel}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{item.date}</p>
                    </div>
                    <Badge variant="outline" className="border-emerald-100 bg-emerald-50 px-2 text-[10px] font-black uppercase text-emerald-600">Xong</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-slate-900">{formatPrice(item.amount)}</p>
                    <Button asChild variant="ghost" size="sm" className="text-slate-400 transition-colors hover:text-sky-600">
                      <Link to={ROUTERS.BKS_STAY_DETAILS.replace(":id", item.id.toString())}>Chi tiết</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" asChild className="h-14 w-full rounded-2xl border-2 border-dashed border-slate-200 bg-transparent font-bold text-slate-400 transition-all hover:bg-sky-50 hover:text-sky-600">
               <Link to={ROUTERS.BKS_STAY_HISTORY}>Xem toàn bộ lịch sử</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Extend Stay Dialog */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
         <DialogContent className="overflow-hidden rounded-[32px] border-none p-0 shadow-2xl sm:max-w-md">
            <div className="flex h-24 items-center justify-center bg-amber-600 text-white">
               <Calendar className="size-10 animate-pulse" />
            </div>
            <div className="p-8">
               <DialogHeader className="mb-6 text-left">
                  <DialogTitle className="text-2xl font-black text-slate-900">Gia hạn kỳ nghỉ</DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">
                     Bạn muốn ở lại thêm? Hãy chọn ngày checkout mới mong muốn.
                  </DialogDescription>
               </DialogHeader>

               <div className="mb-8 space-y-6">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                     <span className="text-xs font-black uppercase tracking-widest text-slate-400">Ngày checkout cũ</span>
                     <span className="font-bold text-slate-600">{activeBooking ? new Date(activeBooking.end_date).toLocaleDateString("vi-VN") : "---"}</span>
                  </div>
                  
                  <div className="space-y-2">
                     <label htmlFor="new-checkout-date" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Ngày checkout mới</label>
                     <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-amber-600" />
                        <input 
                           id="new-checkout-date"
                           type="text" 
                           value={newEndDate} 
                           onChange={(e) => setNewEndDate(e.target.value)}
                           className="h-14 w-full rounded-2xl border-amber-100 bg-amber-50 pl-12 pr-4 font-bold text-amber-900 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                     </div>
                  </div>

                  <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                     <Clock className="mt-0.5 size-5 shrink-0 text-amber-600" />
                     <p className="text-[11px] font-medium leading-relaxed text-amber-700">
                        Yêu cầu gia hạn cần được sự chấp thuận của lễ tân tùy thuộc vào tình trạng phòng trống. Chúng tôi sẽ phản hồi sớm nhất.
                     </p>
                  </div>
               </div>

               <DialogFooter className="gap-3 sm:justify-start">
                  <Button onClick={handleExtendSubmit} className="h-12 flex-1 rounded-2xl bg-amber-600 font-bold shadow-lg shadow-amber-600/20 hover:bg-amber-500">Gửi yêu cầu gia hạn</Button>
                  <Button variant="ghost" onClick={() => setIsExtendDialogOpen(false)} className="h-12 rounded-2xl font-bold text-slate-400">Hủy</Button>
               </DialogFooter>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;

