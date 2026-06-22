import React, { useState, useRef, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { 
  Building2, MapPin, ArrowRight, ArrowLeft,
  CheckCircle2, Building, Home, FileText, CreditCard, UploadCloud, 
  FileCheck, AlertCircle, RotateCcw, RefreshCw, FileSignature, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetWardsByProvinceId } from "@/hooks/useWardQuery";
import SearchableSelect from "@/components/ui/searchable-select";
import axiosClient from "@/api/axiosClient";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { resolvePartnerDocumentUrl } from "@/utils/imageUtils";
import { ProvinceTypes } from "@/dataHelper/province.dataHelper";
import { Ward } from "@/dataHelper/ward.dataHelper";
import { useQueryClient } from "@tanstack/react-query";

interface PartnerOnboardingWizardProps {
  user: any;
}

export default function PartnerOnboardingWizard({ user }: PartnerOnboardingWizardProps) {
  const queryClient = useQueryClient();
  const partnerInfo = user?.partner_info;
  const userStatus = Number(user?.status || 0); // 0: PENDING, 3: PENDING_APPROVAL, 4: REJECTED

  // Wizard active step: default 2 (since step 1 credentials is already completed)
  const [activeStep, setActiveStep] = useState<number>(2);
  const [partnerType, setPartnerType] = useState<string>(partnerInfo?.partner_type || "hotel");
  // Controls whether to show the edit wizard after rejection (instead of the rejection info screen)
  const [showEditWizard, setShowEditWizard] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // File states
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [ownershipDoc, setOwnershipDoc] = useState<File | null>(null);
  const [bankStatement, setBankStatement] = useState<File | null>(null);

  // E-Sign Canvas states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  // Document previews states
  const [docPreviewUrls, setDocPreviewUrls] = useState<Record<string, string>>({});

  const isPdfFile = (path?: string) => {
    if (!path) return false;
    return path.toLowerCase().includes('.pdf');
  };

  const getDocumentUrl = (path?: string) => resolvePartnerDocumentUrl(path, CLOUDINARY_HEADER_IMAGE_URL);

  const handleLoadPreview = (field: string, path: string) => {
    if (docPreviewUrls[field]) return;

    const documentUrl = getDocumentUrl(path);
    if (documentUrl) {
      setDocPreviewUrls((prev) => ({ ...prev, [field]: documentUrl }));
    }
  };

  const handleOpenDocument = (path: string | undefined) => {
    if (!path) {
      toastError("Tài liệu chưa được tải lên.");
      return;
    }

    const documentUrl = getDocumentUrl(path);
    if (!documentUrl) {
      toastError("Không thể mở tài liệu.");
      return;
    }

    window.open(documentUrl, "_blank");
  };

  // Autoload image previews on Step 3 mount
  useEffect(() => {
    if (activeStep === 3 && partnerInfo) {
      if (partnerInfo.business_license && !isPdfFile(partnerInfo.business_license)) {
        handleLoadPreview("business_license", partnerInfo.business_license);
      }
      if (partnerInfo.ownership_document && !isPdfFile(partnerInfo.ownership_document)) {
        handleLoadPreview("ownership_document", partnerInfo.ownership_document);
      }
      if (partnerInfo.id_card_front) {
        handleLoadPreview("id_card_front", partnerInfo.id_card_front);
      }
      if (partnerInfo.id_card_back) {
        handleLoadPreview("id_card_back", partnerInfo.id_card_back);
      }
      if (partnerInfo.bank_statement_image) {
        handleLoadPreview("bank_statement", partnerInfo.bank_statement_image);
      }
    }
  }, [activeStep, partnerInfo]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(docPreviewUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [docPreviewUrls]);

  // Local previews for newly selected files
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    const urls: Record<string, string> = {};
    if (idFront) urls.idFront = URL.createObjectURL(idFront);
    if (idBack) urls.idBack = URL.createObjectURL(idBack);
    if (businessLicense && businessLicense.type !== "application/pdf") {
      urls.businessLicense = URL.createObjectURL(businessLicense);
    }
    if (ownershipDoc && ownershipDoc.type !== "application/pdf") {
      urls.ownershipDoc = URL.createObjectURL(ownershipDoc);
    }
    if (bankStatement) urls.bankStatement = URL.createObjectURL(bankStatement);

    setLocalPreviews(urls);

    return () => {
      Object.values(urls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [idFront, idBack, businessLicense, ownershipDoc, bankStatement]);

  const methods = useForm({
    defaultValues: {
      company_name: partnerInfo?.company_name || "",
      tax_code: partnerInfo?.tax_code || "",
      representative_name: partnerInfo?.representative_name || user?.name || "",
      province_id: Number(partnerInfo?.province_id || 0),
      ward_id: Number(partnerInfo?.ward_id || 0),
      address: partnerInfo?.address || "",
      phone: partnerInfo?.phone || user?.phone || "",
      website: partnerInfo?.website || "",
      description: partnerInfo?.description || "",
      bank_name: partnerInfo?.bank_name || "",
      bank_account_number: partnerInfo?.bank_account_number || "",
      bank_account_holder: partnerInfo?.bank_account_holder || "",
    }
  });

  const { register, watch, setValue, handleSubmit, formState: { errors } } = methods;

  const provinceId = watch("province_id");
  const { data: provincesData, isLoading: isLoadingProvinces } = useGetAllProvincesTypes();
  const { data: wardsData, isLoading: isLoadingWards } = useGetWardsByProvinceId(Number(provinceId));

  const [showWard, setShowWard] = useState<boolean>(false);

  useEffect(() => {
    if (provinceId && provinceId > 0) {
      setShowWard(true);
    } else {
      setShowWard(false);
      setValue("ward_id", 0);
    }
  }, [provinceId, setValue]);

  // Canvas Signature pad interactions
  useEffect(() => {
    if (activeStep === 4 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [activeStep]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureDataUrl(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const dataUrl = canvas.toDataURL("image/png");
    setSignatureDataUrl(dataUrl);
    toastSuccess("Đã lưu chữ ký điện tử!");
  };

  // Submit Step 3 (Verification / Banking)
  const onSubmitStep3 = async (values: any) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("partner_type", partnerType);
      
      Object.keys(values).forEach(key => {
        formData.append(key, values[key] || "");
      });

      if (idFront) formData.append("id_card_front_file", idFront);
      if (idBack) formData.append("id_card_back_file", idBack);
      if (businessLicense) formData.append("business_license_file", businessLicense);
      if (ownershipDoc) formData.append("ownership_document_file", ownershipDoc);
      if (bankStatement) formData.append("bank_statement_image_file", bankStatement);

      const endpoint = userStatus === 4 ? "partner/auth/resubmit-onboarding" : "partner/auth/submit-onboarding";
      const response: any = await axiosClient.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.status === "success") {
        toastSuccess(response.message || "Cập nhật thông tin hồ sơ thành công!");
        if (userStatus === 4) {
          queryClient.invalidateQueries({ queryKey: ["profile"] });
        } else {
          setActiveStep(4);
        }
      } else {
        toastError(response.message || "Nộp hồ sơ thất bại.");
      }
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Lỗi kết nối máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Step 4 (E-Contract / Sign)
  const onSubmitStep4 = async () => {
    if (!signatureDataUrl) {
      toastError("Vui lòng ký tên và nhấn 'Lưu chữ ký' trước khi xác nhận hợp đồng.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response: any = await axiosClient.post("partner/auth/sign-contract", {
        signature_base64: signatureDataUrl
      });

      if (response.status === "success") {
        toastSuccess(response.message || "Ký hợp đồng và hoàn tất đăng ký thành công!");
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      } else {
        toastError(response.message || "Ký hợp đồng thất bại.");
      }
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Lỗi kết nối máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Re-enter edit wizard if rejected
  const handleReEnterEdit = () => {
    setActiveStep(3);
    setShowEditWizard(true);
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post("partner/auth/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/partner/login";
    } catch (_err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/partner/login";
    }
  };

  // Watch values for real-time contract generation
  const formValues = watch();

  // If user status is PENDING_APPROVAL (3), show review pending screen
  if (userStatus === 3) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#0b0f19] p-6 text-white overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute left-[-15%] top-[-15%] size-[60%] animate-pulse rounded-full bg-blue-600/10 blur-[130px]"></div>
        <div className="absolute bottom-[-15%] right-[-15%] size-[60%] animate-pulse rounded-full bg-cyan-600/10 blur-[130px]"></div>

        <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/5 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur-2xl md:p-12">
          {/* Pulsing Outer Glow Wrapper */}
          <div className="mx-auto mb-8 flex size-28 items-center justify-center rounded-full bg-blue-500/10">
            <div className="flex size-20 animate-pulse items-center justify-center rounded-full bg-blue-500/20">
              <Clock className="size-10 text-blue-400" />
            </div>
          </div>

          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/20">
            Chờ Quản Trị Viên Duyệt
          </span>

          <h1 className="mb-4 text-3xl font-extrabold tracking-tight">Hồ Sơ Đang Được Thẩm Định!</h1>
          <p className="mx-auto mb-8 max-w-md text-sm font-medium leading-relaxed text-slate-400">
            Hệ thống BKS System đã tiếp nhận đầy đủ thông tin pháp lý, chi tiết tài khoản ngân hàng đối soát và hợp đồng ký kết điện tử của bạn.
          </p>

          <div className="mb-8 rounded-2xl bg-white/[0.02] border border-white/5 p-6 text-left space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tiến trình xác minh hồ sơ</h3>
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-500" />
                <span className="text-sm font-semibold text-slate-300">Xác thực tài khoản & Email</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-500" />
                <span className="text-sm font-semibold text-slate-300">Tải hồ sơ năng lực & GPKD</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-500" />
                <span className="text-sm font-semibold text-slate-300">Ký hợp đồng dịch vụ số (E-Contract)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-5 items-center justify-center rounded-full border border-blue-500/50">
                  <div className="size-2 rounded-full bg-blue-500 animate-ping"></div>
                </div>
                <span className="text-sm font-bold text-blue-400">Ban quản trị BKS phê duyệt liên kết</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["profile"] })}
              className="h-12 rounded-xl bg-blue-600 px-8 font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
            >
              <RefreshCw className="mr-2 size-4 animate-spin-slow" />
              Tải lại trang kiểm tra
            </Button>
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="h-12 rounded-xl border-white/5 bg-white/[0.02] px-8 font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If user status is REJECTED (4) AND partner has NOT clicked "Edit & Resubmit", show rejection info page
  if (userStatus === 4 && !showEditWizard) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#090b11] p-6 text-white overflow-hidden">
        <div className="absolute left-[-15%] top-[-15%] size-[60%] animate-pulse rounded-full bg-rose-600/10 blur-[130px]"></div>
        <div className="absolute bottom-[-15%] right-[-15%] size-[60%] animate-pulse rounded-full bg-orange-600/10 blur-[130px]"></div>

        <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-rose-500/20 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur-2xl md:p-12">
          <div className="mx-auto mb-8 flex size-24 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
            <AlertCircle className="size-12 text-rose-500 animate-bounce" />
          </div>

          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-rose-400 border border-rose-500/20">
            Hồ sơ bị từ chối
          </span>

          <h1 className="mb-4 text-3xl font-black tracking-tight text-white">Phê Duyệt Liên Kết Thất Bại</h1>
          <p className="mx-auto mb-6 max-w-md text-sm font-medium text-slate-400 leading-relaxed">
            Hồ sơ năng lực hoặc giấy chứng nhận quyền sở hữu chỗ nghỉ của bạn chưa đầy đủ hoặc không hợp lệ theo quy chế xét duyệt của BKS.
          </p>

          <div className="mb-8 rounded-2xl border border-rose-500/25 bg-rose-500/[0.02] p-6 text-left">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-rose-400">Lý do từ chối phản hồi:</h3>
            <p className="text-sm font-bold leading-relaxed text-slate-300">
              {partnerInfo?.rejection_reason || "Giấy chứng nhận đăng ký doanh nghiệp bị mờ, không khớp mã số thuế doanh nghiệp. Vui lòng chụp/quét bản gốc rõ nét và tải lại để xét duyệt."}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button 
              onClick={handleReEnterEdit}
              className="h-12 rounded-xl bg-rose-600 px-8 font-bold text-white hover:bg-rose-500 transition-all shadow-lg shadow-rose-500/20"
            >
              <RotateCcw className="mr-2 size-4" />
              Chỉnh sửa & Nộp lại
            </Button>
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="h-12 rounded-xl border-white/5 bg-white/[0.02] px-8 font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0b0f19] py-12 px-4 text-white overflow-x-hidden md:px-8">
      {/* Background Orbs */}
      <div className="absolute left-[-10%] top-[-10%] size-2/5 animate-pulse rounded-full bg-blue-600/10 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] size-2/5 animate-pulse rounded-full bg-indigo-600/10 blur-[120px]" style={{ animationDelay: '2.5s' }}></div>

      <div className="relative z-10 w-full max-w-5xl">
        
        {/* Wizard Header Bar */}
        <div className="mb-10 flex flex-col items-center justify-between border-b border-white/5 pb-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/30">
              <Building2 className="size-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Cổng Liên Kết Đối Tác</h1>
              <p className="text-xs font-medium text-slate-500">Hoàn tất 4 bước thiết lập để kích hoạt đại lý</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="mt-4 text-xs font-bold text-slate-500 hover:text-white hover:bg-white/5 sm:mt-0"
          >
            Đăng xuất tài khoản
          </Button>
        </div>

        {/* Dynamic Multi-Step Navigator */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[
            { step: 1, title: "Xác thực email", desc: "Tài khoản & Email", completed: true },
            { step: 2, title: "Loại hình dịch vụ", desc: "Khách sạn, Homestay...", completed: activeStep > 2 },
            { step: 3, title: "Hồ sơ pháp lý", desc: "GPKD & Ngân hàng", completed: activeStep > 3 },
            { step: 4, title: "Ký kết hợp đồng", desc: "E-Contract & Chữ ký", completed: activeStep > 4 }
          ].map((item) => (
            <div 
              key={item.step} 
              className={`relative flex items-start gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                activeStep === item.step 
                  ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/5" 
                  : item.completed 
                    ? "border-emerald-500/30 bg-emerald-500/[0.02]" 
                    : "border-white/5 bg-white/[0.01]"
              }`}
            >
              <div className={`flex size-8 items-center justify-center rounded-xl font-bold text-sm ${
                item.completed
                  ? "bg-emerald-500 text-white"
                  : activeStep === item.step
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-500"
              }`}>
                {item.completed ? <CheckCircle2 className="size-5" /> : item.step}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bước 0{item.step}</p>
                <h4 className={`text-sm font-bold ${activeStep === item.step ? "text-blue-400" : item.completed ? "text-slate-300" : "text-slate-400"}`}>{item.title}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Step 2: Property Type Selector */}
        {activeStep === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 border border-blue-500/20">
                Lựa chọn loại hình dịch vụ chính của bạn
              </span>
              <h2 className="text-2xl font-black md:text-3xl text-white">Bạn đang vận hành cơ sở lưu trú nào?</h2>
              <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-400">
                BKS Stay tối ưu hóa quy trình quản lý phòng dựa trên phân loại hình thức chỗ nghỉ mà bạn thiết lập.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { id: "hotel", name: "Khách sạn", icon: Building, desc: "Cơ sở lưu trú lớn, buồng phòng chuyên nghiệp, có lễ tân phục vụ." },
                { id: "guesthouse", name: "Nhà nghỉ", icon: Home, desc: "Quy mô lưu trú vừa và nhỏ, quy trình check-in đơn giản, chi phí tối ưu." },
                { id: "apartment", name: "Căn hộ / Căn hộ dịch vụ", icon: Building2, desc: "Căn hộ chung cư hoặc căn hộ dịch vụ vận hành theo nhu cầu thuê ngắn và trung hạn." },
                { id: "homestay", name: "Homestay chia phòng", icon: Home, desc: "Lưu trú gia đình, trải nghiệm bản địa, phân chia quản lý theo phòng." }
              ].map((card) => {
                const IconComponent = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => setPartnerType(card.id)}
                    className={`group relative flex flex-col text-left rounded-3xl border p-6 transition-all duration-300 ${
                      partnerType === card.id
                        ? "border-blue-500 bg-blue-500/[0.04] shadow-2xl scale-[1.02]"
                        : "border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className={`mb-5 flex size-12 items-center justify-center rounded-2xl border transition-all ${
                      partnerType === card.id
                        ? "bg-blue-600 border-blue-400 text-white"
                        : "bg-slate-800 border-white/5 text-slate-400 group-hover:border-white/10 group-hover:text-white"
                    }`}>
                      <IconComponent className="size-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-white transition-colors">{card.name}</h3>
                    <p className="text-xs font-semibold text-slate-400 leading-relaxed group-hover:text-slate-300">{card.desc}</p>
                    
                    {partnerType === card.id && (
                      <div className="absolute right-4 top-4 flex size-5 items-center justify-center rounded-full bg-blue-500">
                        <CheckCircle2 className="size-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end border-t border-white/5 pt-8">
              <Button 
                onClick={() => setActiveStep(3)}
                className="h-12 rounded-xl bg-blue-600 px-8 font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
              >
                Tiếp tục thiết lập hồ sơ
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Verification & Banking Details */}
        {activeStep === 3 && (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmitStep3)} className="space-y-8 animate-fade-in">

              {/* ── Rejection reason banner (only when re-editing after rejection) ── */}
              {showEditWizard && partnerInfo?.rejection_reason && (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-500/[0.06] p-5 flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/30">
                    <AlertCircle className="size-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-rose-400 mb-1">Lý do từ chối hồ sơ lần trước</p>
                    <p className="text-sm font-bold text-slate-200 leading-relaxed">"{partnerInfo.rejection_reason}"</p>
                    <p className="mt-2 text-[11px] font-semibold text-slate-400">
                      ⚠ Vui lòng đọc kỹ lý do trên, chỉnh sửa đúng tài liệu bị yêu cầu và nhấn <span className="text-white font-black">Nộp lại hồ sơ</span>.
                    </p>
                  </div>
                </div>
              )}

              <div className="relative z-10 rounded-3xl border border-white/5 bg-slate-900/40 p-6 md:p-8 backdrop-blur-md">
                <div className="mb-8 border-b border-white/5 pb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="size-5 text-blue-400" />
                    Thông Tin Doanh Nghiệp & Hồ Sơ Pháp Lý
                  </h2>
                  <p className="text-xs font-medium text-slate-400">Các hồ sơ pháp lý bắt buộc phục vụ đối soát thanh toán tự động</p>
                </div>


                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="company_name" className="text-xs font-bold uppercase tracking-wider text-slate-400">Tên doanh nghiệp / Hộ kinh doanh</label>
                    <Input 
                      id="company_name"
                      placeholder="Nhập tên đăng ký doanh nghiệp"
                      className="h-12 rounded-xl border-white/5 bg-white/[0.02] text-white focus:border-blue-500/50"
                      {...register("company_name", { required: true })}
                    />
                    {errors.company_name && <span className="text-xs text-rose-400">Trường này là bắt buộc.</span>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="tax_code" className="text-xs font-bold uppercase tracking-wider text-slate-400">Mã số thuế doanh nghiệp</label>
                    <Input 
                      id="tax_code"
                      placeholder="Mã số thuế doanh nghiệp"
                      className="h-12 rounded-xl border-white/5 bg-white/[0.02] text-white focus:border-blue-500/50"
                      {...register("tax_code", { required: true })}
                    />
                    {errors.tax_code && <span className="text-xs text-rose-400">Trường này là bắt buộc.</span>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="representative_name" className="text-xs font-bold uppercase tracking-wider text-slate-400">Người đại diện pháp luật</label>
                    <Input 
                      id="representative_name"
                      placeholder="Họ và tên người đại diện pháp luật"
                      className="h-12 rounded-xl border-white/5 bg-white/[0.02] text-white focus:border-blue-500/50"
                      {...register("representative_name", { required: true })}
                    />
                    {errors.representative_name && <span className="text-xs text-rose-400">Trường này là bắt buộc.</span>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-400">Số điện thoại liên hệ</label>
                    <Input 
                      id="phone"
                      placeholder="Số điện thoại di động"
                      className="h-12 rounded-xl border-white/5 bg-white/[0.02] text-white focus:border-blue-500/50"
                      {...register("phone", { required: true })}
                    />
                    {errors.phone && <span className="text-xs text-rose-400">Trường này là bắt buộc.</span>}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Tỉnh / Thành phố</span>
                    <SearchableSelect
                      value={provinceId?.toString() || ""}
                      onValueChange={(value) => setValue("province_id", Number(value))}
                      options={provincesData?.data?.map((p: ProvinceTypes) => ({
                        value: p.id.toString(),
                        label: p.name,
                      })) || []}
                      placeholder="Chọn Tỉnh/Thành"
                      disabled={isLoadingProvinces}
                      icon={<MapPin className="size-4 text-slate-500" />}
                      showSearch={true}
                      triggerClassName="h-12 bg-white/[0.02] border-white/5 text-white rounded-xl"
                    />
                  </div>

                  {showWard && (
                    <div className="space-y-2">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Phường / Xã</span>
                      <SearchableSelect
                        value={watch("ward_id")?.toString() || ""}
                        onValueChange={(value) => setValue("ward_id", Number(value))}
                        options={wardsData?.data?.map((w: Ward) => ({
                          value: w.id.toString(),
                          label: w.name,
                        })) || []}
                        placeholder="Chọn Phường/Xã"
                        disabled={isLoadingWards}
                        icon={<MapPin className="size-4 text-slate-500" />}
                        showSearch={true}
                        triggerClassName="h-12 bg-white/[0.02] border-white/5 text-white rounded-xl"
                      />
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-slate-400">Địa chỉ chi tiết (Đường/Số nhà)</label>
                    <Input 
                      id="address"
                      placeholder="Địa chỉ số nhà, ngõ/ngách"
                      className="h-12 rounded-xl border-white/5 bg-white/[0.02] text-white"
                      {...register("address", { required: true })}
                    />
                  </div>
                </div>
              </div>

              {/* Secure Document Upload Zone */}
              <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 md:p-8 backdrop-blur-md">
                <div className="mb-6 border-b border-white/5 pb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <UploadCloud className="size-5 text-blue-400" />
                    Tải Tài Liệu Năng Lực & Minh Bạch
                  </h2>
                  <p className="text-xs font-medium text-slate-400">Chúng tôi lưu trữ các tài liệu này trên Private Disk nội bộ hoàn toàn bảo mật.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  
                  {/* GPKD */}
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between items-center text-center min-h-[220px]">
                    <div className="w-full">
                      <UploadCloud className="mx-auto mb-2 size-8 text-slate-500" />
                      <h4 className="text-sm font-bold mb-1">Giấy Phép Đăng Ký Kinh Doanh *</h4>
                      <p className="text-[10px] font-semibold text-slate-500 mb-2">Mimetype PDF hoặc ảnh (PNG, JPEG), tối đa 5MB</p>
                      
                      {partnerInfo?.business_license && !businessLicense && (
                        <div className="mb-3 flex flex-col items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-[9px] font-bold text-amber-400">
                            <FileCheck className="size-3" /> Đã nộp trước đó
                          </div>
                          {isPdfFile(partnerInfo.business_license) ? (
                            <button
                              type="button"
                              onClick={() => handleOpenDocument(partnerInfo.business_license)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                            >
                              <FileText className="size-3.5" /> Xem bản PDF đã nộp
                            </button>
                          ) : (
                            <div className="relative group w-24 h-16 rounded overflow-hidden border border-white/10 bg-slate-950/40">
                              {docPreviewUrls["business_license"] ? (
                                <img 
                                  src={docPreviewUrls["business_license"]} 
                                  alt="GPKD đã nộp" 
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all"
                                  onClick={() => handleOpenDocument(partnerInfo.business_license)}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-[9px] text-slate-500">Xem ảnh đã nộp</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full mt-auto">
                      <input 
                        type="file" 
                        id="gpkd-file" 
                        accept="image/*,application/pdf"
                        onChange={(e) => setBusinessLicense(e.target.files?.[0] || null)}
                        className="hidden" 
                      />
                      <label 
                        htmlFor="gpkd-file"
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold px-4 cursor-pointer transition-all border border-white/5"
                      >
                        {businessLicense ? "Thay đổi tài liệu" : partnerInfo?.business_license ? "Chọn tài liệu thay thế" : "Chọn tài liệu tệp"}
                      </label>
                      {businessLicense && (
                        <div className="mt-3 flex flex-col items-center gap-2">
                          {businessLicense.type !== "application/pdf" && localPreviews.businessLicense && (
                            <div className="relative group w-24 h-16 rounded overflow-hidden border border-emerald-500/30 bg-slate-950/40">
                              <img 
                                src={localPreviews.businessLicense} 
                                alt="GPKD mới" 
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all"
                                onClick={() => window.open(localPreviews.businessLicense, "_blank")}
                              />
                            </div>
                          )}
                          <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                            <FileCheck className="size-4" />
                            {businessLicense.name} ({Math.round(businessLicense.size / 1024)} KB)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quyền sở hữu chỗ nghỉ */}
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between items-center text-center min-h-[220px]">
                    <div className="w-full">
                      <UploadCloud className="mx-auto mb-2 size-8 text-slate-500" />
                      <h4 className="text-sm font-bold mb-1">Quyền sở hữu / Hợp đồng thuê chỗ nghỉ *</h4>
                      <p className="text-[10px] font-semibold text-slate-500 mb-2">Xác thực pháp lý khai thác phòng nghỉ</p>
                      
                      {partnerInfo?.ownership_document && !ownershipDoc && (
                        <div className="mb-3 flex flex-col items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-[9px] font-bold text-amber-400">
                            <FileCheck className="size-3" /> Đã nộp trước đó
                          </div>
                          {isPdfFile(partnerInfo.ownership_document) ? (
                            <button
                              type="button"
                              onClick={() => handleOpenDocument(partnerInfo.ownership_document)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                            >
                              <FileText className="size-3.5" /> Xem bản PDF đã nộp
                            </button>
                          ) : (
                            <div className="relative group w-24 h-16 rounded overflow-hidden border border-white/10 bg-slate-950/40">
                              {docPreviewUrls["ownership_document"] ? (
                                <img 
                                  src={docPreviewUrls["ownership_document"]} 
                                  alt="Quyền sở hữu đã nộp" 
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all"
                                  onClick={() => handleOpenDocument(partnerInfo.ownership_document)}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-[9px] text-slate-500">Xem ảnh đã nộp</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full mt-auto">
                      <input 
                        type="file" 
                        id="ownership-file" 
                        accept="image/*,application/pdf"
                        onChange={(e) => setOwnershipDoc(e.target.files?.[0] || null)}
                        className="hidden" 
                      />
                      <label 
                        htmlFor="ownership-file"
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold px-4 cursor-pointer transition-all border border-white/5"
                      >
                        {ownershipDoc ? "Thay đổi tài liệu" : partnerInfo?.ownership_document ? "Chọn tài liệu thay thế" : "Chọn tài liệu tệp"}
                      </label>
                      {ownershipDoc && (
                        <div className="mt-3 flex flex-col items-center gap-2">
                          {ownershipDoc.type !== "application/pdf" && localPreviews.ownershipDoc && (
                            <div className="relative group w-24 h-16 rounded overflow-hidden border border-emerald-500/30 bg-slate-950/40">
                              <img 
                                src={localPreviews.ownershipDoc} 
                                alt="Quyền sở hữu mới" 
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all"
                                onClick={() => window.open(localPreviews.ownershipDoc, "_blank")}
                              />
                            </div>
                          )}
                          <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                            <FileCheck className="size-4" />
                            {ownershipDoc.name} ({Math.round(ownershipDoc.size / 1024)} KB)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CCCD Front */}
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between items-center text-center min-h-[220px]">
                    <div className="w-full">
                      <UploadCloud className="mx-auto mb-2 size-8 text-slate-500" />
                      <h4 className="text-sm font-bold mb-1">Mặt trước CCCD / Hộ chiếu *</h4>
                      <p className="text-[10px] font-semibold text-slate-500 mb-2">Người đại diện pháp lý</p>
                      
                      {partnerInfo?.id_card_front && !idFront && (
                        <div className="mb-3 flex flex-col items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-[9px] font-bold text-amber-400">
                            <FileCheck className="size-3" /> Đã nộp trước đó
                          </div>
                          <div className="relative group w-24 h-16 rounded overflow-hidden border border-white/10 bg-slate-950/40">
                            {docPreviewUrls["id_card_front"] ? (
                              <img 
                                src={docPreviewUrls["id_card_front"]} 
                                alt="CCCD mặt trước" 
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all"
                                onClick={() => handleOpenDocument(partnerInfo.id_card_front)}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[9px] text-slate-500">Xem ảnh đã nộp</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full mt-auto">
                      <input 
                        type="file" 
                        id="cccd-front" 
                        accept="image/*"
                        onChange={(e) => setIdFront(e.target.files?.[0] || null)}
                        className="hidden" 
                      />
                      <label 
                        htmlFor="cccd-front"
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold px-4 cursor-pointer transition-all border border-white/5"
                      >
                        {idFront ? "Thay đổi ảnh" : partnerInfo?.id_card_front ? "Chọn ảnh thay thế" : "Chọn tệp ảnh"}
                      </label>
                      {idFront && (
                        <div className="mt-3 flex flex-col items-center gap-2">
                          {localPreviews.idFront && (
                            <div className="relative group w-24 h-16 rounded overflow-hidden border border-emerald-500/30 bg-slate-950/40">
                              <img 
                                src={localPreviews.idFront} 
                                alt="CCCD mặt trước mới" 
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all"
                                onClick={() => window.open(localPreviews.idFront, "_blank")}
                              />
                            </div>
                          )}
                          <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                            <FileCheck className="size-4" />
                            {idFront.name} ({Math.round(idFront.size / 1024)} KB)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CCCD Back */}
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between items-center text-center min-h-[220px]">
                    <div className="w-full">
                      <UploadCloud className="mx-auto mb-2 size-8 text-slate-500" />
                      <h4 className="text-sm font-bold mb-1">Mặt sau CCCD / Hộ chiếu *</h4>
                      <p className="text-[10px] font-semibold text-slate-500 mb-2">Người đại diện pháp lý</p>
                      
                      {partnerInfo?.id_card_back && !idBack && (
                        <div className="mb-3 flex flex-col items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-[9px] font-bold text-amber-400">
                            <FileCheck className="size-3" /> Đã nộp trước đó
                          </div>
                          <div className="relative group w-24 h-16 rounded overflow-hidden border border-white/10 bg-slate-950/40">
                            {docPreviewUrls["id_card_back"] ? (
                              <img 
                                src={docPreviewUrls["id_card_back"]} 
                                alt="CCCD mặt sau" 
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all"
                                onClick={() => handleOpenDocument(partnerInfo.id_card_back)}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[9px] text-slate-500">Xem ảnh đã nộp</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full mt-auto">
                      <input 
                        type="file" 
                        id="cccd-back" 
                        accept="image/*"
                        onChange={(e) => setIdBack(e.target.files?.[0] || null)}
                        className="hidden" 
                      />
                      <label 
                        htmlFor="cccd-back"
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold px-4 cursor-pointer transition-all border border-white/5"
                      >
                        {idBack ? "Thay đổi ảnh" : partnerInfo?.id_card_back ? "Chọn ảnh thay thế" : "Chọn tệp ảnh"}
                      </label>
                      {idBack && (
                        <div className="mt-3 flex flex-col items-center gap-2">
                          {localPreviews.idBack && (
                            <div className="relative group w-24 h-16 rounded overflow-hidden border border-emerald-500/30 bg-slate-950/40">
                              <img 
                                src={localPreviews.idBack} 
                                alt="CCCD mặt sau mới" 
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all"
                                onClick={() => window.open(localPreviews.idBack, "_blank")}
                              />
                            </div>
                          )}
                          <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                            <FileCheck className="size-4" />
                            {idBack.name} ({Math.round(idBack.size / 1024)} KB)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Bank accounts section */}
              <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 md:p-8 backdrop-blur-md">
                <div className="mb-8 border-b border-white/5 pb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <CreditCard className="size-5 text-blue-400" />
                    Tài Khoản Ngân Hàng Đối Soát
                  </h2>
                  <p className="text-xs font-medium text-slate-400">Doanh thu thu hộ phòng của khách hàng sẽ được quyết toán định kỳ vào tài khoản này.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <label htmlFor="bank_name" className="text-xs font-bold uppercase tracking-wider text-slate-400">Tên ngân hàng thụ hưởng</label>
                    <Input 
                      id="bank_name"
                      placeholder="Vietcombank, Techcombank..."
                      className="h-12 rounded-xl border-white/5 bg-white/[0.02] text-white"
                      {...register("bank_name", { required: true })}
                    />
                    {errors.bank_name && <span className="text-xs text-rose-400">Yêu cầu nhập tên ngân hàng.</span>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bank_account_number" className="text-xs font-bold uppercase tracking-wider text-slate-400">Số tài khoản ngân hàng</label>
                    <Input 
                      id="bank_account_number"
                      placeholder="Số tài khoản ngân hàng nhận tiền"
                      className="h-12 rounded-xl border-white/5 bg-white/[0.02] text-white"
                      {...register("bank_account_number", { required: true })}
                    />
                    {errors.bank_account_number && <span className="text-xs text-rose-400">Số tài khoản ngân hàng thụ hưởng bắt buộc.</span>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bank_account_holder" className="text-xs font-bold uppercase tracking-wider text-slate-400">Tên chủ tài khoản thụ hưởng</label>
                    <Input 
                      id="bank_account_holder"
                      placeholder="VIET PHONG NGUYEN"
                      className="h-12 rounded-xl border-white/5 bg-white/[0.02] text-white"
                      {...register("bank_account_holder", { required: true })}
                    />
                    {errors.bank_account_holder && <span className="text-xs text-rose-400">Tên chủ tài khoản thụ hưởng bắt buộc.</span>}
                  </div>
                </div>

                <div className="mt-8 border-t border-white/5 pt-8">
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between items-center text-center min-h-[220px]">
                    <div className="w-full">
                      <UploadCloud className="mx-auto mb-2 size-8 text-slate-500" />
                      <h4 className="text-sm font-bold mb-1">Ảnh xác minh tài khoản thụ hưởng</h4>
                      <p className="text-[10px] font-semibold text-slate-500 mb-1">Tải sao kê ngân hàng hoặc ảnh mã QR VietQR (chọn một trong hai).</p>
                      <p className="text-[10px] font-medium text-slate-500 mb-2">Thông tin trong ảnh phải trùng với tài khoản đã nhập phía trên để admin duyệt đối soát.</p>
                      
                      {partnerInfo?.bank_statement_image && !bankStatement && (
                        <div className="mb-3 flex flex-col items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-[9px] font-bold text-amber-400">
                            <FileCheck className="size-3" /> Đã nộp trước đó
                          </div>
                          <div className="relative group w-24 h-16 rounded overflow-hidden border border-white/10 bg-slate-950/40">
                            {docPreviewUrls["bank_statement"] ? (
                              <img 
                                src={docPreviewUrls["bank_statement"]} 
                                alt="Ảnh xác minh tài khoản thụ hưởng" 
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all"
                                onClick={() => handleOpenDocument(partnerInfo.bank_statement_image)}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[9px] text-slate-500">Xem ảnh đã nộp</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full mt-auto">
                      <input 
                        type="file" 
                        id="bank-stmt-file" 
                        accept="image/*"
                        onChange={(e) => setBankStatement(e.target.files?.[0] || null)}
                        className="hidden" 
                      />
                      <label 
                        htmlFor="bank-stmt-file"
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold px-4 cursor-pointer transition-all border border-white/5"
                      >
                        {bankStatement ? "Thay đổi ảnh xác minh" : partnerInfo?.bank_statement_image ? "Chọn ảnh xác minh thay thế" : "Chọn ảnh xác minh"}
                      </label>
                      {bankStatement && (
                        <div className="mt-3 flex flex-col items-center gap-2">
                          {localPreviews.bankStatement && (
                            <div className="relative group w-24 h-16 rounded overflow-hidden border border-emerald-500/30 bg-slate-950/40">
                              <img 
                                src={localPreviews.bankStatement} 
                                alt="Ảnh xác minh tài khoản mới" 
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all"
                                onClick={() => window.open(localPreviews.bankStatement, "_blank")}
                              />
                            </div>
                          )}
                          <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                            <FileCheck className="size-4" />
                            {bankStatement.name} ({Math.round(bankStatement.size / 1024)} KB)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>


              {/* Action buttons */}
              <div className={`flex ${showEditWizard ? "justify-end" : "justify-between"} border-t border-white/5 pt-8`}>
                {!showEditWizard && (
                  <Button 
                    type="button" 
                    onClick={() => setActiveStep(2)}
                    variant="outline"
                    className="h-12 rounded-xl border-white/5 bg-white/[0.02] px-6 font-bold text-slate-400 hover:bg-white/5 hover:text-white"
                  >
                    <ArrowLeft className="mr-2 size-4" />
                    Quay lại
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="h-12 rounded-xl bg-blue-600 px-8 font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting 
                    ? "Đang xử lý tải lên..." 
                    : (userStatus === 4 ? "Nộp lại hồ sơ" : "Tiếp tục ký hợp đồng")}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </form>
          </FormProvider>
        )}

        {/* Step 4: E-Contract & Signature Pad */}
        {activeStep === 4 && (
          <div className="space-y-8 animate-fade-in">
            <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 md:p-8 backdrop-blur-md">
              <div className="mb-6 border-b border-white/5 pb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileSignature className="size-5 text-blue-400" />
                  Hợp Đồng Nguyên Tắc Cung Cấp Dịch Vụ Du Lịch Số
                </h2>
                <p className="text-xs font-medium text-slate-400">Vui lòng đọc kỹ hợp đồng và ký xác nhận ở khung chữ ký số bên dưới.</p>
              </div>

              {/* Virtual Contract Display Panel */}
              <div className="hide-scrollbar h-96 overflow-y-auto rounded-2xl bg-[#090c15] border border-white/5 p-6 md:p-8 font-serif text-sm leading-relaxed text-slate-300">
                <div className="text-center font-bold mb-6">
                  <h3 className="text-base uppercase text-white font-extrabold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                  <h4 className="text-xs border-b border-white/10 pb-4 max-w-xs mx-auto">Độc lập - Tự do - Hạnh phúc</h4>
                  <h2 className="text-lg text-white font-black mt-6 uppercase leading-tight">HỢP ĐỒNG NGUYÊN TẮC LIÊN KẾT CƠ SỞ LƯU TRÚ</h2>
                  <p className="text-xs italic text-slate-500 mt-2">Số: BKS-{user?.id || "P001"}-2026/HDNT</p>
                </div>

                <p className="mb-4">Hôm nay, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm 2026, tại trụ sở BKS Stay, chúng tôi gồm các bên:</p>
                
                <h4 className="font-bold text-white mb-2">BÊN A: CÔNG TY CỔ PHẦN CÔNG NGHỆ & DU LỊCH BKS STAY (BKS STAY)</h4>
                <ul className="list-none pl-4 space-y-1 mb-4 text-xs font-sans">
                  <li>- Đại diện pháp luật: Hồ Minh Ngọc - Chức vụ: Giám đốc điều hành</li>
                  <li>- Địa chỉ: Tòa nhà BKS, 15 Quang Trung, Hải Châu, Đà Nẵng, Việt Nam</li>
                  <li>- Hotline: 0333494850</li>
                </ul>

                <h4 className="font-bold text-white mb-2">BÊN B: ĐỐI TÁC THÀNH VIÊN LIÊN KẾT</h4>
                <ul className="list-none pl-4 space-y-1 mb-4 text-xs font-sans">
                  <li>- Doanh nghiệp/Thương hiệu: <strong className="text-blue-400">{formValues.company_name || partnerInfo?.company_name || "[Tên Doanh nghiệp của Bạn]"}</strong></li>
                  <li>- Đại diện: <strong className="text-blue-400">{formValues.representative_name || partnerInfo?.representative_name || "[Họ tên Đại diện]"}</strong></li>
                  <li>- Mã số thuế: <strong className="text-blue-400">{formValues.tax_code || partnerInfo?.tax_code || "[Mã số thuế]"}</strong></li>
                  <li>- Số điện thoại đăng ký: <strong className="text-blue-400">{formValues.phone || user?.phone || "[Số điện thoại]"}</strong></li>
                  <li>- Loại hình vận hành: <strong className="text-blue-400">{partnerType.toUpperCase()}</strong></li>
                  <li>- Địa chỉ cơ sở vận hành: <strong className="text-blue-400">{formValues.address || partnerInfo?.address || "[Địa chỉ cơ sở]"}</strong></li>
                </ul>

                <p className="mb-4 font-bold text-white">ĐIỀU 1: PHẠM VI HỢP TÁC LIÊN KẾT</p>
                <p className="mb-4 text-xs font-sans">Bên B đồng ý liên kết bán phòng và dịch vụ trên nền tảng BKS Stay. Bên B có trách nhiệm nộp phí dịch vụ nền tảng (phí hoa hồng) cố định là 5% tính trên tổng giá trị (GMV) phòng và dịch vụ phát sinh từ các đơn đặt phòng thành công thực tế.</p>

                <p className="mb-4 font-bold text-white">ĐIỀU 2: PHƯƠNG THỨC THANH TOÁN VÀ ĐỐI SOÁT DOANH THU</p>
                <p className="mb-4 text-xs font-sans">Khoản phí dịch vụ nền tảng 5% sẽ được Bên A tổng hợp, đối soát công nợ định kỳ vào ngày 05 và ngày 20 hàng tháng. Bên B có trách nhiệm thanh toán số tiền nợ phí dịch vụ (Net Commission) cho Bên A trong vòng 5 ngày làm việc kể từ ngày phát hành bảng kê đối soát.</p>
                <ul className="list-none pl-4 space-y-1 mb-4 text-xs font-sans">
                  <li>- Ngân hàng thụ hưởng đối soát của Bên B: <strong className="text-cyan-400">{formValues.bank_name || partnerInfo?.bank_name || "[Tên Ngân hàng]"}</strong></li>
                  <li>- Số tài khoản ngân hàng Bên B: <strong className="text-cyan-400">{formValues.bank_account_number || partnerInfo?.bank_account_number || "[Số tài khoản]"}</strong></li>
                  <li>- Chủ tài khoản ngân hàng Bên B: <strong className="text-cyan-400">{formValues.bank_account_holder || partnerInfo?.bank_account_holder || "[Tên Chủ thẻ]"}</strong></li>
                </ul>

                <p className="mb-4 font-bold text-white">ĐIỀU 3: CHỮ KÝ ĐIỆN TỬ VÀ HIỆU LỰC HỢP ĐỒNG</p>
                <p className="mb-4 text-xs font-sans">Hợp đồng này được ký kết trực tiếp bằng chữ ký điện tử trực quan của Bên B trên thiết bị đầu cuối. Có giá trị pháp lý tương đương bản hợp đồng giấy đã ký tay theo Luật giao dịch điện tử Việt Nam hiện hành.</p>

                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5 text-center font-sans text-xs">
                  <div>
                    <h5 className="font-bold text-white">BÊN A (BKS STAY)</h5>
                    <p className="text-slate-500 italic mt-1">Đã ký điện tử thành công</p>
                    <img src="/app/images/front/bks-icon.svg" alt="BKS Stamp" className="mx-auto mt-4 size-14 opacity-50" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white">BÊN B (ĐỐI TÁC)</h5>
                    <p className="text-slate-500 italic mt-1">{signatureDataUrl ? "Đã xác nhận chữ ký" : "Chưa ký tên"}</p>
                    {signatureDataUrl && (
                      <img src={signatureDataUrl} alt="Your signature preview" className="mx-auto mt-2 h-14 object-contain bg-white rounded-lg p-1" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Draw Pad */}
            <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 md:p-8 backdrop-blur-md">
              <div className="mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <FileSignature className="size-5 text-blue-400" />
                  Vẽ chữ ký của bạn vào khung bên dưới:
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Vẽ trực tiếp bằng ngón tay của bạn (trên điện thoại/máy tính bảng) hoặc kéo giữ chuột trái (trên máy tính).</p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="relative w-full max-w-lg rounded-2xl bg-white p-2">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[200px] border border-slate-200 rounded-xl bg-slate-50 touch-none cursor-crosshair"
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-400 pointer-events-none uppercase tracking-widest">
                      Ký tên của bạn tại đây
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={clearCanvas}
                    className="h-10 rounded-xl border-slate-700 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                  >
                    <RotateCcw className="mr-2 size-4" />
                    Xóa chữ ký vẽ lại
                  </Button>
                  <Button 
                    type="button" 
                    onClick={saveSignature}
                    disabled={!hasSignature}
                    className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
                  >
                    <FileCheck className="mr-2 size-4" />
                    Lưu chữ ký điện tử
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 4 action buttons */}
            <div className="flex justify-between border-t border-white/5 pt-8">
              <Button 
                onClick={() => setActiveStep(3)}
                variant="outline"
                className="h-12 rounded-xl border-white/5 bg-white/[0.02] px-6 font-bold text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <ArrowLeft className="mr-2 size-4" />
                Quay lại sửa hồ sơ
              </Button>
              <Button 
                onClick={onSubmitStep4}
                disabled={!signatureDataUrl || isSubmitting}
                className="h-12 rounded-xl bg-emerald-600 px-8 font-bold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? "Đang nộp hồ sơ..." : "Ký kết & Gửi xét duyệt"}
                <CheckCircle2 className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
