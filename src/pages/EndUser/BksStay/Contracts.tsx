import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Search, 
  ChevronRight, 
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

const Contracts = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const contracts = [
    { 
      id: "CON-2026-001", 
      title: "Hợp đồng thuê phòng Luxury Ocean", 
      property: "BKS Đà Nẵng River", 
      date: "09/04/2026", 
      status: "Chờ ký", 
      type: "Ngắn hạn",
      color: "bg-amber-100 text-amber-700 border-amber-200"
    },
    { 
      id: "CON-2026-002", 
      title: "Thỏa thuận dịch vụ BKS Stay Premium", 
      property: "BKS Toàn cầu", 
      date: "01/01/2026", 
      status: "Hiệu lực", 
      type: "Dịch vụ",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200"
    },
    { 
      id: "CON-2025-089", 
      title: "Hợp đồng thuê căn hộ Sapa Deluxe", 
      property: "BKS Sapa Mist", 
      date: "15/12/2025", 
      status: "Đã xong", 
      type: "Ngắn hạn",
      color: "bg-slate-100 text-slate-500 border-slate-200"
    }
  ];

  const filteredContracts = contracts.filter(c => {
    const matchesTab = activeTab === "all" || c.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

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

          <div className="p-8 space-y-4">
             {filteredContracts.length > 0 ? (
               filteredContracts.map((contract) => (
                 <div key={contract.id} className="p-6 rounded-[28px] border border-slate-100 bg-white hover:border-sky-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                    <div className="flex items-start gap-5">
                       <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                          <FileText className="h-7 w-7" />
                       </div>
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <h3 className="font-black text-slate-900 leading-tight">{contract.title}</h3>
                             <Badge variant="outline" className={`text-[10px] font-black uppercase rounded-full ${contract.color}`}>{contract.status}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                             <span className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5" /> {contract.property}</span>
                             <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Ngày tạo: {contract.date}</span>
                             <span className="font-bold text-sky-600">ID: {contract.id}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-slate-100 text-slate-400">
                          <Download className="h-5 w-5" />
                       </Button>
                       <Button asChild className={`
                         rounded-2xl h-12 px-6 font-bold flex items-center gap-2 transition-all
                         ${contract.status === "Chờ ký" 
                           ? "bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/20 text-white" 
                           : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10"}
                       `}>
                          <Link to={ROUTERS.BKS_STAY_CONTRACT_DETAIL.replace(":id", contract.id)}>
                             {contract.status === "Chờ ký" ? "Ký ngay" : "Xem chi tiết"}
                             <ChevronRight className="h-4 w-4" />
                          </Link>
                       </Button>
                    </div>
                 </div>
               ))
             ) : (
               <div className="py-20 text-center">
                  <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">Không tìm thấy hợp đồng nào phù hợp.</p>
               </div>
             )}
          </div>
        </CardContent>
      </Card>

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
