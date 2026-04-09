import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  CalendarDays, 
  ArrowUpRight, 
  MoreVertical,
  ChevronRight,
  Download,
  AlertCircle,
  MapPin,
  ShieldCheck,
  RotateCcw,
  FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ROUTERS } from "@/constant";
import { formatPrice } from "@/utils/utils";
import { toast } from "sonner";

const History = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const bookings = [
    { id: "BKS-99283", name: "Luxury Ocean View", location: "Đà Nẵng", date: "20/04/2026 - 23/04/2026", price: 4500000, status: "Upcoming", color: "bg-sky-100 text-sky-700" },
    { id: "BKS-99120", name: "Premium Suite", location: "Hồ Chí Minh", date: "12/03/2026 - 15/03/2026", price: 2400000, status: "Completed", color: "bg-emerald-100 text-emerald-700" },
    { id: "BKS-98045", name: "Standard Room", location: "Hà Nội", date: "05/01/2026 - 06/01/2026", price: 1850000, status: "Completed", color: "bg-emerald-100 text-emerald-700" },
    { id: "BKS-97210", name: "Deluxe Balcony", location: "Sapa", date: "15/12/2025 - 18/12/2025", price: 3200000, status: "Cancelled", color: "bg-rose-100 text-rose-700" },
  ];

  const filteredBookings = bookings.filter(b => {
    const matchesTab = activeTab === "all" || b.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleDownloadInvoice = (id: string) => {
    toast.success(`Đang tải hóa đơn cho đơn hàng ${id}...`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header & Stats Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lịch sử đặt phòng</h1>
           <p className="text-slate-500 text-sm mt-1">Quản lý và xem lại tất cả kỳ nghỉ của bạn tại hệ thống BKS.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-12 bg-white border-slate-200" onClick={() => toast.info("Tính năng đang được phát triển")}>
             <Download className="mr-2 h-4 w-4" /> Xuất báo cáo
          </Button>
          <Button className="rounded-2xl h-12 bg-sky-600 hover:bg-sky-500 font-bold px-6 shadow-lg shadow-sky-600/20">
             <Link to={ROUTERS.HOME}>Đặt phòng mới</Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white overflow-hidden">
        <CardContent className="p-0">
          {/* Internal Filters */}
          <div className="p-8 border-b border-slate-100">
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto max-w-full">
                   {["all", "Upcoming", "Completed", "Cancelled"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                          px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                          ${activeTab === tab 
                            ? "bg-white text-slate-900 shadow-sm" 
                            : "text-slate-400 hover:text-slate-600"}
                        `}
                      >
                        {tab === "all" ? "Tất cả" : tab}
                      </button>
                   ))}
                </div>

                <div className="flex items-center gap-3 w-full lg:w-96">
                   <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Tìm kiếm theo mã đơn hoặc phòng..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all shadow-none" 
                      />
                   </div>
                   <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl shrink-0">
                      <Filter className="h-4 w-4" />
                   </Button>
                </div>
             </div>
          </div>

          {/* List Section */}
          <div className="p-8 divide-y divide-slate-50">
             {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                   <div key={booking.id} className="py-6 group flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                      <div className="flex items-start gap-5">
                         <div className={`h-16 w-16 rounded-[24px] ${booking.color} flex items-center justify-center shrink-0 shadow-inner`}>
                            <CalendarDays className="h-7 w-7" />
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <h3 className="font-black text-lg text-slate-900 group-hover:text-sky-600 transition-colors uppercase">{booking.name}</h3>
                               <Badge className={`rounded-full border-none px-2 font-bold text-[10px] uppercase ${booking.color}`}>{booking.status}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 font-medium">
                               <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-sky-500" /> {booking.location}</span>
                               <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-sky-500" /> ID: {booking.id}</span>
                               <span className="hidden sm:inline text-slate-200">|</span>
                               <span className="font-bold text-slate-600">{booking.date}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 pl-0 md:pl-0">
                         <div className="text-right hidden sm:block">
                            <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-0.5">Giá trị đơn</p>
                            <p className="text-xl font-black text-slate-900">{formatPrice(booking.price)}</p>
                         </div>
                         <div className="flex items-center gap-2 w-full sm:w-auto">
                            {booking.status === "Completed" && (
                               <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => handleDownloadInvoice(booking.id)}>
                                  <FileText className="h-5 w-5" />
                               </Button>
                            )}
                            {booking.status === "Cancelled" && (
                               <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-100 text-slate-400 hover:text-sky-600 hover:bg-sky-50" onClick={() => toast.info("Đang kiểm tra phòng trống...")}>
                                  <RotateCcw className="h-5 w-5" />
                               </Button>
                            )}
                            <Button asChild variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-sky-50 hover:text-sky-600">
                               <Link to={ROUTERS.BKS_STAY_DETAILS.replace(":id", booking.id)}>
                                  <ArrowUpRight className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-slate-100">
                               <MoreVertical className="h-5 w-5 text-slate-300" />
                            </Button>
                         </div>
                      </div>
                   </div>
                ))
             ) : (
                <div className="py-20 text-center">
                   <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold">Không tìm thấy đơn đặt phòng nào phù hợp.</p>
                   <Button variant="ghost" className="text-sky-600 mt-2 hover:bg-sky-50" onClick={() => { setActiveTab("all"); setSearchQuery(""); }}>Làm mới bộ lọc</Button>
                </div>
             )}
          </div>
        </CardContent>
      </Card>
      
      {/* Pagination Placeholder */}
      <div className="flex justify-center mt-8">
         <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
            {[1, 2, 3].map(p => (
               <Button key={p} variant={p === 1 ? "default" : "ghost"} size="sm" className={`h-10 w-10 rounded-xl font-bold ${p === 1 ? "bg-slate-900 text-white" : "text-slate-400"}`}>
                  {p}
               </Button>
            ))}
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400"><ChevronRight className="h-4 w-4" /></Button>
         </div>
      </div>
    </div>
  );
};

export default History;
