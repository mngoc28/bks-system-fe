import React, { useState } from "react";
import {
  usePartnerSettlementsQuery,
  useDisputeSettlementMutation
} from "@/hooks/useSettlementQuery";
import axiosClient from "@/api/axiosClient";
import { Spinner } from "@/components/ui/spinner";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { PlainTextarea as Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle2,
  Copy,
  Building,
  RefreshCw,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { toastSuccess, toastError } from "@/components/ui/toast";

const PartnerFinance: React.FC = () => {
  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    status: "",
    start_date: "",
    end_date: "",
  });

  // Dispute Dialog state
  const [selectedDisputeId, setSelectedDisputeId] = useState<number | null>(null);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isDisputeSubmitting, setIsDisputeSubmitting] = useState(false);

  // Query list
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const {
    data: listResponse,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = usePartnerSettlementsQuery(filters);

  const handleRefresh = async () => {
    try {
      await refetchList();
      toastSuccess("Đã làm mới dữ liệu.");
    } catch {
      toastError("Không thể làm mới dữ liệu.");
    }
  };

  // Mutation dispute
  const disputeMutation = useDisputeSettlementMutation();

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerPageChange = (per_page: number) => {
    setFilters((prev) => ({ ...prev, per_page, page: 1 }));
  };

  const handleOpenDispute = (id: number) => {
    setSelectedDisputeId(id);
    setDisputeReason("");
    setIsDisputeOpen(true);
  };

  const handleConfirmDispute = async () => {
    if (!selectedDisputeId) return;
    if (!disputeReason.trim()) {
      toastError("Vui lòng nhập lý do khiếu nại!");
      return;
    }

    setIsDisputeSubmitting(true);
    try {
      await disputeMutation.mutateAsync({
        id: selectedDisputeId,
        reason: disputeReason,
      });
      toastSuccess("Gửi khiếu nại thành công! Trạng thái kỳ đối soát đã được cập nhật thành 'Khiếu nại'. Ban quản trị sẽ liên hệ sớm.");
      setIsDisputeOpen(false);
      refetchList();
    } catch (e: any) {
      toastError(e?.response?.data?.message || "Có lỗi xảy ra khi gửi khiếu nại.");
    } finally {
      setIsDisputeSubmitting(false);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toastSuccess(`Đã sao chép ${label}!`);
  };

  // Safe downloads using Blobs
  const handleExportExcel = async (periodId: number) => {
    if (isExportingExcel) return;
    setIsExportingExcel(true);
    try {
      const response = await axiosClient.get(`partner/settlements/${periodId}/export/excel`, {
        responseType: "blob"
      });
      const blob = new Blob([response as any], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `BKS-Doi-Soat-Ky-${periodId}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(link.href);
      toastSuccess("Tải file Excel thành công!");
    } catch (e) {
      console.error(e);
      toastError("Không thể xuất file Excel.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async (periodId: number) => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const response = await axiosClient.get(`partner/settlements/${periodId}/export/pdf`, {
        responseType: "blob"
      });
      const blob = new Blob([response as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `BKS-Bang-Ke-Doi-Soat-Ky-${periodId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
      toastSuccess("Tải file PDF thành công!");
    } catch (e) {
      console.error(e);
      toastError("Không thể xuất file PDF.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border border-slate-200">Dự kiến (Nháp)</Badge>;
      case "issued":
        return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 font-semibold">Chờ thanh toán</Badge>;
      case "paid":
        return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 font-semibold">Đã thanh toán</Badge>;
      case "disputed":
        return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200 font-semibold">Đang khiếu nại</Badge>;
      case "closed":
        return <Badge className="bg-slate-200 text-slate-800 hover:bg-slate-200 font-semibold">Đã khóa</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const listItems = (listResponse as any)?.data?.items || [];
  const meta = (listResponse as any)?.data?.meta;

  const totalItems = meta?.total || listItems.length;
  const totalPages = meta?.last_page || Math.max(1, Math.ceil(totalItems / filters.per_page));

  // Compute local KPI metrics for Partner from visible list (or just outstanding)
  const outstandingPeriod = listItems.find((p: any) => p.status === "issued" || p.status === "disputed");
  const unpaidCommission = listItems
    .filter((p: any) => p.status === "issued" || p.status === "disputed")
    .reduce((sum: number, p: any) => sum + p.net_commission_to_pay, 0);

  const bankInfo = {
    bank_name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)",
    branch: "Chi nhánh Đà Nẵng",
    account_number: "1234567890",
    account_holder: "CONG TY CO PHAN BKS SYSTEM",
  };

  const syntaxText = outstandingPeriod
    ? `BKSSETTLE${outstandingPeriod.id}`
    : "BKSSETTLE[ID_KY_DOI_SOAT]";

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      {/* Title block */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-indigo-50/20 to-white p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Tài chính & Đối soát</h1>
          <p className="mt-1 text-xs text-slate-600">
            Theo dõi chi tiết hoa hồng nộp phí dịch vụ (5% GMV) và lịch sử thanh toán đối soát định kỳ.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="h-9 gap-1.5"
          disabled={isListLoading || isListFetching}
        >
          <RefreshCw className={`size-3.5 ${isListFetching ? "animate-spin text-indigo-600" : ""}`} />
          Làm mới dữ liệu
        </Button>
      </section>

      {/* KPI and Bank Instructions grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: KPI cards */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Dư nợ phí cần đóng
                </CardTitle>
                <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                  <Clock className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-rose-600">{formatCurrency(unpaidCommission)}</div>
                <p className="mt-1 text-[11px] text-slate-600">
                  {outstandingPeriod
                    ? `Kỳ #${outstandingPeriod.id} hạn đóng: 5 ngày sau ngày chốt.`
                    : "Bạn không có dư nợ kỳ quá hạn."}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Đã thanh toán lũy kế
                </CardTitle>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-emerald-700">
                  {formatCurrency(listItems.filter((p: any) => p.status === "paid" || p.status === "closed").reduce((sum: number, p: any) => sum + p.net_commission_to_pay, 0))}
                </div>
                <p className="mt-1 text-[11px] text-slate-600">Tổng phí dịch vụ nền tảng đã nộp thành công</p>
              </CardContent>
            </Card>
          </div>

          {/* Table list history */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden flex-1">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">Lịch sử kỳ đối soát</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isListLoading ? (
                <div className="flex min-h-[260px] items-center justify-center">
                  <Spinner size="md" />
                </div>
              ) : listItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Chưa phát hành kỳ đối soát nào.</div>
              ) : (
                <div className="flex flex-col">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-14 text-center">ID</TableHead>
                          <TableHead>Kỳ đối soát</TableHead>
                          <TableHead className="text-right">Tổng GMV</TableHead>
                          <TableHead className="text-right">Phí hoa hồng (5%)</TableHead>
                          <TableHead className="text-center">Trạng thái</TableHead>
                          <TableHead className="text-right w-36">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {listItems.map((period: any) => (
                          <TableRow key={period.id}>
                            <TableCell className="text-center font-medium text-slate-600">{period.id}</TableCell>
                            <TableCell className="text-xs">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-900">
                                  {formatDate(period.period_start)} - {formatDate(period.period_end)}
                                </span>
                                <span className="text-slate-500">Chốt ngày: {formatDate(period.issue_date)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-xs font-semibold text-slate-900">{formatCurrency(period.total_gmv)}</TableCell>
                            <TableCell className="text-right text-xs font-bold text-indigo-700">{formatCurrency(period.net_commission_to_pay)}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(period.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleExportExcel(period.id)}
                                  disabled={isExportingExcel || isExportingPdf}
                                  className="h-8 w-8 p-0 text-emerald-600 disabled:opacity-50"
                                  title="Tải Excel bảng kê"
                                >
                                  <FileSpreadsheet className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleExportPdf(period.id)}
                                  disabled={isExportingPdf || isExportingExcel}
                                  className="h-8 w-8 p-0 text-rose-600 disabled:opacity-50"
                                  title="Tải PDF bảng kê"
                                >
                                  <FileText className="size-4" />
                                </Button>
                                {period.status === "issued" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenDispute(period.id)}
                                    className="h-8 px-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                                    title="Khiếu nại bảng kê"
                                  >
                                    Khiếu nại
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="border-t border-slate-100 p-4">
                    <Pagination
                      currentPage={filters.page}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      perPage={filters.per_page}
                      onPerPageChange={handlePerPageChange}
                      totalItems={totalItems}
                      perPageOptions={[10, 20, 50]}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bank transfer instructions */}
        <div className="flex flex-col gap-4">
          <Card className="border border-indigo-100 bg-gradient-to-b from-indigo-50/70 to-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Building className="size-4 text-indigo-600" />
                Hướng dẫn nộp phí dịch vụ
              </CardTitle>
              <CardDescription className="text-xs">
                Khi ban quản trị phát hành bảng kê đối soát, đối tác vui lòng thanh toán nợ phí nền tảng trong vòng 5 ngày làm việc theo thông tin dưới đây.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs font-medium">
              <div className="rounded-xl border border-indigo-100 bg-white p-3 space-y-2">
                <div>
                  <span className="text-slate-500 text-[10px] block">Ngân hàng thụ hưởng</span>
                  <span className="text-slate-800 font-bold">{bankInfo.bank_name}</span>
                  <span className="text-slate-500 text-[10px] block">{bankInfo.branch}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Số tài khoản</span>
                    <span className="text-slate-800 text-sm font-black tracking-wide font-mono">{bankInfo.account_number}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyText(bankInfo.account_number, "Số tài khoản")}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Tên chủ tài khoản</span>
                    <span className="text-slate-800 font-bold">{bankInfo.account_holder}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyText(bankInfo.account_holder, "Tên chủ tài khoản")}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Transfer Syntax Block */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 space-y-2">
                <span className="text-amber-800 text-[10px] font-semibold uppercase tracking-wider block">Cú pháp chuyển khoản bắt buộc</span>
                <div className="flex items-center justify-between">
                  <span className="text-amber-950 font-mono font-bold text-sm bg-white border border-amber-200 px-2 py-1 rounded">
                    {syntaxText}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyText(syntaxText, "Cú pháp chuyển khoản")}
                    className="h-8 w-8 p-0 text-amber-700 hover:text-amber-950"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-amber-700 mt-1 leading-relaxed">
                  * Chú ý: Cú pháp chuyển khoản phải khớp tuyệt đối. Hệ thống sẽ tự động quét đối soát giao dịch dựa trên mã này để ghi nhận thanh toán nhanh nhất.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dispute Modal */}
      <Dialog open={isDisputeOpen} onOpenChange={setIsDisputeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Gửi khiếu nại đối soát tài chính</DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp chi tiết sai sót (lệch đơn đặt phòng, sai tiền dịch vụ, v.v.). Bảng kê này sẽ chuyển sang trạng thái tranh chấp chờ Admin rà soát lại.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="disputeReason" className="font-semibold text-slate-700">Lý do khiếu nại chi tiết *</Label>
              <Textarea
                id="disputeReason"
                placeholder="Nhập chi tiết sai sót: lệch booking code nào, ngày check-out thực tế ra sao, v.v."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisputeOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmDispute}
              disabled={isDisputeSubmitting}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {isDisputeSubmitting ? <Spinner size="sm" /> : "Xác nhận gửi khiếu nại"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerFinance;
