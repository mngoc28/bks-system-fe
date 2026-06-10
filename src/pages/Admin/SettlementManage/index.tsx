import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAdminSettlementsQuery,
  useAdminSettlementSummaryQuery,
  useIssueSettlementMutation,
  useConfirmSettlementPaymentMutation
} from "@/hooks/useSettlementQuery";
import { ROUTERS } from "@/constant";
import { Spinner } from "@/components/ui/spinner";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { PlainTextarea as Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CircleDollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Filter,
  Eye,
  Send,
  CreditCard,
  RefreshCw
} from "lucide-react";
import { toastDismiss, toastError, toastLoading, toastSuccess } from "@/components/ui/toast";
import { DatePickerField } from "@/components/ui/date-picker-field";

const SettlementManage: React.FC = () => {
  const navigate = useNavigate();

  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    status: "",
    partner_name: "",
    start_date: "",
    end_date: "",
  });

  // Dialog State
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  // Queries
  const { data: summaryData, isLoading: isSummaryLoading, refetch: refetchSummary } = useAdminSettlementSummaryQuery();
  const { data: settlementsData, isLoading: isListLoading, refetch: refetchList } = useAdminSettlementsQuery(filters);

  // Mutations
  const issueMutation = useIssueSettlementMutation();
  const confirmPaymentMutation = useConfirmSettlementPaymentMutation();

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerPageChange = (per_page: number) => {
    setFilters((prev) => ({ ...prev, per_page, page: 1 }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      per_page: 10,
      status: "",
      partner_name: "",
      start_date: "",
      end_date: "",
    });
  };

  const handleIssue = async (id: number) => {
    const toastId = toastLoading("Đang phát hành kỳ đối soát...");
    try {
      await issueMutation.mutateAsync(id);
      toastDismiss(toastId);
      toastSuccess("Phát hành kỳ đối soát thành công và gửi email thông báo!");
      refetchSummary();
    } catch (e) {
      toastDismiss(toastId);
      toastError("Có lỗi xảy ra khi phát hành.");
      console.error(e);
    }
  };

  const handleOpenPayDialog = (id: number) => {
    setSelectedPeriodId(id);
    setPaymentRef("");
    setPaymentNote("");
    setIsPayDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPeriodId) return;
    if (!paymentRef.trim()) {
      toastError("Vui lòng nhập mã giao dịch ngân hàng!");
      return;
    }

    const toastId = toastLoading("Đang xác nhận thanh toán...");
    try {
      await confirmPaymentMutation.mutateAsync({
        id: selectedPeriodId,
        data: {
          payment_reference: paymentRef,
          note: paymentNote,
        },
      });
      toastDismiss(toastId);
      toastSuccess("Xác nhận thanh toán thành công, kỳ đối soát đã được khóa!");
      setIsPayDialogOpen(false);
      refetchSummary();
    } catch (e) {
      toastDismiss(toastId);
      toastError("Lỗi xác nhận thanh toán.");
      console.error(e);
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
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border border-slate-200">Nháp</Badge>;
      case "issued":
        return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 font-medium">Chờ thanh toán</Badge>;
      case "paid":
        return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 font-medium">Đã thanh toán</Badge>;
      case "disputed":
        return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200 font-medium">Khiếu nại</Badge>;
      case "closed":
        return <Badge className="bg-slate-200 text-slate-800 hover:bg-slate-200 font-medium">Đã khóa</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const summary = (summaryData as any)?.data;
  const listItems = (settlementsData as any)?.data?.items || [];
  const meta = (settlementsData as any)?.data?.meta;

  const totalItems = meta?.total || listItems.length;
  const totalPages = meta?.last_page || Math.max(1, Math.ceil(totalItems / filters.per_page));

  return (
    <div className="flex w-full flex-col gap-8 pb-12">
      {/* Title block */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-amber-50/20 to-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đối soát đối tác</h1>
          <p className="mt-1 text-sm text-slate-600">
            Quản lý kỳ đối soát doanh thu, phí hoa hồng nền tảng (5% GMV) và công nợ với các đối tác (Partner).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchSummary();
              refetchList();
            }}
            className="h-9 gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            Làm mới
          </Button>
        </div>
      </section>

      {/* KPI Cards */}
      {isSummaryLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-28" />
            </Card>
          ))}
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tổng doanh thu GMV
              </CardTitle>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <TrendingUp className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.total_gmv || 0)}</div>
              <p className="mt-1 text-xs text-slate-600">Tổng GMV bookings hoàn thành</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tổng phí hoa hồng (5%)
              </CardTitle>
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <CircleDollarSign className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.total_commission || 0)}</div>
              <p className="mt-1 text-xs text-slate-600">Tổng doanh thu nền tảng dự kiến</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Đã thu phí dịch vụ
              </CardTitle>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <CheckCircle2 className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.paid_commission || 0)}</div>
              <p className="mt-1 text-xs text-slate-600">Số tiền đối tác đã thanh toán xong</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Chưa thu / Cần thu
              </CardTitle>
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <Clock className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.pending_commission || 0)}</div>
              <p className="mt-1 text-xs text-slate-600">Hoa hồng chờ hoặc trễ hạn thanh toán</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Filters Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <Filter className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-700">Bộ lọc tìm kiếm</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="partner_name" className="text-xs font-medium text-slate-500">Đối tác</Label>
            <Input
              id="partner_name"
              placeholder="Tên đối tác..."
              value={filters.partner_name}
              onChange={(e) => handleFilterChange("partner_name", e.target.value)}
              className="h-9"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status" className="text-xs font-medium text-slate-500">Trạng thái</Label>
            <Select
              value={filters.status}
              onValueChange={(val) => handleFilterChange("status", val === "all" ? "" : val)}
            >
              <SelectTrigger id="status" className="h-9 min-h-0 rounded border-slate-300 px-3 py-1.5 text-slate-700 hover:border-slate-400 focus:border-slate-500 focus:ring-0 focus:ring-offset-0 shadow-none hover:shadow-none font-normal text-sm data-[placeholder]:text-slate-400">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Nháp (Draft)</SelectItem>
                <SelectItem value="issued">Chờ thanh toán (Issued)</SelectItem>
                <SelectItem value="paid">Đã thanh toán (Paid)</SelectItem>
                <SelectItem value="disputed">Khiếu nại (Disputed)</SelectItem>
                <SelectItem value="closed">Đã khóa (Closed)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DatePickerField
            id="start_date"
            label="Từ ngày"
            labelClassName="text-xs font-medium text-slate-500"
            value={filters.start_date}
            onChange={(ymd) => handleFilterChange("start_date", ymd)}
            placeholder="mm/dd/yyyy"
            className="flex flex-col gap-1.5 space-y-0"
            triggerClassName="h-9 min-h-0 border border-slate-300 rounded px-3 py-1.5 text-slate-700 hover:border-slate-400 focus:border-slate-500 focus:ring-0 focus:ring-offset-0 shadow-none hover:shadow-none font-normal text-sm w-full"
          />

          <DatePickerField
            id="end_date"
            label="Đến ngày"
            labelClassName="text-xs font-medium text-slate-500"
            value={filters.end_date}
            onChange={(ymd) => handleFilterChange("end_date", ymd)}
            placeholder="mm/dd/yyyy"
            className="flex flex-col gap-1.5 space-y-0"
            triggerClassName="h-9 min-h-0 border border-slate-300 rounded px-3 py-1.5 text-slate-700 hover:border-slate-400 focus:border-slate-500 focus:ring-0 focus:ring-offset-0 shadow-none hover:shadow-none font-normal text-sm w-full"
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium opacity-0 select-none" aria-hidden="true">&nbsp;</span>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="h-9 w-full border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all gap-2 flex items-center justify-center font-medium shadow-sm"
            >
              <RefreshCw className="size-3.5 text-slate-500" />
              Đặt lại bộ lọc
            </Button>
          </div>
        </div>
      </section>

      {/* Main Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isListLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Spinner size="lg" showText text="Đang tải danh sách kỳ đối soát..." />
          </div>
        ) : listItems.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertTriangle className="size-12 text-slate-300" />
            <h3 className="text-base font-semibold text-slate-700">Chưa có kỳ đối soát nào</h3>
            <p className="max-w-sm text-sm text-slate-500">
              Không tìm thấy kỳ đối soát nào phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead className="w-16 text-center">ID</TableHead>
                    <TableHead>Đối tác</TableHead>
                    <TableHead>Biên kỳ đối soát</TableHead>
                    <TableHead>Ngày chốt/phát hành</TableHead>
                    <TableHead className="text-right">Tổng GMV</TableHead>
                    <TableHead className="text-right">Net Commission</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-right w-44">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listItems.map((period: any) => (
                    <TableRow key={period.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-center font-medium text-slate-600">{period.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{period.partner?.name}</span>
                          <span className="text-xs text-slate-600">{period.partner?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-700">
                          <Calendar className="size-3.5 text-slate-600" />
                          <span className="text-sm">
                            {formatDate(period.period_start)} - {formatDate(period.period_end)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {period.issued_at ? formatDate(period.issued_at) : <span className="text-xs text-slate-400">Chưa phát hành</span>}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-800">
                        {formatCurrency(period.total_gmv)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-indigo-700">
                        {formatCurrency(period.net_commission_to_pay)}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(period.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`${ROUTERS.PARTNER_SETTLEMENTS}/${period.id}`)}
                            className="h-8 w-8 p-0"
                            title="Xem chi tiết"
                          >
                            <Eye className="size-4 text-slate-600" />
                          </Button>
                          {period.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleIssue(period.id)}
                              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              title="Phát hành bảng kê"
                            >
                              <Send className="size-4" />
                            </Button>
                          )}
                          {(period.status === "issued" || period.status === "disputed") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenPayDialog(period.id)}
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="Xác nhận thanh toán"
                            >
                              <CreditCard className="size-4" />
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
      </section>

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

export default SettlementManage;
