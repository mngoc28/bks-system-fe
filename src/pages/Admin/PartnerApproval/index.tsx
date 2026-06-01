import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  ShieldCheck, FileText, CheckCircle2, XCircle, Eye, 
  ExternalLink, User, Building, CreditCard, Phone, 
  Mail, Globe, AlertCircle, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toastError, toastSuccess } from "@/components/ui/toast";
import axiosClient from "@/api/axiosClient";
import { Spinner } from "@/components/ui/spinner";

interface PendingPartner {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: number;
  created_at: string;
  partner_info?: {
    id: number;
    partner_type: string;
    company_name: string;
    tax_code: string;
    representative_name: string;
    phone: string;
    address: string;
    website: string;
    description: string;
    bank_name: string;
    bank_account_number: string;
    bank_account_holder: string;
    id_card_front: string;
    id_card_back: string;
    business_license: string;
    ownership_document: string;
    bank_statement_image: string;
    contract_pdf_path: string;
    rejection_reason?: string;
  };
}

export default function PartnerApproval() {
  const [pendingList, setPendingList] = useState<PendingPartner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPartner, setSelectedPartner] = useState<PendingPartner | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);

  // Document Blob viewing states
  const [docLoading, setDocLoading] = useState<Record<string, boolean>>({});

  const fetchPendingPartners = async () => {
    setIsLoading(true);
    try {
      const response: any = await axiosClient.get("admin/partners/pending-list");
      if (response.status === "success" && Array.isArray(response.data)) {
        setPendingList(response.data);
      } else {
        setPendingList([]);
      }
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Không thể tải danh sách đối tác chờ duyệt.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPartners();
  }, []);

  const handleOpenReview = (partner: PendingPartner) => {
    setSelectedPartner(partner);
    setIsReviewOpen(true);
    setShowRejectForm(false);
    setRejectReason("");
  };

  const handleCloseReview = () => {
    setIsReviewOpen(false);
    setSelectedPartner(null);
  };

  // Securely download/view files by fetching them as blobs with authorization headers
  const handleViewPrivateDocument = async (field: string, path: string | undefined) => {
    if (!path) {
      toastError("Tài liệu chưa được tải lên.");
      return;
    }

    setDocLoading(prev => ({ ...prev, [field]: true }));
    try {
      const response = await axiosClient.get(`documents/view`, {
        params: { path },
        responseType: "blob"
      });

      // Since axiosClient interceptor returns response.data directly,
      // 'response' is already the Blob object.
      const objectUrl = URL.createObjectURL(response as any);
      
      // Open the private document in a new tab safely
      window.open(objectUrl, "_blank");
    } catch (_err) {
      toastError("Lỗi khi tải tài liệu hoặc bạn không có quyền xem tệp này.");
    } finally {
      setDocLoading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleApprove = async () => {
    if (!selectedPartner) return;

    setIsActionLoading(true);
    try {
      const response: any = await axiosClient.post(`admin/partners/${selectedPartner.id}/verify`, {
        action: "approve"
      });

      if (response.status === "success") {
        toastSuccess(response.message || `Đã phê duyệt đối tác ${selectedPartner.name} thành công!`);
        fetchPendingPartners();
        handleCloseReview();
      } else {
        toastError(response.message || "Phê duyệt thất bại.");
      }
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Lỗi xử lý.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPartner) return;
    if (!rejectReason.trim()) {
      toastError("Vui lòng nhập lý do từ chối hồ sơ.");
      return;
    }

    setIsActionLoading(true);
    try {
      const response: any = await axiosClient.post(`admin/partners/${selectedPartner.id}/verify`, {
        action: "reject",
        rejection_reason: rejectReason
      });

      if (response.status === "success") {
        toastSuccess(response.message || `Đã từ chối phê duyệt đối tác ${selectedPartner.name}.`);
        fetchPendingPartners();
        handleCloseReview();
      } else {
        toastError(response.message || "Từ chối phê duyệt thất bại.");
      }
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Lỗi xử lý.");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-white p-6 rounded-2xl shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Phê Duyệt Hồ Sơ Đối Tác</h1>
            <p className="text-xs font-semibold text-slate-500">Thẩm định thông tin pháp lý, tài khoản đối soát và hợp đồng của đối tác lưu trú mới</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={fetchPendingPartners}
          className="h-10 gap-2 rounded-xl font-bold text-slate-700"
        >
          <RefreshCw className="size-4" />
          Làm mới
        </Button>
      </div>

      {/* Main Grid */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner size="md" />
            <span className="text-sm font-bold text-slate-500">Đang tải hồ sơ chờ duyệt...</span>
          </div>
        ) : pendingList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center p-6">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <CheckCircle2 className="size-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Tất Cả Đã Được Phê Duyệt!</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1 max-w-sm">Không còn hồ sơ đối tác nào đang trong trạng thái chờ phê duyệt.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Đối tác & Cơ sở</th>
                  <th className="py-4 px-6">Liên hệ</th>
                  <th className="py-4 px-6">Loại hình</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6">Ngày đăng ký</th>
                  <th className="py-4 px-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
                {pendingList.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-slate-900">{partner.partner_info?.company_name || partner.name}</span>
                        <span className="text-xs font-semibold text-slate-400">Đại diện: {partner.partner_info?.representative_name || partner.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> {partner.email}</span>
                        <span className="flex items-center gap-1.5 mt-1"><Phone size={12} className="text-slate-400" /> {partner.phone || partner.partner_info?.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-black text-blue-600 uppercase">
                        {partner.partner_info?.partner_type || "Hotel"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {partner.status === 4 ? (
                        <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-black text-rose-600 uppercase border border-rose-100/50">
                          Bị từ chối
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-black text-blue-600 uppercase border border-primary/10/50">
                          Chờ duyệt
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(partner.created_at).toLocaleDateString("vi-VN", {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        onClick={() => handleOpenReview(partner)}
                        className="h-9 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 px-4"
                      >
                        <Eye className="mr-1.5 size-4" />
                        Thẩm định hồ sơ
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Profile Modal overlay */}
      {isReviewOpen && selectedPartner && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh] md:p-8 animate-in fade-in zoom-in-95 duration-200 custom-modal-scrollbar">
            
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Thẩm Định Hồ Sơ Đối Tác</h2>
                  <p className="text-xs font-semibold text-slate-400">{selectedPartner.partner_info?.company_name || selectedPartner.name}</p>
                </div>
              </div>
              <button 
                onClick={handleCloseReview}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-950 transition-all"
              >
                <XCircle className="size-6" />
              </button>
            </div>

            {/* Rejection Alert Banner */}
            {selectedPartner.status === 4 && (
              <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 flex items-start gap-3">
                <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-sm font-black text-rose-700">Hồ sơ này đã bị từ chối phê duyệt</h4>
                  <p className="text-xs font-bold text-rose-600 mt-1">
                    Lý do từ chối trước đó: <span className="font-extrabold text-slate-800">"{selectedPartner.partner_info?.rejection_reason || 'Không có lý do chi tiết.'}"</span>
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1.5">
                    * Hệ thống đang chờ đối tác bổ sung/chỉnh sửa tài liệu để nộp lại. Bạn vẫn có thể cập nhật lý do từ chối hoặc phê duyệt ngay nếu cần thiết.
                  </p>
                </div>
              </div>
            )}

            {/* Modal content */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              {/* Left Column: Business details */}
              <div className="space-y-6">
                
                {/* Basic profile info card */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="size-4 text-blue-500" />
                    Hồ sơ năng lực cơ bản
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <span className="block text-slate-400">Tên doanh nghiệp</span>
                      <strong className="text-sm font-bold text-slate-900 block mt-0.5">{selectedPartner.partner_info?.company_name || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-400">Mã số thuế</span>
                      <strong className="text-sm font-bold text-slate-900 block mt-0.5">{selectedPartner.partner_info?.tax_code || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-400">Người đại diện pháp luật</span>
                      <strong className="text-sm font-bold text-slate-900 block mt-0.5">{selectedPartner.partner_info?.representative_name || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-400">Loại hình cơ sở</span>
                      <strong className="text-sm font-bold text-blue-600 block mt-0.5 uppercase">{selectedPartner.partner_info?.partner_type || "Hotel"}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-slate-400">Địa chỉ khai thác</span>
                      <strong className="text-xs font-bold text-slate-900 block mt-0.5">{selectedPartner.partner_info?.address || "N/A"}</strong>
                    </div>
                    {selectedPartner.partner_info?.website && (
                      <div className="col-span-2">
                        <span className="block text-slate-400">Trang web đại lý</span>
                        <a 
                          href={selectedPartner.partner_info.website} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Globe size={12} /> {selectedPartner.partner_info.website} <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial đối soát card */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CreditCard className="size-4 text-blue-500" />
                    Tài khoản đối soát tài chính
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <span className="block text-slate-400">Ngân hàng thụ hưởng</span>
                      <strong className="text-sm font-bold text-slate-900 block mt-0.5">{selectedPartner.partner_info?.bank_name || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-400">Số tài khoản</span>
                      <strong className="text-sm font-bold text-slate-900 block mt-0.5">{selectedPartner.partner_info?.bank_account_number || "N/A"}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-slate-400">Họ và tên chủ thẻ thụ hưởng</span>
                      <strong className="text-sm font-bold text-slate-900 block mt-0.5">{selectedPartner.partner_info?.bank_account_holder || "N/A"}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Secure document uploads and verification actions */}
              <div className="space-y-6">
                
                {/* Private Documents Verification grid */}
                <div className="rounded-2xl border border-slate-100 p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="size-4 text-blue-500" />
                    Tài liệu & Hồ sơ đính kèm (Secure Disk)
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { field: "business_license", label: "Giấy Phép Kinh Doanh", path: selectedPartner.partner_info?.business_license },
                      { field: "ownership_document", label: "Quyền sở hữu / Thuê chỗ nghỉ", path: selectedPartner.partner_info?.ownership_document },
                      { field: "id_card_front", label: "Mặt trước CCCD Đại diện", path: selectedPartner.partner_info?.id_card_front },
                      { field: "id_card_back", label: "Mặt sau CCCD Đại diện", path: selectedPartner.partner_info?.id_card_back },
                      { field: "bank_statement_image", label: "Sao kê ngân hàng / QR Thẻ", path: selectedPartner.partner_info?.bank_statement_image },
                      { field: "contract_pdf_path", label: "Hợp đồng nguyên tắc (E-Contract)", path: selectedPartner.partner_info?.contract_pdf_path }
                    ].map((doc) => (
                      <div key={doc.field} className="flex items-center justify-between border border-slate-100 rounded-xl p-3 bg-slate-50/30">
                        <div>
                          <span className="block text-xs font-bold text-slate-800">{doc.label}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            {doc.path ? "Đã nộp tệp tin riêng tư" : "Chưa tải lên"}
                          </span>
                        </div>
                        {doc.path ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewPrivateDocument(doc.field, doc.path)}
                            disabled={docLoading[doc.field]}
                            className="h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold"
                          >
                            {docLoading[doc.field] ? (
                              <Spinner size="sm" />
                            ) : (
                              <>
                                <Eye className="mr-1 size-3" />
                                Xem tài liệu
                              </>
                            )}
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 italic">N/A</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Verification actions */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              
              {!showRejectForm ? (
                <div className="flex flex-col justify-between items-center gap-4 sm:flex-row">
                  <div className="text-left w-full sm:w-auto">
                    {!selectedPartner.partner_info?.contract_pdf_path ? (
                      <span className="inline-flex text-xs font-bold text-rose-500 items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100/50">
                        <AlertCircle size={14} className="shrink-0" /> Không thể phê duyệt do đối tác chưa ký hợp đồng nguyên tắc (E-Contract).
                      </span>
                    ) : selectedPartner.status === 4 ? (
                      <span className="inline-flex text-xs font-bold text-amber-600 items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100/50">
                        <AlertCircle size={14} className="shrink-0" /> Đang chờ đối tác cập nhật lại hồ sơ. Các tác vụ duyệt/từ chối tạm thời khóa.
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:justify-end">
                    <Button
                      onClick={() => setShowRejectForm(true)}
                      disabled={isActionLoading || selectedPartner.status === 4}
                      variant="outline"
                      className="h-12 rounded-xl border-rose-200 text-rose-600 bg-rose-50/10 hover:bg-rose-50 hover:border-rose-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="mr-2 size-4" />
                      Từ chối phê duyệt
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={isActionLoading || !selectedPartner.partner_info?.contract_pdf_path || selectedPartner.status === 4}
                      className="h-12 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 px-8 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      <CheckCircle2 className="mr-2 size-4" />
                      Phê duyệt & Kích hoạt đối tác
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/10 p-5 space-y-4">
                  <h4 className="text-sm font-bold text-rose-600 flex items-center gap-1.5">
                    <AlertCircle className="size-4" />
                    Nêu rõ lý do từ chối hồ sơ năng lực đối tác:
                  </h4>
                  <Input
                    placeholder="Mô tả cụ thể (ví dụ: Giấy phép kinh doanh hết hạn hoặc hình ảnh CCCD mặt sau bị mờ...)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="h-12 border-rose-200 bg-white"
                  />
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={() => setShowRejectForm(false)}
                      variant="ghost"
                      className="h-10 text-slate-500"
                    >
                      Quay lại
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={isActionLoading}
                      className="h-10 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg px-6"
                    >
                      Xác nhận gửi từ chối
                    </Button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
