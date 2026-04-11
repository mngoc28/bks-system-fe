import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  CalendarDays, 
  ArrowUpRight, 
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Download,
  AlertCircle,
  MapPin,
  FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ROUTERS } from "@/constant";
import { formatPrice } from "@/utils/utils";
import { toast } from "sonner";

import stayService, { BookingDetail } from "@/services/stayService";

const History = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res: any = await stayService.getBookings(currentPage);
        // Laravel pagination returns { status: 'success', data: { data: [...], last_page: X } }
        setBookings(res.data?.data || []);
        setLastPage(res.data?.last_page || 1);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
        toast.error("Không thể tải lịch sử đặt phòng.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [currentPage]);

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
      case 1:
        return { label: "Upcoming", color: "bg-sky-100 text-sky-700" };
      case 2:
        return { label: "Completed", color: "bg-emerald-100 text-emerald-700" };
      case 3:
      case 4: // Assuming 3 or 4 might be cancelled
        return { label: "Cancelled", color: "bg-rose-100 text-rose-700" };
      default:
        return { label: "Unknown", color: "bg-slate-100 text-slate-700" };
    }
  };

  const filteredBookings = bookings.filter(b => {
    const statusLabel = getStatusInfo(b.status).label;
    const matchesTab = activeTab === "all" || statusLabel.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = b.room.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toString().includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
      </div>
    );
  }

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
                        filteredBookings.map((booking) => {
                           const statusInfo = getStatusInfo(booking.status);
                           return (
                             <div key={booking.id} className="py-6 group flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all">
                                <div className="flex items-start gap-4 sm:gap-6">
                                   <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-[20px] sm:rounded-[24px] ${statusInfo.color} flex items-center justify-center shrink-0 shadow-inner`}>
                                      <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7" />
                                   </div>
                                   <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                         <h3 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-sky-600 transition-colors uppercase truncate">{booking.room.title}</h3>
                                         <Badge className={`rounded-full border-none px-2 py-0.5 font-black text-[9px] sm:text-[10px] uppercase ${statusInfo.color}`}>{statusInfo.label}</Badge>
                                      </div>
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-[12px] sm:text-sm text-slate-400 font-medium overflow-hidden">
                                         <span className="flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 text-sky-500 shrink-0" /> {booking.room.building.name}</span>
                                         <span className="hidden sm:inline text-slate-200">|</span>
                                         <span className="font-bold text-slate-600 whitespace-nowrap">{new Date(booking.start_date).toLocaleDateString("vi-VN")} - {new Date(booking.end_date).toLocaleDateString("vi-VN")}</span>
                                      </div>
                                   </div>
                                </div>
        
                                <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t border-slate-50 lg:border-none">
                                   <div className="text-left lg:text-right">
                                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Giá trị đơn</p>
                                      <p className="text-lg sm:text-xl font-black text-slate-900">{formatPrice(0)}</p>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      {statusInfo.label === "Completed" && (
                                         <Button variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => handleDownloadInvoice(booking.id.toString())}>
                                            <FileText className="h-5 w-5" />
                                         </Button>
                                      )}
                                      <Button asChild variant="ghost" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl hover:bg-sky-50 hover:text-sky-600 shrink-0">
                                         <Link to={ROUTERS.BKS_STAY_DETAILS.replace(":id", booking.id.toString())}>
                                            <ArrowUpRight className="h-5 w-5" />
                                          </Link>
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl hover:bg-slate-100 shrink-0">
                                         <MoreVertical className="h-5 w-5 text-slate-300" />
                                      </Button>
                                   </div>
                                </div>
                             </div>
                           );
                        })
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
      
      {lastPage > 1 && (
        <div className="flex justify-center mt-8 pb-12">
           <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="h-10 w-10 rounded-xl text-slate-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: lastPage }, (_, i) => i + 1).map(p => (
                 <Button 
                    key={p} 
                    variant={p === currentPage ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setCurrentPage(p)}
                    className={`h-10 w-10 rounded-xl font-bold ${p === currentPage ? "bg-slate-900 text-white" : "text-slate-400"}`}
                 >
                    {p}
                 </Button>
              ))}

              <Button 
                variant="ghost" 
                size="icon" 
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage(prev => Math.min(lastPage, prev + 1))}
                className="h-10 w-10 rounded-xl text-slate-400"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
           </div>
        </div>
      )}
    </div>
  );
};

export default History;
