import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  useAdminSettlementDetailQuery,
  useAdminSettlementLineItemsQuery,
  useIssueSettlementMutation,
  useConfirmSettlementPaymentMutation,
  useAddSettlementAdjustmentMutation
} from "@/hooks/useSettlementQuery";
import axiosClient from "@/api/axiosClient";
import { ROUTERS } from "@/constant";
import { Spinner } from "@/components/ui/spinner";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowLeft,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Plus,
  Send,
  User,
  Scale,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { toastSuccess, toastError } from "@/components/ui/toast";

const SettlementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const periodId = Number(id);
  const navigate = useNavigate();

  // Line items pagination state
  const [lineFilters, setLineFilters] = useState({
    page: 1,
    per_page: 10,
  });

  // Adjustment form state
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [isAdjustSubmitting, setIsAdjustSubmitting] = useState(false);

  // Pay Dialog state
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Queries
  const { data: periodResponse, isLoading: isDetailLoading, refetch: refetchDetail } = useAdminSettlementDetailQuery(periodId);
  const { data: lineItemsResponse, isLoading: isLinesLoading, refetch: refetchLines } = useAdminSettlementLineItemsQuery(periodId, lineFilters);

  // Mutations
  const issueMutation = useIssueSettlementMutation();
  const confirmPaymentMutation = useConfirmSettlementPaymentMutation();
  const addAdjustmentMutation = useAddSettlementAdjustmentMutation();

  const handlePageChange = (page: number) => {
    setLineFilters((prev) => ({ ...prev, page }));
  };

  const handlePerPageChange = (per_page: number) => {
    setLineFilters((prev) => ({ ...prev, per_page, page: 1 }));
  };

  const handleIssue = async () => {
    const toastId = toast.loading("Đang phát hành kỳ đối soát...");
    try {
      await issueMutation.mutateAsync(periodId);
      toast.dismiss(toastId);
      toastSuccess("Phát hành kỳ đối soát thành công và gửi email thông báo!");
      refetchDetail();
    } catch (e) {
      toast.dismiss(toastId);
      toastError("Có lỗi xảy ra khi phát hành.");
      console.error(e);
    }
  };

  const handleOpenPayDialog = () => {
    setPaymentRef("");
    setPaymentNote("");
    setIsPayDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!paymentRef.trim()) {
      toastError("Vui lòng nhập mã giao dịch ngân hàng!");
      return;
    }

    const toastId = toast.loading("Đang xác nhận thanh toán...");
    try {
      await confirmPaymentMutation.mutateAsync({
        id: periodId,
        data: {
          payment_reference: paymentRef,
          note: paymentNote,
        },
      });
      toast.dismiss(toastId);
      toastSuccess("Xác nhận thanh toán thành công, kỳ đối soát đã đóng và khóa bookings!");
      setIsPayDialogOpen(false);
      refetchDetail();
    } catch (e) {
      toast.dismiss(toastId);
      toastError("Lỗi xác nhận thanh toán.");
      console.error(e);
    }
  };

  const handleAddAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(adjustAmount);
    if (!adjustAmount || isNaN(amount)) {
      toastError("Vui lòng nhập số tiền điều chỉnh hợp lệ!");
      return;
    }
    if (!adjustReason.trim()) {
      toastError("Vui lòng nhập lý do điều chỉnh!");
      return;
    }

    setIsAdjustSubmitting(true);
    try {
      await addAdjustmentMutation.mutateAsync({
        id: periodId,
        data: {
          amount,
          reason: adjustReason,
        },
      });
      toastSuccess("Thêm dòng điều chỉnh công nợ thành công!");
      setAdjustAmount("");
      setAdjustReason("");
      refetchDetail();
      refetchLines();
    } catch (e: any) {
      toastError(e?.response?.data?.message || "Lỗi khi thêm dòng điều chỉnh.");
    } finally {
      setIsAdjustSubmitting(false);
    }
  };

  // Safe downloads using Blobs
  const handleExportExcel = async () => {
    if (isExportingExcel) return;
    setIsExportingExcel(true);
    const toastId = toast.loading("Đang tạo file Excel bảng kê...");
    try {
      const response = await axiosClient.get(`admin/settlements/${periodId}/export/excel`, {
        responseType: "blob"
      });
      toast.dismiss(toastId);
      toastSuccess("Tải file Excel thành công!");
      const blob = new Blob([response as any], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `BKS-Bảng-Kê-Excel-Kỳ-${periodId}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (e) {
      toast.dismiss(toastId);
      toastError("Không thể xuất file Excel.");
      console.error(e);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    const toastId = toast.loading("Đang tạo file PDF bảng kê...");
    try {
      const response = await axiosClient.get(`admin/settlements/${periodId}/export/pdf`, {
        responseType: "blob"
      });
      toast.dismiss(toastId);
      toastSuccess("Tải file PDF thành công!");
      const blob = new Blob([response as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `BKS-Bảng-Kê-PDF-Kỳ-${periodId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (e) {
      toast.dismiss(toastId);
      toastError("Không thể xuất file PDF.");
      console.error(e);
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
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border border-slate-200 text-sm py-1 px-3">Nháp</Badge>;
      case "issued":
        return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 font-semibold text-sm py-1 px-3">Chờ thanh toán</Badge>;
      case "paid":
        return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 font-semibold text-sm py-1 px-3">Đã thanh toán</Badge>;
      case "disputed":
        return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200 font-semibold text-sm py-1 px-3">Khiếu nại</Badge>;
      case "closed":
        return <Badge className="bg-slate-200 text-slate-800 hover:bg-slate-200 font-semibold text-sm py-1 px-3">Đã khóa</Badge>;
      default:
        return <Badge className="text-sm py-1 px-3">{status}</Badge>;
    }
  };

  if (isDetailLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" showText text="Đang tải chi tiết kỳ đối soát..." />
      </div>
    );
  }

  const period = (periodResponse as any)?.data;
  if (!period) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-lg font-bold text-slate-900">Không tìm thấy kỳ đối soát</h3>
        <Button variant="outline" onClick={() => navigate(ROUTERS.PARTNER_SETTLEMENTS)} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const lineItems = (lineItemsResponse as any)?.data?.items || [];
  const lineMeta = (lineItemsResponse as any)?.data?.meta;
  const totalItems = lineMeta?.total || lineItems.length;
  const totalPages = lineMeta?.last_page || Math.max(1, Math.ceil(totalItems / lineFilters.per_page));

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      {/* Navigation and Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTERS.PARTNER_SETTLEMENTS)}
          className="gap-1.5 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Danh sách kỳ đối soát
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={isExportingExcel || isExportingPdf}
            className="h-9 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <FileSpreadsheet className="size-4" />
            Xuất Excel
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPdf}
            disabled={isExportingPdf || isExportingExcel}
            className="h-9 gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            <FileText className="size-4" />
            Xuất PDF
          </Button>
          {period.status === "draft" && (
            <Button onClick={handleIssue} className="h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Send className="size-4" />
              Phát hành bảng kê
            </Button>
          )}
          {(period.status === "issued" || period.status === "disputed") && (
            <Button onClick={handleOpenPayDialog} className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              <CreditCard className="size-4" />
              Xác nhận thanh toán
            </Button>
          )}
        </div>
      </div>

      {/* Main Info Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">Chi tiết kỳ đối soát #{period.id}</h1>
            {getStatusBadge(period.status)}
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-700">Đối tác:</span> {period.partner?.name} ({period.partner?.email})
            </div>
            <div>
              <span className="font-semibold text-slate-700">Thời gian kỳ:</span> {formatDate(period.period_start)} - {formatDate(period.period_end)}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Ngày phát hành:</span> {period.issued_at ? formatDate(period.issued_at) : "Chưa phát hành"}
            </div>
            {period.paid_at && (
              <div>
                <span className="font-semibold text-slate-700">Ngày thanh toán:</span> {formatDate(period.paid_at)}
              </div>
            )}
            {period.payment_reference && (
              <div className="col-span-2">
                <span className="font-semibold text-slate-700">Mã tham chiếu:</span> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-800 font-mono">{period.payment_reference}</code>
              </div>
            )}
          </div>
        </div>

        {/* Highlighted Net Commission Box */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-100 p-5 min-w-[280px] flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600/80 block">Net Commission phải nộp</span>
            <span className="text-3xl font-black text-indigo-900 mt-1 block">{formatCurrency(period.net_commission_to_pay)}</span>
          </div>
          <div className="mt-3 text-xs text-indigo-700 flex items-center gap-1">
            <Info className="size-3.5" />
            Đã bao gồm điều chỉnh công nợ
          </div>
        </div>
      </section>

      {period.note && (
        <div className={`rounded-2xl border p-4 text-sm ${period.status === "disputed" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
          <div className="flex items-start gap-2.5">
            <Info className={`size-5 shrink-0 mt-0.5 ${period.status === "disputed" ? "text-rose-600" : "text-slate-600"}`} />
            <div>
              <p className="font-bold">{period.status === "disputed" ? "Chi tiết khiếu nại từ đối tác:" : "Ghi chú kỳ đối soát:"}</p>
              <p className="mt-1 whitespace-pre-line font-medium leading-relaxed">
                {period.note}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Aggregates Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="border border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Doanh thu GMV phòng</div>
            <div className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(lineItems.reduce((sum: number, item: any) => sum + item.room_gmv, 0))}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Doanh thu GMV dịch vụ</div>
            <div className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(lineItems.reduce((sum: number, item: any) => sum + item.services_gmv, 0))}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng doanh thu kỳ (GMV)</div>
            <div className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(period.total_gmv)}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phí hoa hồng gốc (5%)</div>
            <div className="mt-2 text-lg font-bold text-indigo-700">{formatCurrency(period.total_commission)}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng tiền điều chỉnh</div>
            <div className={`mt-2 text-lg font-bold ${period.total_adjustments >= 0 ? "text-slate-900" : "text-emerald-700"}`}>
              {period.total_adjustments > 0 ? "+" : ""}{formatCurrency(period.total_adjustments)}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Booking List and Adjustments section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Booking Line Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">Danh sách đơn đặt phòng trong kỳ</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLinesLoading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <Spinner size="md" />
                </div>
              ) : lineItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Không có đơn đặt phòng nào trong kỳ đối soát này.</div>
              ) : (
                <div className="flex flex-col">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã đơn</TableHead>
                          <TableHead>Tên phòng / Cơ sở</TableHead>
                          <TableHead>Check-out</TableHead>
                          <TableHead className="text-right">Tổng GMV</TableHead>
                          <TableHead className="text-right">Commission (5%)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-xs font-semibold text-slate-800">{item.booking_code}</TableCell>
                            <TableCell>
                              <div className="flex flex-col text-xs">
                                <span className="font-semibold text-slate-900">{item.booking?.room?.title}</span>
                                <span className="text-slate-500">{item.booking?.room?.property?.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-slate-700">{formatDate(item.checkout_date)}</TableCell>
                            <TableCell className="text-right text-xs font-medium text-slate-900">{formatCurrency(item.total_gmv)}</TableCell>
                            <TableCell className="text-right text-xs font-bold text-indigo-700">{formatCurrency(item.commission_amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="border-t border-slate-100 p-4">
                    <Pagination
                      currentPage={lineFilters.page}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      perPage={lineFilters.per_page}
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

        {/* Adjustments Ledger & Add Form */}
        <div className="flex flex-col gap-6">
          {/* List adjustments */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">Dòng điều chỉnh công nợ</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              {(!period.adjustments || period.adjustments.length === 0) ? (
                <p className="text-xs text-slate-400 italic text-center py-4">Chưa có dòng điều chỉnh nào cho kỳ này.</p>
              ) : (
                <div className="space-y-3">
                  {period.adjustments.map((adj: any) => (
                    <div key={adj.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className={adj.amount >= 0 ? "text-slate-900" : "text-emerald-700"}>
                          {adj.amount > 0 ? "+" : ""}{formatCurrency(adj.amount)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">{formatDate(adj.created_at)}</span>
                      </div>
                      <p className="mt-1 text-slate-600 font-medium">Lý do: {adj.reason}</p>
                      <p className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                        <User className="size-3" />
                        Tạo bởi: {adj.creator?.name || "Hệ thống"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form add adjustment */}
          {period.status !== "paid" && period.status !== "closed" && (
            <Card className="border border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50/30">
              <CardHeader className="py-4 border-b border-slate-100">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Scale className="size-4 text-indigo-500" />
                  Thêm điều chỉnh công nợ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleAddAdjustment} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="adjustAmount" className="text-xs font-semibold text-slate-700">Số tiền cần điều chỉnh (VND) *</Label>
                    <Input
                      id="adjustAmount"
                      placeholder="Ví dụ: -500000 (giảm) hoặc 300000 (tăng)"
                      value={adjustAmount}
                      onChange={(e: any) => setAdjustAmount(e.target.value)}
                    />
                    <span className="text-[10px] text-slate-500">
                      Gợi ý: Nhập số âm (ví dụ: -200000) để giảm tiền hoa hồng phải đóng. Nhập số dương để phạt/tăng tiền hoa hồng cần thu.
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="adjustReason" className="text-xs font-semibold text-slate-700">Lý do điều chỉnh *</Label>
                    <Textarea
                      id="adjustReason"
                      placeholder="Mô tả cụ thể lý do điều chỉnh..."
                      value={adjustReason}
                      onChange={(e: any) => setAdjustReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={isAdjustSubmitting} className="mt-2 w-full bg-slate-900 text-white hover:bg-slate-800">
                    {isAdjustSubmitting ? <Spinner size="sm" /> : <Plus className="size-4 mr-1.5" />}
                    Thêm điều chỉnh
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Payment Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận thanh toán đối soát</DialogTitle>
            <DialogDescription>
              Vui lòng nhập mã giao dịch ngân hàng thực tế để đóng kỳ đối soát này. Kỳ đối soát và các bookings liên quan sẽ bị khóa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="paymentRef" className="font-semibold text-slate-700">Mã tham chiếu ngân hàng *</Label>
              <Input
                id="paymentRef"
                placeholder="Ví dụ: FT26053100231..."
                value={paymentRef}
                onChange={(e: any) => setPaymentRef(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentNote" className="font-semibold text-slate-700">Ghi chú xác nhận</Label>
              <Textarea
                id="paymentNote"
                placeholder="Nhập thông tin ghi chú bổ sung nếu có..."
                value={paymentNote}
                onChange={(e: any) => setPaymentNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handleConfirmPayment} className="bg-emerald-600 text-white hover:bg-emerald-700">
              Đồng ý xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettlementDetail;
