import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  CalendarDays, 
  ArrowUpRight, 
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Download,
  AlertCircle,
  MapPin,
  FileText,
  SortAsc,
  SortDesc,
  Eye,
  Trash2,
  Share2,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { ROUTERS } from "@/constant";
import { formatPrice } from "@/utils/utils";
import { toastSuccess, toastError, toastInfo } from "@/components/ui/toast";

import stayService, { BookingDetail } from "@/services/stayService";

const History = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res: any = await stayService.getBookings(currentPage);
        setBookings(res.data?.data || []);
        setLastPage(res.data?.last_page || 1);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
        toastError("Không thể tải lịch sử đặt phòng.");
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
      case 4:
        return { label: "Cancelled", color: "bg-rose-100 text-rose-700" };
      default:
        return { label: "Unknown", color: "bg-slate-100 text-slate-700" };
    }
  };

  const processedBookings = useMemo(() => {
    const filtered = bookings.filter(b => {
      const statusLabel = getStatusInfo(b.status).label;
      const matchesTab = activeTab === "all" || statusLabel.toLowerCase() === activeTab.toLowerCase();
      const matchesSearch = 
        b.room?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.id.toString().includes(searchQuery) ||
        b.room?.property?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [bookings, activeTab, searchQuery, sortOrder]);

  const handleExport = () => {
    if (processedBookings.length === 0) {
      toastError("Không có dữ liệu để xuất.");
      return;
    }
    
    // Simulate CSV Export
    const headers = ["ID", "Room", "Location", "Start Date", "End Date", "Price", "Status", "Created At"];
    const rows = processedBookings.map(b => [
      b.id,
      b.room?.title,
      b.room?.property?.name,
      b.start_date,
      b.end_date,
      b.price?.price,
      getStatusInfo(b.status).label,
      b.created_at
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `BKS_Bookings_Report_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toastSuccess("Báo cáo đã được xuất thành công!");
  };

  const handleDownloadInvoice = (id: string) => {
    toastSuccess(`Đang tải hóa đơn cho đơn hàng ${id}...`);
  };

  const handleDeleteBooking = (id: number) => {
    toastError(`Bạn không thể xóa đơn đặt phòng ${id} đã được hệ thống ghi nhận.`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-y-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
           <h1 className="text-3xl font-black tracking-tight text-slate-900">Lịch sử đặt phòng</h1>
           <p className="mt-1 text-sm text-slate-500">Quản lý và xem lại tất cả kỳ nghỉ của bạn tại hệ thống BKS.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white" onClick={handleExport}>
             <Download className="mr-2 size-4" /> Xuất báo cáo
          </Button>
          <Button asChild className="h-12 rounded-2xl bg-sky-600 px-6 font-bold shadow-lg shadow-sky-600/20 hover:bg-sky-500">
             <Link to={ROUTERS.HOME}>Đặt phòng mới</Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
        <CardContent className="p-0">
          {/* Filters & Sorting */}
          <div className="border-b border-slate-100 p-8">
             <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div className="flex w-fit max-w-full overflow-x-auto rounded-2xl bg-slate-100 p-1">
                   {["all", "Upcoming", "Completed", "Cancelled"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                          whitespace-nowrap rounded-xl px-6 py-2 text-sm font-bold transition-all
                          ${activeTab === tab 
                            ? "bg-white text-slate-900 shadow-sm" 
                            : "text-slate-400 hover:text-slate-600"}
                        `}
                      >
                        {tab === "all" ? "Tất cả" : tab}
                      </button>
                   ))}
                </div>

                <div className="flex w-full items-center gap-3 lg:w-fit">
                   <div className="relative w-full lg:w-80">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input 
                        placeholder="Tìm kiếm mã đơn, tên phòng..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50 pl-10 shadow-none transition-all focus:bg-white" 
                      />
                   </div>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-12 rounded-2xl border-slate-100 px-4 font-bold text-slate-600">
                           {sortOrder === "newest" ? <SortDesc className="mr-2 size-4" /> : <SortAsc className="mr-2 size-4" />}
                           {sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-slate-100">
                        <DropdownMenuItem onClick={() => setSortOrder("newest")} className="rounded-lg font-bold">Mới nhất trước</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortOrder("oldest")} className="rounded-lg font-bold">Cũ nhất trước</DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
             </div>
          </div>

          {/* List Section */}
          <div className="divide-y divide-slate-50 p-8">
             {processedBookings.length > 0 ? (
                processedBookings.map((booking) => {
                   const statusInfo = getStatusInfo(booking.status);
                   return (
                     <div key={booking.id} className="group flex flex-col justify-between gap-6 py-6 transition-all lg:flex-row lg:items-center">
                        <div className="flex items-start gap-4 sm:gap-6">
                           <div className={`size-14 rounded-[20px] sm:size-16 sm:rounded-[24px] ${statusInfo.color} flex shrink-0 items-center justify-center shadow-inner`}>
                              <CalendarDays className="size-6 sm:size-7" />
                           </div>
                           <div className="min-w-0 flex-1">
                              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                 <h3 className="truncate text-base font-black uppercase text-slate-900 transition-colors group-hover:text-sky-600 sm:text-lg">{booking.room?.title || "Phòng không tên"}</h3>
                                 <Badge className={`rounded-full border-none px-2 py-0.5 text-[9px] font-black uppercase sm:text-[10px] ${statusInfo.color}`}>{statusInfo.label}</Badge>
                              </div>
                              <div className="flex flex-col gap-y-1.5 text-[12px] font-medium text-slate-400 sm:text-sm">
                                 <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <span className="flex items-center gap-1.5 truncate"><MapPin className="size-3.5 shrink-0 text-sky-500" /> {booking.room?.property?.name || "Nơi ở bí ẩn"}</span>
                                    <span className="hidden text-slate-200 sm:inline">|</span>
                                    <span className="whitespace-nowrap font-bold text-slate-600">{new Date(booking.start_date).toLocaleDateString("vi-VN")} - {new Date(booking.end_date).toLocaleDateString("vi-VN")}</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                    <Clock className="size-3" />
                                    <span>Thời điểm đặt: <span className="font-bold">{new Date(booking.created_at).toLocaleString("vi-VN")}</span></span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center justify-between gap-6 border-t border-slate-50 pt-4 lg:justify-end lg:border-none lg:pt-0">
                           <div className="text-left lg:text-right">
                              <p className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Giá trị đơn</p>
                              <p className="text-lg font-black text-slate-900 sm:text-xl">{formatPrice(booking.price?.price || 0)}</p>
                           </div>
                           <div className="flex items-center gap-2">
                              {statusInfo.label === "Completed" && (
                                 <Button variant="outline" size="icon" title="Tải hóa đơn" className="size-10 rounded-xl border-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 sm:size-12 sm:rounded-2xl" onClick={() => handleDownloadInvoice(booking.id.toString())}>
                                    <FileText className="size-5" />
                                 </Button>
                              )}
                              <Button asChild variant="ghost" title="Xem chi tiết" className="size-10 shrink-0 rounded-xl hover:bg-sky-50 hover:text-sky-600 sm:size-12 sm:rounded-2xl">
                                 <Link to={ROUTERS.BKS_STAY_DETAILS.replace(":id", booking.id.toString())}>
                                    <ArrowUpRight className="size-5" />
                                  </Link>
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="size-10 shrink-0 rounded-xl hover:bg-slate-100 sm:size-12 sm:rounded-2xl">
                                     <MoreVertical className="size-5 text-slate-300" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100">
                                   <DropdownMenuLabel className="text-xs font-bold text-slate-400">Tùy chọn đơn hàng</DropdownMenuLabel>
                                   <DropdownMenuSeparator />
                                   <DropdownMenuItem asChild className="rounded-lg">
                                      <Link to={ROUTERS.BKS_STAY_DETAILS.replace(":id", booking.id.toString())} className="flex w-full items-center gap-2 font-bold">
                                         <Eye className="size-4 text-sky-500" /> Xem chi tiết
                                      </Link>
                                   </DropdownMenuItem>
                                   <DropdownMenuItem className="rounded-lg font-bold" onClick={() => toastInfo("Tính năng hỗ trợ đang được kết nối...")}>
                                      <Share2 className="size-4 text-indigo-500" /> Chia sẻ hóa đơn
                                   </DropdownMenuItem>
                                   <DropdownMenuSeparator />
                                   <DropdownMenuItem className="rounded-lg font-bold text-rose-500 focus:bg-rose-50 focus:text-rose-600" onClick={() => handleDeleteBooking(booking.id)}>
                                      <Trash2 className="size-4" /> Xóa bản ghi
                                   </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                           </div>
                        </div>
                     </div>
                   );
                })
             ) : (
                <div className="py-20 text-center">
                   <AlertCircle className="mx-auto mb-4 size-12 text-slate-200" />
                   <p className="font-bold text-slate-400">Không tìm thấy đơn đặt phòng nào phù hợp.</p>
                   <Button variant="ghost" className="mt-2 text-sky-600 hover:bg-sky-50" onClick={() => { setActiveTab("all"); setSearchQuery(""); }}>Làm mới bộ lọc</Button>
                </div>
             )}
          </div>
        </CardContent>
      </Card>
      
      {lastPage > 1 && (
        <div className="mt-8 flex justify-center pb-12">
           <div className="flex gap-2 rounded-2xl border border-slate-100 bg-white p-1 shadow-sm">
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="size-10 rounded-xl text-slate-400"
              >
                <ChevronLeft className="size-4" />
              </Button>

              {Array.from({ length: lastPage }, (_, i) => i + 1).map(p => (
                 <Button 
                    key={p} 
                    variant={p === currentPage ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setCurrentPage(p)}
                    className={`size-10 rounded-xl font-bold ${p === currentPage ? "bg-slate-900 text-white" : "text-slate-400"}`}
                 >
                    {p}
                 </Button>
              ))}

              <Button 
                variant="ghost" 
                size="icon" 
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage(prev => Math.min(lastPage, prev + 1))}
                className="size-10 rounded-xl text-slate-400"
              >
                <ChevronRight className="size-4" />
              </Button>
           </div>
        </div>
      )}
    </div>
  );
};

export default History;

