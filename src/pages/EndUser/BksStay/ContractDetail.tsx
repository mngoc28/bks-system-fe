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
import { Spinner } from "@/components/ui/spinner";
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
import { toastSuccess, toastError, toastInfo } from "@/components/ui/toast";
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
            if (data.signature) setSignatureData(data.signature);
          }
        }
      } catch (error) {
        console.error("Failed to fetch contract details", error);
        toastError("Không tìm thấy hợp đồng");
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [id]);

  const handleSign = async () => {
    if (!signatureData) {
      toastError("Vui lòng cung cấp chữ ký trước khi xác nhận!");
      return;
    }

    if (!id) return;

    setIsSigning(true);
    try {
      await stayService.signContract(id, signatureData);
      setHasSigned(true);
      setIsSignModalOpen(false);
      toastSuccess("Hợp đồng đã được ký kết thành công!");

      // Tự động chuyển hướng về trang chi tiết đặt phòng để kích hoạt hiệu ứng chúc mừng
      setTimeout(() => {
        navigate(`${ROUTERS.BKS_STAY_DETAILS.replace(":id", String(bookingId))}?confirmed=true`);
      }, 2000);
    } catch (error) {
      console.error(error);
      toastError("Lỗi khi ký hợp đồng. Vui lòng thử lại sau.");
    } finally {
      setIsSigning(false);
    }
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
        toastError("Vui lòng chọn một file ảnh hợp lệ.");
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
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" spinnerClassName="border-y-sky-600" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="py-20 text-center">
         <p className="font-bold text-slate-400">Không tìm thấy hợp đồng.</p>
         <Button variant="ghost" asChild className="mt-4 text-sky-600">
            <Link to={ROUTERS.BKS_STAY_CONTRACTS}>Quay lại danh sách</Link>
         </Button>
      </div>
    );
  }

  // Derived display values with safe optional chaining
  const guestName = contract.booking?.user?.name ?? "Khách thuê";
  const roomTitle = contract.booking?.room?.title ?? "N/A";
  const propertyAddress = contract.booking?.room?.property?.address ?? "theo thỏa thuận";
  const startDate = contract.booking?.start_date ?? "N/A";
  const endDate = contract.booking?.end_date ?? "N/A";
  const totalPrice = contract.booking?.price?.price ?? 0;
  const bookingId = contract.booking?.id ?? contract.booking_id;

  return (
    <div className="space-y-8 pb-20 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Back & Breadcrumb */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
           <Button variant="ghost" asChild className="h-10 rounded-xl border border-transparent px-3 text-slate-500 transition-all hover:border-slate-200 hover:bg-white hover:text-slate-900">
              <Link to={ROUTERS.BKS_STAY_CONTRACTS} className="flex items-center gap-2">
                 <ArrowLeft className="size-4" /> Danh sách hợp đồng
              </Link>
           </Button>
           <div className="h-4 w-px bg-slate-200" />
           <span className="text-xs font-black uppercase leading-none tracking-widest text-slate-400">ID: {contract.id}</span>
        </div>
        <Button variant="outline" className="h-12 gap-2 rounded-2xl border-slate-200 bg-white font-bold" onClick={() => toastInfo("Đang tạo file PDF...")}>
           <Download className="size-4" /> Tải bản PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Contract Content */}
        <div className="space-y-6 lg:col-span-2">
           <Card className="flex min-h-[800px] flex-col overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
              <div className="border-b border-slate-100 bg-slate-50/50 p-12">
                 <div className="mb-10 flex items-start justify-between">
                    <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="h-10 w-auto shadow-sm" />
                    <div className="text-right">
                       <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
                       <p className="mt-1 text-xs font-bold text-slate-500">Độc lập - Tự do - Hạnh phúc</p>
                    </div>
                 </div>
                 
                 <div className="mb-12 space-y-2 text-center">
                    <h2 className="text-2xl font-black uppercase text-slate-900">HỢP ĐỒNG THUÊ PHÒNG NGẮN HẠN</h2>
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Số: {contract.id}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
                    <div className="space-y-4">
                       <div>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">BÊN CHO THUÊ (BÊN A)</p>
                          <p className="font-bold text-slate-900">CÔNG TY CỔ PHẦN CÔNG NGHỆ BKS</p>
                          <p className="mt-1 text-xs text-slate-500">Đại diện: Ban Quản lý BKS Stay</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">BÊN THUÊ (BÊN B)</p>
                          <p className="font-bold text-slate-900">{guestName.toUpperCase()}</p>
                          <p className="mt-1 text-xs text-slate-500">Loại khách: Thành viên</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex-1 space-y-8 p-12 text-sm leading-relaxed text-slate-600">
                 <section className="space-y-4">
                    <h5 className="font-bold text-slate-900">ĐIỀU 1: THÔNG TIN PHÒNG THUÊ</h5>
                    <p>Bên A đồng ý cho Bên B thuê phòng <span className="font-bold text-slate-900">"{roomTitle}"</span> tọa lạc tại địa chỉ: {propertyAddress}.</p>
                    <p>Dịch vụ bao gồm: Wifi tốc độ cao, Nước suối hàng ngày, Dọn phòng định kỳ (nếu yêu cầu).</p>
                 </section>

                 <section className="space-y-4">
                    <h5 className="font-bold text-slate-900">ĐIỀU 2: THỜI HẠN VÀ GIÁ THUÊ</h5>
                    <ul className="list-disc space-y-2 pl-5">
                       <li>Thời gian bắt đầu: {startDate} (Nhận phòng từ 14:00)</li>
                       <li>Thời gian kết thúc: {endDate} (Trả phòng trước 12:00)</li>
                       <li>Tổng giá giá trị hợp đồng: <span className="font-bold text-slate-900">{formatPrice(totalPrice)}</span></li>
                    </ul>
                 </section>

                 <section className="space-y-4">
                    <h5 className="font-bold text-slate-900">ĐIỀU 3: QUY TẮC SỬ DỤNG</h5>
                    <p>Bên B cam kết tuân thủ mọi nội quy của tòa nhà, không gây ồn ào sau 22:00, không mang chất cấm và chất gây nổ vào phòng.</p>
                 </section>

                 <div className="grid grid-cols-2 gap-12 pt-20 text-center italic text-slate-400">
                    <div className="space-y-20">
                       <p>Đại diện Bên A (Đã ký)</p>
                       <div className="rounded-2xl border-2 border-slate-50 p-4">
                          <img src="/app/images/front/bks-icon.svg" alt="BKS Stamp" className="mx-auto h-16 opacity-20 brightness-0 contrast-200 grayscale" />
                       </div>
                    </div>
                    <div className="space-y-10">
                       <p>Bên B (Ký và ghi rõ họ tên)</p>
                       <div className="flex h-32 flex-col items-center justify-center">
                          {(hasSigned || contract.status !== 0) ? (
                             <div className="text-center duration-500 animate-in fade-in zoom-in-95">
                                {signatureData ? (
                                  <img src={signatureData} alt="Signature" className="mx-auto h-20 object-contain mix-blend-multiply" />
                                ) : (
                                  <div className="font-mono text-2xl font-bold text-sky-600">{guestName}</div>
                                )}
                                <p className="mt-2 font-mono text-[10px] text-slate-400">Đã xác thực điện tử</p>
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
           <Card className="rounded-[32px] border-none bg-white p-8 shadow-xl shadow-slate-200/50">
              <h3 className="mb-6 text-xl font-bold">Trạng thái hồ sơ</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                       <div className="rounded-xl bg-white p-2 shadow-sm"><Clock className="size-4 text-amber-600" /></div>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Trạng thái</span>
                    </div>
                    <Badge className={`rounded-full px-3 py-1 font-bold ${(!hasSigned && contract.status === 0) ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                       {hasSigned ? "HIỆU LỰC" : getStatusLabel(contract.status).toUpperCase()}
                    </Badge>
                 </div>

                 {(!hasSigned && contract.status === 0) ? (
                    <div className="space-y-4">
                       <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                          <Info className="mt-0.5 size-5 shrink-0 text-amber-600" />
                          <p className="text-xs font-medium leading-relaxed text-amber-800">
                             Vui lòng sử dụng tính năng ký tay hoặc tải ảnh chữ ký lên để hoàn tất thủ tục.
                          </p>
                       </div>
                       <Button 
                         onClick={() => setIsSignModalOpen(true)}
                         className="flex h-16 w-full items-center justify-center gap-2 rounded-[24px] bg-amber-600 text-lg font-black text-white shadow-xl shadow-amber-600/20 transition-all hover:scale-[1.02] hover:bg-amber-500"
                       >
                          Ký hợp đồng ngay <ChevronRight className="size-5" />
                       </Button>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
                          <CheckCircle2 className="size-5 shrink-0" />
                          <div>
                             <p className="text-xs font-bold">Bảo mật tuyệt đối</p>
                             <p className="text-[10px] leading-relaxed opacity-70">Hợp đồng này được bảo vệ bởi chứng chỉ số SHA-256 của BKS Systems.</p>
                          </div>
                       </div>
                       <Button className="h-14 w-full rounded-2xl border-none bg-slate-900 font-bold text-white shadow-lg shadow-slate-900/10" onClick={() => navigate(`${ROUTERS.BKS_STAY_DETAILS.replace(":id", String(bookingId))}?confirmed=true`)}>
                          Xem kỳ nghỉ liên quan
                       </Button>
                       {hasSigned && contract.status === 0 && (
                         <Button variant="ghost" className="w-full text-xs text-slate-400" onClick={() => { setHasSigned(false); setSignatureData(null); }}>Hủy và ký lại</Button>
                       )}
                    </div>
                 )}
              </div>
           </Card>

           <Card className="rounded-[32px] border-none bg-white p-8 shadow-xl shadow-slate-200/50">
              <h3 className="mb-6 text-xl font-bold">Hành động</h3>
              <div className="space-y-3 text-sm font-bold">
                 <button onClick={() => toastInfo("Đang mở bản dịch...")} className="flex w-full items-center justify-between rounded-2xl p-4 transition-colors hover:bg-slate-50">
                    <span className="flex items-center gap-3"><ExternalLink className="size-4 text-slate-400" /> Ngôn ngữ: Tiếng Việt</span>
                    <ChevronRight className="size-4 text-slate-300" />
                 </button>
                 <button onClick={() => toastInfo("Đang xác thực...")} className="flex w-full items-center justify-between rounded-2xl p-4 transition-colors hover:bg-slate-50">
                    <span className="flex items-center gap-3"><ShieldCheck className="size-4 text-slate-400" /> Xác thực tính pháp lý</span>
                    <ChevronRight className="size-4 text-slate-300" />
                 </button>
              </div>
           </Card>
        </div>
      </div>

      {/* Signature Modal */}
      <Dialog open={isSignModalOpen} onOpenChange={setIsSignModalOpen}>
         <DialogContent className="overflow-hidden rounded-[32px] border-none p-0 shadow-2xl sm:max-w-lg">
            <div className="relative flex h-20 items-center justify-center bg-slate-900 text-white">
               <PenTool className="size-8 text-sky-400" />
               <button onClick={() => setIsSignModalOpen(false)} className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-white/10">
                  <X className="size-5 text-white/40" />
               </button>
            </div>
            <div className="p-8">
               <DialogHeader className="mb-6 text-left">
                  <DialogTitle className="text-2xl font-black text-slate-900">Ký kết văn bản</DialogTitle>
                  <DialogDescription className="pt-2 font-medium text-slate-500">
                     Vui lòng cung cấp chữ ký tay hoặc tải ảnh chữ ký lên để hoàn tất.
                  </DialogDescription>
               </DialogHeader>

               <div className="mb-8 space-y-6">
                  {/* Custom Tabs */}
                  <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
                     <button 
                       onClick={() => { setSignMethod("draw"); setSignatureData(null); }}
                       className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${signMethod === "draw" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}
                     >
                        <PenTool className="size-3.5" /> Ký trực tiếp
                     </button>
                     <button 
                       onClick={() => { setSignMethod("upload"); setSignatureData(null); }}
                       className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${signMethod === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}
                     >
                        <Upload className="size-3.5" /> Tải ảnh lên
                     </button>
                  </div>

                  {signMethod === "draw" ? (
                    <SignaturePad onSave={setSignatureData} />
                  ) : (
                    <div className="space-y-4">
                       {!signatureData ? (
                         <button 
                           onClick={() => fileInputRef.current?.click()}
                           className="group flex h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-sky-300 hover:bg-sky-50"
                         >
                            <div className="rounded-2xl bg-white p-4 shadow-sm transition-transform group-hover:scale-110"><Upload className="size-6 text-slate-400" /></div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Nhấn để chọn ảnh chữ ký</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                         </button>
                       ) : (
                         <div className="group relative">
                            <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4">
                               <img src={signatureData} alt="Preview" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                            </div>
                            <button 
                              onClick={() => setSignatureData(null)}
                              className="absolute right-2 top-2 rounded-xl bg-slate-900/80 p-2 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100"
                            >
                               <RotateCcw className="size-4" />
                            </button>
                         </div>
                       )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                     <ShieldCheck className="size-5 shrink-0 text-sky-600" />
                     <p className="text-[10px] font-medium italic leading-relaxed text-sky-800">
                        Tôi xác nhận đây là chữ ký chính chủ và tự nguyện ký kết hợp đồng này.
                     </p>
                  </div>
               </div>

               <DialogFooter className="gap-3 sm:justify-start">
                  <Button onClick={handleSign} disabled={isSigning || !signatureData} className="h-12 flex-1 rounded-2xl bg-slate-900 font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800">
                     {isSigning ? (
                        <Spinner size="sm" className="inline-block mr-2" spinnerClassName="border-y-white" />
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

