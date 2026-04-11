import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Download,
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  ExternalLink,
  Info,
  ChevronRight,
  Upload,
  PenTool,
  RotateCcw,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
import SignaturePad from "@/components/shared/SignaturePad";
import stayService, { Contract } from "@/services/stayService";

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSigning, setIsSigning] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [signMethod, setSignMethod] = useState<"draw" | "upload">("draw");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchContract = async () => {
      if (!id) return;
      try {
        const response: any = await stayService.getContractDetail(id);
        const data = response?.data;
        if (data) {
          setContract(data);
          if (data.status === 1 || data.status === 2) {
            setHasSigned(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch contract details", error);
        toast.error("Không tìm thấy hợp đồng");
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [id]);

  const handleSign = () => {
    if (!signatureData) {
      toast.error("Vui lòng cung cấp chữ ký trước khi xác nhận!");
      return;
    }

    setIsSigning(true);
    setTimeout(() => {
      setHasSigned(true);
      setIsSigning(false);
      setIsSignModalOpen(false);
      toast.success("Hợp đồng đã được ký kết thành công!");
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setSignatureData(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Vui lòng chọn một file ảnh hợp lệ.");
      }
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return "Chờ ký";
      case 1: return "Hiệu lực";
      case 2: return "Đã xong";
      default: return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-20">
         <p className="text-slate-400 font-bold">Không tìm thấy hợp đồng.</p>
         <Button variant="ghost" asChild className="text-sky-600 mt-4">
            <Link to={ROUTERS.BKS_STAY_CONTRACTS}>Quay lại danh sách</Link>
         </Button>
      </div>
    );
  }

  // Derived display values with safe optional chaining
  const guestName = contract.booking?.user?.name ?? "Khách thuê";
  const roomTitle = contract.booking?.room?.title ?? "N/A";
  const buildingAddress = contract.booking?.room?.building?.address ?? "theo thỏa thuận";
  const startDate = contract.booking?.start_date ?? "N/A";
  const endDate = contract.booking?.end_date ?? "N/A";
  const totalPrice = contract.booking?.price?.price ?? 0;
  const bookingId = contract.booking?.id ?? contract.booking_id;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Back & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <Button variant="ghost" asChild className="rounded-xl h-10 px-3 hover:bg-white text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all">
              <Link to={ROUTERS.BKS_STAY_CONTRACTS} className="flex items-center gap-2">
                 <ArrowLeft className="h-4 w-4" /> Danh sách hợp đồng
              </Link>
           </Button>
           <div className="h-4 w-[1px] bg-slate-200" />
           <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">ID: {contract.id}</span>
        </div>
        <Button variant="outline" className="rounded-2xl h-12 border-slate-200 font-bold gap-2 bg-white" onClick={() => toast.info("Đang tạo file PDF...")}>
           <Download className="h-4 w-4" /> Tải bản PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Contract Content */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white overflow-hidden min-h-[800px] flex flex-col">
              <div className="p-12 border-b border-slate-100 bg-slate-50/50">
                 <div className="flex justify-between items-start mb-10">
                    <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="h-10 w-auto shadow-sm" />
                    <div className="text-right">
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
                       <p className="text-xs text-slate-500 font-bold mt-1">Độc lập - Tự do - Hạnh phúc</p>
                    </div>
                 </div>
                 
                 <div className="text-center space-y-2 mb-12">
                    <h2 className="text-2xl font-black text-slate-900 uppercase">HỢP ĐỒNG THUÊ PHÒNG NGẮN HẠN</h2>
                    <p className="text-sm text-slate-400 font-bold tracking-widest uppercase">Số: {contract.id}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
                    <div className="space-y-4">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">BÊN CHO THUÊ (BÊN A)</p>
                          <p className="font-bold text-slate-900">CÔNG TY CỔ PHẦN CÔNG NGHỆ BKS</p>
                          <p className="text-slate-500 text-xs mt-1">Đại diện: Ban Quản lý BKS Stay</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">BÊN THUÊ (BÊN B)</p>
                          <p className="font-bold text-slate-900">{guestName.toUpperCase()}</p>
                          <p className="text-slate-500 text-xs mt-1">Loại khách: Thành viên</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-12 flex-1 space-y-8 text-slate-600 text-sm leading-relaxed">
                 <section className="space-y-4">
                    <h5 className="font-bold text-slate-900">ĐIỀU 1: THÔNG TIN PHÒNG THUÊ</h5>
                    <p>Bên A đồng ý cho Bên B thuê phòng <span className="font-bold text-slate-900">"{roomTitle}"</span> tọa lạc tại địa chỉ: {buildingAddress}.</p>
                    <p>Dịch vụ bao gồm: Wifi tốc độ cao, Nước suối hàng ngày, Dọn phòng định kỳ (nếu yêu cầu).</p>
                 </section>

                 <section className="space-y-4">
                    <h5 className="font-bold text-slate-900">ĐIỀU 2: THỜI HẠN VÀ GIÁ THUÊ</h5>
                    <ul className="list-disc pl-5 space-y-2">
                       <li>Thời gian bắt đầu: {startDate} (Nhận phòng từ 14:00)</li>
                       <li>Thời gian kết thúc: {endDate} (Trả phòng trước 12:00)</li>
                       <li>Tổng giá giá trị hợp đồng: <span className="font-bold text-slate-900">{formatPrice(totalPrice)}</span></li>
                    </ul>
                 </section>

                 <section className="space-y-4">
                    <h5 className="font-bold text-slate-900">ĐIỀU 3: QUY TẮC SỬ DỤNG</h5>
                    <p>Bên B cam kết tuân thủ mọi nội quy của tòa nhà, không gây ồn ào sau 22:00, không mang chất cấm và chất gây nổ vào phòng.</p>
                 </section>

                 <div className="pt-20 grid grid-cols-2 gap-12 text-center italic text-slate-400">
                    <div className="space-y-20">
                       <p>Đại diện Bên A (Đã ký)</p>
                       <div className="p-4 border-2 border-slate-50 rounded-2xl">
                          <img src="/app/images/front/bks-icon.svg" alt="BKS Stamp" className="h-16 mx-auto opacity-20 grayscale brightness-0 contrast-200" />
                       </div>
                    </div>
                    <div className="space-y-10">
                       <p>Bên B (Ký và ghi rõ họ tên)</p>
                       <div className="h-32 flex flex-col items-center justify-center">
                          {(hasSigned || contract.status !== 0) ? (
                             <div className="animate-in fade-in zoom-in-95 duration-500 text-center">
                                {signatureData ? (
                                  <img src={signatureData} alt="Signature" className="h-20 object-contain mx-auto mix-blend-multiply" />
                                ) : (
                                  <div className="text-sky-600 font-mono text-2xl font-bold">{guestName}</div>
                                )}
                                <p className="text-[10px] font-mono mt-2 text-slate-400">Đã xác thực điện tử</p>
                             </div>
                          ) : (
                             <span className="text-slate-200">Chờ ký kết</span>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
           </Card>
        </div>

        {/* Right Column: Actions & Meta */}
        <div className="space-y-6">
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white p-8">
              <h3 className="text-xl font-bold mb-6">Trạng thái hồ sơ</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-white rounded-xl shadow-sm"><Clock className="h-4 w-4 text-amber-600" /></div>
                       <span className="text-xs font-bold text-slate-600 text-[10px] uppercase tracking-widest">Trạng thái</span>
                    </div>
                    <Badge className={`rounded-full px-3 py-1 font-bold ${(!hasSigned && contract.status === 0) ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                       {hasSigned ? "HIỆU LỰC" : getStatusLabel(contract.status).toUpperCase()}
                    </Badge>
                 </div>

                 {(!hasSigned && contract.status === 0) ? (
                    <div className="space-y-4">
                       <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800 leading-relaxed font-medium">
                             Vui lòng sử dụng tính năng ký tay hoặc tải ảnh chữ ký lên để hoàn tất thủ tục.
                          </p>
                       </div>
                       <Button 
                         onClick={() => setIsSignModalOpen(true)}
                         className="w-full h-16 rounded-[24px] bg-amber-600 hover:bg-amber-500 text-white font-black text-lg shadow-xl shadow-amber-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                       >
                          Ký hợp đồng ngay <ChevronRight className="h-5 w-5" />
                       </Button>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 text-emerald-800">
                          <CheckCircle2 className="h-5 w-5 shrink-0" />
                          <div>
                             <p className="text-xs font-bold">Bảo mật tuyệt đối</p>
                             <p className="text-[10px] leading-relaxed opacity-70">Hợp đồng này được bảo vệ bởi chứng chỉ số SHA-256 của BKS Systems.</p>
                          </div>
                       </div>
                       <Button className="w-full h-14 rounded-2xl bg-slate-900 border-none font-bold text-white shadow-lg shadow-slate-900/10" onClick={() => navigate(ROUTERS.BKS_STAY_DETAILS.replace(":id", String(bookingId)))}>
                          Xem kỳ nghỉ liên quan
                       </Button>
                       {hasSigned && contract.status === 0 && (
                         <Button variant="ghost" className="w-full text-xs text-slate-400" onClick={() => { setHasSigned(false); setSignatureData(null); }}>Hủy và ký lại</Button>
                       )}
                    </div>
                 )}
              </div>
           </Card>

           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white p-8">
              <h3 className="text-xl font-bold mb-6">Hành động</h3>
              <div className="space-y-3 font-bold text-sm">
                 <button onClick={() => toast.info("Đang mở bản dịch...")} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <span className="flex items-center gap-3"><ExternalLink className="h-4 w-4 text-slate-400" /> Ngôn ngữ: Tiếng Việt</span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
                 <button onClick={() => toast.info("Đang xác thực...")} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <span className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-slate-400" /> Xác thực tính pháp lý</span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                 </button>
              </div>
           </Card>
        </div>
      </div>

      {/* Signature Modal */}
      <Dialog open={isSignModalOpen} onOpenChange={setIsSignModalOpen}>
         <DialogContent className="sm:max-w-lg rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
            <div className="h-20 bg-slate-900 flex items-center justify-center text-white relative">
               <PenTool className="h-8 w-8 text-sky-400" />
               <button onClick={() => setIsSignModalOpen(false)} className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="h-5 w-5 text-white/40" />
               </button>
            </div>
            <div className="p-8">
               <DialogHeader className="text-left mb-6">
                  <DialogTitle className="text-2xl font-black text-slate-900">Ký kết văn bản</DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium pt-2">
                     Vui lòng cung cấp chữ ký tay hoặc tải ảnh chữ ký lên để hoàn tất.
                  </DialogDescription>
               </DialogHeader>

               <div className="space-y-6 mb-8">
                  {/* Custom Tabs */}
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                     <button 
                       onClick={() => { setSignMethod("draw"); setSignatureData(null); }}
                       className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${signMethod === "draw" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}
                     >
                        <PenTool className="h-3.5 w-3.5" /> Ký trực tiếp
                     </button>
                     <button 
                       onClick={() => { setSignMethod("upload"); setSignatureData(null); }}
                       className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${signMethod === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}
                     >
                        <Upload className="h-3.5 w-3.5" /> Tải ảnh lên
                     </button>
                  </div>

                  {signMethod === "draw" ? (
                    <SignaturePad onSave={setSignatureData} />
                  ) : (
                    <div className="space-y-4">
                       {!signatureData ? (
                         <button 
                           onClick={() => fileInputRef.current?.click()}
                           className="w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center gap-3 group hover:border-sky-300 hover:bg-sky-50 transition-all"
                         >
                            <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><Upload className="h-6 w-6 text-slate-400" /></div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nhấn để chọn ảnh chữ ký</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                         </button>
                       ) : (
                         <div className="relative group">
                            <div className="w-full h-48 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-4">
                               <img src={signatureData} alt="Preview" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                            </div>
                            <button 
                              onClick={() => setSignatureData(null)}
                              className="absolute top-2 right-2 p-2 bg-slate-900/80 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                               <RotateCcw className="h-4 w-4" />
                            </button>
                         </div>
                       )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-2xl border border-sky-100">
                     <ShieldCheck className="h-5 w-5 text-sky-600 shrink-0" />
                     <p className="text-[10px] text-sky-800 font-medium leading-relaxed italic">
                        Tôi xác nhận đây là chữ ký chính chủ và tự nguyện ký kết hợp đồng này.
                     </p>
                  </div>
               </div>

               <DialogFooter className="sm:justify-start gap-3">
                  <Button onClick={handleSign} disabled={isSigning || !signatureData} className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 font-bold shadow-lg shadow-slate-900/10">
                     {isSigning ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : "Xác nhận & Hoàn tất"}
                  </Button>
               </DialogFooter>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractDetail;
