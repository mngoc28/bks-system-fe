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
  Building
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ROUTERS } from "@/constant";

import stayService, { Contract } from "@/services/stayService";

const Contracts = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

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
        return { label: "Chờ ký", color: "bg-amber-100 text-amber-700 border-amber-200" };
      case 1:
        return { label: "Hiệu lực", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
      case 2:
        return { label: "Đã xong", color: "bg-slate-100 text-slate-500 border-slate-200" };
      default:
        return { label: "N/A", color: "bg-slate-100 text-slate-400" };
    }
  };

  const filteredContracts = contracts.filter(c => {
    const statusLabel = getStatusInfo(c.status).label;
    const matchesTab = activeTab === "all" || statusLabel.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toString().includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hợp đồng của tôi</h1>
           <p className="text-slate-500 text-sm mt-1">Xem và quản lý các thỏa thuận pháp lý cho mọi kỳ nghỉ của bạn.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Tìm tên hợp đồng hoặc mã số..." 
                className="pl-10 h-12 rounded-2xl border-slate-100 bg-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white overflow-hidden">
        <CardContent className="p-0">
          {/* Tabs */}
          <div className="p-8 border-b border-slate-100">
             <div className="flex p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto max-w-full">
                {["all", "Chờ ký", "Hiệu lực", "Đã xong"].map((tab) => (
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
          </div>

                <div className="p-4 sm:p-8 space-y-4">
                   {filteredContracts.length > 0 ? (
                     filteredContracts.map((contract) => {
                        const statusInfo = getStatusInfo(contract.status);
                        return (
                          <div key={contract.id} className="p-5 sm:p-6 rounded-[24px] sm:rounded-[28px] border border-slate-100 bg-white hover:border-sky-200 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group">
                             <div className="flex items-start gap-4 sm:gap-5">
                                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors shrink-0">
                                   <FileText className="h-6 w-6 sm:h-7 sm:w-7" />
                                </div>
                                <div className="space-y-1.5 min-w-0 flex-1">
                                   <div className="flex flex-wrap items-center gap-2">
                                      <h3 className="font-black text-slate-900 leading-tight text-sm sm:text-base truncate">{contract.title}</h3>
                                      <Badge variant="outline" className={`text-[9px] sm:text-[10px] font-black uppercase rounded-full px-2 py-0 border-none ${statusInfo.color}`}>{statusInfo.label}</Badge>
                                   </div>
                                   <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-[11px] sm:text-xs text-slate-400 font-medium overflow-hidden">
                                      <span className="flex items-center gap-1.5 truncate"><Building className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" /> {contract.booking.room.building.name}</span>
                                      <span className="hidden sm:inline text-slate-200">|</span>
                                      <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" /> Ngày tạo: {new Date(contract.created_at).toLocaleDateString("vi-VN")}</span>
                                      <span className="font-bold text-sky-600 truncate whitespace-nowrap">ID: {contract.id}</span>
                                   </div>
                                </div>
                             </div>
      
                             <div className="flex items-center justify-between lg:justify-end gap-3 pt-4 lg:pt-0 border-t border-slate-50 lg:border-none">
                                <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl hover:bg-slate-100 text-slate-400">
                                   <Download className="h-5 w-5" />
                                </Button>
                                <Button asChild className={`
                                  rounded-xl sm:rounded-2xl h-10 sm:h-12 px-5 sm:px-6 font-bold flex items-center gap-2 transition-all flex-1 lg:flex-none
                                  ${contract.status === 0 
                                    ? "bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/20 text-white border-none" 
                                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10 border-none"}
                                `}>
                                   <Link to={ROUTERS.BKS_STAY_CONTRACT_DETAIL.replace(":id", contract.id.toString())}>
                                      <span className="whitespace-nowrap">{contract.status === 0 ? "Ký ngay" : "Chi tiết"}</span>
                                      <ChevronRight className="h-4 w-4 shrink-0" />
                                   </Link>
                                </Button>
                             </div>
                          </div>
                        );
                     })
             ) : (
               <div className="py-20 text-center">
                  <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">Không tìm thấy hợp đồng nào phù hợp.</p>
               </div>
             )}
          </div>
        </CardContent>
      </Card>

      {lastPage > 1 && (
        <div className="flex justify-center mt-4">
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

      {/* Info Card */}
      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-slate-900 text-white p-8 relative overflow-hidden">
         <div className="absolute right-0 top-0 p-8 opacity-5">
            <CheckCircle2 className="h-32 w-32" />
         </div>
         <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="h-16 w-16 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
               <Clock className="h-8 w-8 text-sky-400" />
            </div>
            <div>
               <h3 className="text-xl font-black mb-2">Hợp đồng điện tử là gì?</h3>
               <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                  BKS sử dụng chữ ký điện tử có giá trị pháp lý tương đương hợp đồng giấy. 
                  Việc ký kết trực tuyến giúp bạn tiết kiệm thời gian và đảm bảo mọi kỳ nghỉ được xác nhận nhanh chóng.
               </p>
            </div>
            <Button variant="outline" className="md:ml-auto rounded-2xl border-white/10 hover:bg-white/5 text-white h-12 px-6">Tìm hiểu thêm</Button>
         </div>
      </Card>
    </div>
  );
};

export default Contracts;
