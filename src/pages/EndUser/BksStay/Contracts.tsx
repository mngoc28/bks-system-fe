import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Calendar,
  Building2,
  ShieldCheck,
  CheckCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ROUTERS } from "@/constant";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import stayService, { Contract } from "@/services/stayService";

const Contracts = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  
  // Dialog state
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const res: any = await stayService.getContracts(currentPage);
        setContracts(res.data?.data || []);
        setLastPage(res.data?.last_page || 1);
      } catch (error) {
        console.error("Failed to fetch contracts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [currentPage]);

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { label: "Chờ ký", color: "bg-amber-100 text-amber-700" };
      case 1:
        return { label: "Hiệu lực", color: "bg-emerald-100 text-emerald-700" };
      case 2:
        return { label: "Đã xong", color: "bg-slate-100 text-slate-700" };
      default:
        return { label: "Không rõ", color: "bg-slate-100 text-slate-700" };
    }
  };

  const filteredContracts = contracts.filter((c) => {
    const statusLabel = getStatusInfo(c.status).label;
    const matchesTab = activeTab === "all" || statusLabel === activeTab;
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.booking.room.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toString().includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const handleDownloadContract = (contract: Contract) => {
    const content = `HỢP ĐỒNG LƯU TRÚ BKS STAY
--------------------------------------------------
Mã hợp đồng: ${contract.id}
Tên hợp đồng: ${contract.title}
Ngày khởi tạo: ${new Date(contract.created_at).toLocaleDateString("vi-VN")}
Căn hộ: ${contract.booking.room.property.name}
Phòng: ${contract.booking.room.title}
Khách thuê: ${contract.booking.user.name}
Thời hạn lưu trú: ${new Date(contract.booking.start_date).toLocaleDateString("vi-VN")} - ${new Date(contract.booking.end_date).toLocaleDateString("vi-VN")}
Trạng thái: ${contract.status === 1 ? "Đã ký kết (Có hiệu lực)" : "Chờ ký kết"}

NỘI DUNG THỎA THUẬN:
${contract.content || "Nội dung hợp đồng đang được cập nhật..."}

--------------------------------------------------
XÁC NHẬN BỞI BÊN A (BKS STAY) & BÊN B (KHÁCH HÀNG)
Hợp đồng điện tử được xác thực tự động trên hệ thống BKS Stay.
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Hop_Dong_BKS_Stay_${contract.id}.txt`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
     return (
       <div className="flex min-h-[400px] items-center justify-center">
         <Spinner size="lg" />
       </div>
     );
  }

  return (
    <div className="space-y-8 pb-10 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
           <h1 className="text-3xl font-black tracking-tight text-slate-900">Hợp đồng lưu trú</h1>
           <p className="mt-1 text-sm text-slate-500">Xem, ký kết và tải xuống các thỏa thuận pháp lý cho mọi kỳ nghỉ.</p>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
        <CardContent className="p-0">
          {/* Filters */}
          <div className="border-b border-slate-100 p-8">
             <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div className="flex w-fit max-w-full overflow-x-auto rounded-2xl bg-slate-100 p-1">
                   {["all", "Chờ ký", "Hiệu lực", "Đã xong"].map((tab) => (
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

                <div className="flex w-full items-center gap-3 lg:w-80">
                   <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input 
                        placeholder="Tìm kiếm theo tên căn hộ, ID..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50 pl-10 shadow-none transition-all focus:bg-white" 
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* List Section */}
          <div className="divide-y divide-slate-50 p-8">
             {filteredContracts.length > 0 ? (
                      filteredContracts.map((contract) => {
                         const isLongTerm = contract.contract_type === 'LEASE_AGREEMENT';
                         const statusInfo = getStatusInfo(contract.status);
                         
                         const showSignButton =
                           isLongTerm &&
                           contract.status === 0 &&
                           contract.booking.status === 1;

                         return (
                           <div key={contract.id} className="group flex flex-col justify-between gap-5 rounded-[24px] border border-slate-100 bg-white p-5 transition-all hover:border-sky-200 sm:rounded-[28px] sm:p-6 lg:flex-row lg:items-center">
                              <div className="flex items-start gap-4 sm:gap-5">
                                 <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors sm:size-14 sm:rounded-2xl ${isLongTerm ? 'bg-amber-50 text-amber-500 group-hover:bg-amber-100 group-hover:text-amber-600' : 'bg-slate-50 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-600'}`}>
                                    <FileText className="size-6 sm:size-7" />
                                 </div>
                                 <div className="min-w-0 flex-1 space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                       <h3 className="truncate text-sm font-black leading-tight text-slate-900 sm:text-base">{contract.title}</h3>
                                       <Badge variant="outline" className={`rounded-full border-none px-2 py-0 text-[9px] font-black uppercase sm:text-[10px] ${statusInfo.color}`}>{statusInfo.label}</Badge>
                                       {isLongTerm && (
                                          <Badge variant="outline" className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0 text-[9px] font-bold text-amber-700 sm:text-[10px]">Lưu trú dài hạn</Badge>
                                       )}
                                    </div>
                                    <div className="flex flex-col gap-x-4 gap-y-1 overflow-hidden text-[11px] font-medium text-slate-400 sm:flex-row sm:items-center sm:text-xs">
                                       <span className="flex items-center gap-1.5 truncate"><Building2 className="size-3 shrink-0 sm:size-3.5" /> {contract.booking.room.property.name}</span>
                                       <span className="hidden text-slate-200 sm:inline">|</span>
                                       <span className="flex items-center gap-1.5"><Calendar className="size-3 shrink-0 sm:size-3.5" /> Ngày tạo: {new Date(contract.created_at).toLocaleDateString("vi-VN")}</span>
                                       <span className="truncate whitespace-nowrap font-bold text-sky-600">ID: {contract.id}</span>
                                    </div>
                                 </div>
                              </div>
       
                              <div className="flex items-center justify-between gap-3 border-t border-slate-50 pt-4 lg:justify-end lg:border-none lg:pt-0">
                                 <Button onClick={() => handleDownloadContract(contract)} variant="ghost" size="icon" className="size-10 rounded-xl text-slate-400 hover:bg-slate-100 sm:size-12 sm:rounded-2xl">
                                    <Download className="size-5" />
                                 </Button>
                                 <Button asChild className={`
                                   flex h-10 flex-1 items-center gap-2 rounded-xl px-5 font-bold transition-all sm:h-12 sm:rounded-2xl sm:px-6 lg:flex-none
                                   ${showSignButton 
                                     ? "border-none bg-amber-600 text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500" 
                                     : "border-none bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800"}
                                 `}>
                                    <Link to={ROUTERS.BKS_STAY_CONTRACT_DETAIL.replace(":id", contract.id.toString())}>
                                       <span className="whitespace-nowrap">{showSignButton ? "Ký ngay" : "Chi tiết"}</span>
                                       <ChevronRight className="size-4 shrink-0" />
                                    </Link>
                                 </Button>
                              </div>
                           </div>
                         );
                      })
             ) : (
               <div className="py-20 text-center">
                  <AlertCircle className="mx-auto mb-4 size-12 text-slate-200" />
                  <p className="font-bold text-slate-400">Không tìm thấy hợp đồng nào phù hợp.</p>
               </div>
             )}
          </div>
        </CardContent>
      </Card>

      {lastPage > 1 && (
        <div className="mt-4 flex justify-center">
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

      {/* Info Card */}
      <Card className="relative overflow-hidden rounded-[32px] border-none bg-slate-900 p-8 text-white shadow-xl shadow-slate-200/50">
         <div className="absolute right-0 top-0 p-8 opacity-5">
            <CheckCircle2 className="size-32" />
         </div>
         <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-white/10">
               <Clock className="size-8 text-sky-400" />
            </div>
            <div>
               <h3 className="mb-2 text-xl font-black">Hợp đồng điện tử là gì?</h3>
               <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
                  BKS sử dụng chữ ký điện tử có giá trị pháp lý tương đương hợp đồng giấy. 
                  Việc ký kết trực tuyến giúp bạn tiết kiệm thời gian và đảm bảo mọi kỳ nghỉ được xác nhận nhanh chóng.
               </p>
            </div>
            <Button onClick={() => setIsLearnMoreOpen(true)} variant="outline" className="h-12 rounded-2xl border-white/10 px-6 text-white hover:bg-white/5 md:ml-auto">Tìm hiểu thêm</Button>
         </div>
      </Card>

      {/* Learn More Modal */}
      <Dialog open={isLearnMoreOpen} onOpenChange={setIsLearnMoreOpen}>
        <DialogContent className="rounded-[32px] border-none bg-white p-8 max-w-lg shadow-2xl">
          <DialogHeader className="mb-4 text-left">
            <DialogTitle className="text-2xl font-black text-slate-900">Giá trị pháp lý Hợp đồng điện tử</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Tìm hiểu các cơ sở pháp lý và tính an toàn bảo mật của e-contracts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-2 text-sm leading-relaxed text-slate-600">
            <div className="flex gap-3">
              <ShieldCheck className="size-5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-bold text-slate-900">Luật Giao dịch Điện tử Việt Nam</p>
                <p className="text-xs mt-1">Hợp đồng điện tử có đầy đủ giá trị pháp lý tương đương hợp đồng văn bản giấy truyền thống (theo quy định tại Điều 33, 34 Luật Giao dịch điện tử số 20/2023/QH15).</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="size-5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-bold text-slate-900">Mã hóa bảo mật thông tin</p>
                <p className="text-xs mt-1">Mọi điều khoản thỏa thuận, thông tin giá phòng và chữ ký của các bên đều được mã hóa bằng thuật toán bảo mật an toàn, tránh việc can thiệp trái phép hoặc sửa đổi nội dung sau ký.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="size-5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-bold text-slate-900">Lưu trữ đám mây vĩnh viễn</p>
                <p className="text-xs mt-1">Bản hợp đồng hoàn chỉnh có chữ ký xác nhận của hai bên sẽ được lưu trữ vĩnh viễn trên cơ sở dữ liệu BKS Stay, cho phép bạn truy cập, tra cứu và tải xuống bất kỳ lúc nào.</p>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={() => setIsLearnMoreOpen(false)} className="w-full rounded-2xl bg-slate-900 font-bold text-white">Đã hiểu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contracts;
