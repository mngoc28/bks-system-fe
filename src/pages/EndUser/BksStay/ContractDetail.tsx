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
import { computeBookingTotalAmount } from "@/utils/bookingAmount";
import { formatPrice } from "@/utils/utils";
import { formatDate } from "@/utils/dateUtils";
import { toastSuccess, toastError, toastInfo } from "@/components/ui/toast";
import SignaturePad from "@/components/shared/SignaturePad";
import stayService, { Contract } from "@/services/stayService";
import html2canvas from "html2canvas";

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

    if (contract && contract.booking?.status !== 1) {
      toastError("Đơn đặt phòng chưa được Partner xác nhận. Vui lòng đợi trước khi ký hợp đồng.");
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

  const handleDownloadImage = async () => {
    const element = document.getElementById("voucher-card-print");
    if (!element || !contract) return;
    
    toastInfo("Đang xuất ảnh phiếu xác nhận...");
    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Phieu-xac-nhan-luu-tru-${contract.id}.png`;
      link.click();
      toastSuccess("Đã tải ảnh phiếu xác nhận thành công!");
    } catch (error) {
      console.error("Error generating image", error);
      toastError("Không thể xuất ảnh phiếu xác nhận. Vui lòng thử lại.");
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
        <Spinner size="lg" />
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
  const startDate = contract.booking?.start_date ? formatDate(contract.booking.start_date) : "N/A";
  const endDate = contract.booking?.end_date ? formatDate(contract.booking.end_date) : "N/A";
  const totalPrice = contract.booking
    ? computeBookingTotalAmount({
        start_date: contract.booking.start_date,
        end_date: contract.booking.end_date,
        price: {
          price: (contract.booking.price as any)?.price,
          unit: (contract.booking.price as any)?.unit,
        },
        total_amount: (contract.booking as any).total_amount,
      })
    : 0;
  const bookingId = contract.booking?.id ?? contract.booking_id;
  const canSignContract = contract.booking?.status === 1;
  const isLongTerm = contract.contract_type === 'LEASE_AGREEMENT';

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
        <div className="flex flex-wrap gap-3">
           {isLongTerm ? (
              <Button 
                variant="outline" 
                className="h-12 gap-2 rounded-2xl border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50" 
                onClick={() => window.print()}
              >
                 <ExternalLink className="size-4 text-slate-400" /> In hợp đồng / Xem trước
              </Button>
           ) : (
              <>
                <Button 
                  variant="outline" 
                  className="h-12 gap-2 rounded-2xl border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50" 
                  onClick={() => window.print()}
                >
                   <ExternalLink className="size-4 text-slate-400" /> In phiếu / Xem trước
                </Button>
                <Button 
                  className="h-12 gap-2 rounded-2xl border-none bg-sky-600 font-bold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-500" 
                  onClick={handleDownloadImage}
                >
                   <Download className="size-4" /> Tải ảnh (PNG)
                </Button>
              </>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Contract Content */}
        <div className="space-y-6 lg:col-span-2">
           <Card id="voucher-card-print" className="flex min-h-[800px] flex-col overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
              <div className="border-b border-slate-100 bg-slate-50/50 p-12">
                 <div className="mb-10 flex items-start justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#1e3a8a] text-white font-black text-sm tracking-wider shadow-sm select-none">
                       BKS
                    </div>
                    <div className="text-right">
                       <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
                       <p className="mt-1 text-xs font-bold text-slate-500">Độc lập - Tự do - Hạnh phúc</p>
                    </div>
                 </div>
                 
                 <div className="mb-12 space-y-2 text-center">
                    <h2 className="text-2xl font-black uppercase text-slate-900">
                       {isLongTerm ? "HỢP ĐỒNG THUÊ CĂN HỘ DỊCH VỤ" : "PHIẾU XÁC NHẬN LƯU TRÚ"}
                    </h2>
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
                    <p>{isLongTerm ? "Dịch vụ bao gồm: Trang thiết bị nội thất cơ bản, hệ thống điện nước, dọn dẹp vệ sinh định kỳ theo thỏa thuận riêng." : "Dịch vụ bao gồm: Wifi tốc độ cao, Nước suối hàng ngày, Dọn phòng định kỳ (nếu yêu cầu)."}</p>
                 </section>

                 <section className="space-y-4">
                    <h5 className="font-bold text-slate-900">ĐIỀU 2: THỜI HẠN VÀ GIÁ THUÊ</h5>
                    <div className="space-y-2 pl-2">
                       <p className="flex items-start gap-2">
                          <span className="text-slate-400 select-none">•</span>
                          <span>Thời gian bắt đầu: {startDate} {isLongTerm ? "" : "(Nhận phòng từ 14:00)"}</span>
                       </p>
                       <p className="flex items-start gap-2">
                          <span className="text-slate-400 select-none">•</span>
                          <span>Thời gian kết thúc: {endDate} {isLongTerm ? "" : "(Trả phòng trước 12:00)"}</span>
                       </p>
                       <p className="flex items-start gap-2">
                          <span className="text-slate-400 select-none">•</span>
                          <span>Tổng giá trị hợp đồng: <span className="font-bold text-slate-900">{formatPrice(totalPrice)}</span></span>
                       </p>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h5 className="font-bold text-slate-900">ĐIỀU 3: QUY TẮC SỬ DỤNG & NGHĨA VỤ</h5>
                    {isLongTerm ? (
                       <p>Bên B cam kết sử dụng phòng đúng mục đích lưu trú, thanh toán đầy đủ tiền thuê và phí dịch vụ phát sinh hàng tháng đúng hạn, bảo quản nguyên vẹn tài sản được bàn giao, tuân thủ nội quy phòng chống cháy nổ và quy chế quản lý của tòa nhà.</p>
                    ) : (
                       <p>Bên B cam kết tuân thủ mọi nội quy của tòa nhà, không gây ồn ào sau 22:00, không mang chất cấm và chất gây nổ vào phòng.</p>
                    )}
                 </section>

                 <div className="grid grid-cols-2 gap-12 pt-20 text-center italic text-slate-400">
                    <div className="space-y-6">
                       <p>Đại diện Bên A (Đã ký)</p>
                       <div className="flex h-32 items-center justify-center">
                          <div className="relative flex size-28 select-none items-center justify-center rounded-full border-4 border-double border-red-500/80 p-2 text-red-500/80 font-black rotate-[-8deg] duration-300 hover:rotate-0">
                             <div className="flex flex-col items-center text-center">
                                <span className="text-[7px] font-black uppercase tracking-wider leading-none">CÔNG TY BKS</span>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest border-y border-red-500/80 my-1 py-0.5 px-1.5 leading-none">ĐÃ XÁC THỰC</span>
                                <span className="text-[7px] font-bold uppercase tracking-wider leading-none">BKS STAY STAMP</span>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-10">
                       <p>Bên B (Ký và ghi rõ họ tên)</p>
                       <div className="flex h-32 flex-col items-center justify-center">
                          {isLongTerm ? (
                             (hasSigned || contract.status !== 0) ? (
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
                             )
                          ) : (
                             <div className="text-center italic text-slate-400 duration-500 animate-in fade-in">
                                <p className="text-xs font-bold text-emerald-600">Đã xác nhận tự động</p>
                                <p className="mt-1 text-[10px] leading-tight opacity-75">Hệ thống khớp mã đặt phòng<br/>{contract.booking?.booking_code}</p>
                             </div>
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

                  {isLongTerm ? (
                     (!hasSigned && contract.status === 0) ? (
                        <div className="space-y-4">
                           <div className={`flex gap-3 rounded-2xl border p-4 ${canSignContract ? "border-amber-100 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
                              <Info className={`mt-0.5 size-5 shrink-0 ${canSignContract ? "text-amber-600" : "text-slate-500"}`} />
                              <div className={`text-xs font-medium leading-relaxed ${canSignContract ? "text-amber-800" : "text-slate-600"}`}>
                                 {canSignContract ? (
                                    <div className="space-y-1.5">
                                       <p>• Đơn đặt phòng dài hạn của bạn đã được đối tác xác nhận <span className="text-emerald-600 font-bold">thành công</span>.</p>
                                       <p>• Vui lòng sử dụng tính năng ký trực tiếp hoặc tải lên ảnh chữ ký tay để hoàn tất ký hợp đồng điện tử.</p>
                                       <p>• <strong>Khuyến nghị:</strong> Sau khi ký, hãy chọn <strong>"In hợp đồng / Xem trước"</strong> để lưu hoặc in hợp đồng làm tài liệu đối chiếu khi nhận bàn giao căn hộ lúc check-in.</p>
                                    </div>
                                 ) : (
                                    <div className="space-y-1.5">
                                       <p>• Đơn đặt phòng của bạn đang được đối tác xem xét và chưa xác nhận.</p>
                                       <p>• Bạn chỉ có thể ký hợp đồng trực tuyến sau khi đơn đặt phòng được xác nhận <span className="text-emerald-600 font-bold">thành công</span>.</p>
                                    </div>
                                 )}
                              </div>
                           </div>
                           <Button 
                             disabled={!canSignContract}
                             onClick={() => setIsSignModalOpen(true)}
                             className="flex h-16 w-full items-center justify-center gap-2 rounded-[24px] bg-amber-600 text-lg font-black text-white shadow-xl shadow-amber-600/20 transition-all hover:scale-[1.02] hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-amber-600"
                           >
                              Ký hợp đồng ngay <ChevronRight className="size-5" />
                           </Button>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
                              <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                              <div className="text-xs font-medium">
                                 <p className="font-bold text-emerald-800">Hợp đồng đã ký kết thành công</p>
                                 <div className="mt-1.5 space-y-1 text-[10px] leading-relaxed opacity-90">
                                    <p>• Hợp đồng thuê căn hộ dịch vụ của bạn đã được xác lập <span className="text-emerald-600 font-bold">thành công</span> và có đầy đủ hiệu lực pháp lý.</p>
                                    <p>• <strong>Khuyến nghị:</strong> Vui lòng chọn <strong>"In hợp đồng / Xem trước"</strong> để tải bản PDF hoặc in bản sao lưu trữ ngoại tuyến.</p>
                                    <p>• Hãy xuất trình bản hợp đồng này khi nhận bàn giao căn hộ để hoàn tất thủ tục check-in.</p>
                                    <p>• Hồ sơ bảo mật tuyệt đối bởi chứng chỉ số SHA-256 của BKS Systems.</p>
                                 </div>
                              </div>
                           </div>
                           <Button className="h-14 w-full rounded-2xl border-none bg-slate-900 font-bold text-white shadow-lg shadow-slate-900/10" onClick={() => navigate(`${ROUTERS.BKS_STAY_DETAILS.replace(":id", String(bookingId))}?confirmed=true`)}>
                              Xem kỳ nghỉ liên quan
                           </Button>
                           {hasSigned && contract.status === 0 && (
                             <Button variant="ghost" className="w-full text-xs text-slate-400" onClick={() => { setHasSigned(false); setSignatureData(null); }}>Hủy và ký lại</Button>
                           )}
                        </div>
                     )
                  ) : (
                     // Đối với ngắn hạn (Voucher)
                     <div className="space-y-4">
                        <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
                           <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                           <div className="text-xs font-medium">
                              <p className="font-bold text-emerald-800">Phiếu lưu trú đã sẵn sàng</p>
                              <div className="mt-1.5 space-y-1 text-[10px] leading-relaxed opacity-90">
                                 <p>• Phiếu xác nhận lưu trú của bạn đã được khởi tạo <span className="text-emerald-600 font-bold">thành công</span>.</p>
                                 <p>• Bạn chỉ cần xuất trình phiếu xác nhận lưu trú này để làm thủ tục nhận phòng lúc check-in.</p>
                                 <p>• <strong>Khuyến nghị:</strong> Hãy bấm nút <strong>"Tải ảnh (PNG)"</strong> bên trên để lưu phiếu về máy, đề phòng trường hợp thiết bị mất kết nối internet khi đến cơ sở lưu trú.</p>
                              </div>
                           </div>
                        </div>
                        <Button className="h-14 w-full rounded-2xl border-none bg-slate-900 font-bold text-white shadow-lg shadow-slate-900/10" onClick={() => navigate(`${ROUTERS.BKS_STAY_DETAILS.replace(":id", String(bookingId))}?confirmed=true`)}>
                           Xem kỳ nghỉ liên quan
                        </Button>
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
