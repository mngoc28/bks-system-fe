import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Loader2, RefreshCw, Calendar, Building2, Home, FileText, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { partnerService } from "@/services/partnerService";
import { parsePartnerPropertyNamesResponse } from "@/utils/partnerPropertyData";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlainTextarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type PartnerCancellationListItem = {
  id: number;
  booking_id: number;
  status: string;
  requested_at: string | null;
  reason_code: string;
  reason_text: string | null;
  booking_status: number | null;
  property: { id: number; name: string } | null;
  room: { id: number; title: string; room_number: string | null } | null;
};

type ListMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

function parseListResponse(res: unknown): { items: PartnerCancellationListItem[]; meta: ListMeta } {
  const r = res as Record<string, unknown> | null;
  const payload = (r?.status === "success" ? r.data : r?.data ?? r) as Record<string, unknown> | undefined;
  const items = (payload?.items as PartnerCancellationListItem[]) ?? [];
  const meta = (payload?.meta as ListMeta) ?? {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: items.length,
  };
  return { items, meta };
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-900 border-amber-200";
    case "approved":
      return "bg-emerald-100 text-emerald-900 border-emerald-200";
    case "rejected":
      return "bg-rose-100 text-rose-900 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function formatRequestedAt(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return iso;
  }
}

function formatReasonCode(code: string): string {
  const map: Record<string, string> = {
    change_of_plans: "Thay đổi kế hoạch",
    financial_reasons: "Lý do tài chính",
    health_reasons: "Lý do sức khỏe",
    travel_restrictions: "Hạn chế đi lại",
    other: "Lý do khác",
  };
  return map[code] || code;
}

function formatBookingStatus(status: number): string {
  const map: Record<number, string> = {
    0: "Chờ duyệt",
    1: "Đã xác nhận",
    2: "Đã hủy",
    3: "Đã hoàn thành",
    4: "Chờ duyệt hủy",
  };
  return map[status] || `TT #${status}`;
}

function statusLabel(status: string): string {
  switch (status) {
    case "pending":   return "Chờ xử lý";
    case "approved":  return "Đã duyệt hủy";
    case "rejected":  return "Đã từ chối";
    case "withdrawn": return "Khách rút";
    default:          return status;
  }
}

// ─── Detail Modal ────────────────────────────────────────────────────────────
function DetailModal({
  row,
  onClose,
  onApprove,
  onReject,
}: {
  row: PartnerCancellationListItem;
  onClose: () => void;
  onApprove: (row: PartnerCancellationListItem) => void;
  onReject:  (row: PartnerCancellationListItem) => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="size-5 text-blue-600" />
            Chi tiết yêu cầu hủy
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Booking info */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wide">
              <Calendar className="size-3.5" /> Thông tin đặt phòng
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <span className="text-slate-500">Mã yêu cầu</span>
              <span className="font-mono font-bold text-slate-900">#{row.id}</span>
              <span className="text-slate-500">Mã booking</span>
              <span className="font-mono font-bold text-blue-700">#{row.booking_id}</span>
              <span className="text-slate-500">Trạng thái đơn</span>
              <span>{row.booking_status != null ? formatBookingStatus(row.booking_status) : "—"}</span>
            </div>
          </div>

          {/* Property / room */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wide">
              <Building2 className="size-3.5" /> Cơ sở / Phòng
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <span className="text-slate-500">Cơ sở</span>
              <span className="font-medium text-slate-900">{row.property?.name ?? "—"}</span>
              <span className="text-slate-500">Phòng</span>
              <span className="font-medium text-slate-900">
                {row.room
                  ? `${row.room.title}${row.room.room_number ? ` (#${row.room.room_number})` : ""}`
                  : "—"}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wide">
              <AlertCircle className="size-3.5" /> Lý do khách yêu cầu hủy
            </div>
            <p className="font-semibold text-slate-800">{formatReasonCode(row.reason_code)}</p>
            {row.reason_text && (
              <p className="text-slate-600 leading-relaxed">{row.reason_text}</p>
            )}
          </div>

          {/* Timestamps & status */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="text-xs text-slate-500">
              <span className="font-medium">Gửi lúc:</span> {formatRequestedAt(row.requested_at)}
            </div>
            <Badge variant="outline" className={`${statusBadgeClass(row.status)} text-xs`}>
              {statusLabel(row.status)}
            </Badge>
          </div>
        </div>

        {row.status === "pending" && (
          <DialogFooter className="gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-800 transition-colors"
              onClick={() => { onClose(); onReject(row); }}
            >
              Từ chối
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => { onClose(); onApprove(row); }}
            >
              Duyệt hủy
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const CancellationRequests: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [propertyFilter, setPropertyFilter] = useState<string>(() => {
    const fromUrl = searchParams.get("property_id");
    return fromUrl && fromUrl !== "all" ? fromUrl : "all";
  });
  const [page, setPage] = useState(1);
  const perPage = 15;

  // Detail modal state
  const [detailRow, setDetailRow] = useState<PartnerCancellationListItem | null>(null);

  // Action dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject">("approve");
  const [activeRow, setActiveRow] = useState<PartnerCancellationListItem | null>(null);
  const [note, setNote] = useState("");

  const propertiesQuery = useQuery({
    queryKey: ["partner", "properties", "names-for-filter"],
    queryFn: async ({ signal }) => {
      const res: any = await partnerService.getPropertyNames({ signal });
      return parsePartnerPropertyNamesResponse(res).map((p) => ({
        id: Number(p.id),
        name: p.name || `Property #${p.id}`,
      }));
    },
    staleTime: 60_000,
  });

  const listQuery = useQuery({
    queryKey: ["partner", "cancellation-requests", { page, perPage, statusFilter, propertyFilter }],
    queryFn: async ({ signal }) => {
      const params: Record<string, string | number> = { page, per_page: perPage };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      if (propertyFilter && propertyFilter !== "all") params.property_id = Number(propertyFilter);
      const res = await partnerService.getCancellationRequests(params, { signal });
      return parseListResponse(res);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, note: n }: { id: number; note?: string }) => {
      return partnerService.approveCancellationRequest(id, n?.trim() ? { note: n.trim() } : {});
    },
    onSuccess: () => {
      toastSuccess("Đã duyệt yêu cầu hủy.");
      queryClient.invalidateQueries({ queryKey: ["partner", "cancellation-requests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "partner", "cancellation-pending"] });
      closeDialog();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      toastError(err?.response?.data?.message ?? "Không thể duyệt yêu cầu.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, note: n }: { id: number; note: string }) => {
      return partnerService.rejectCancellationRequest(id, { note: n.trim() });
    },
    onSuccess: () => {
      toastSuccess("Đã từ chối yêu cầu hủy.");
      queryClient.invalidateQueries({ queryKey: ["partner", "cancellation-requests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "partner", "cancellation-pending"] });
      closeDialog();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      toastError(err?.response?.data?.message ?? "Không thể từ chối yêu cầu.");
    },
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setActiveRow(null);
    setNote("");
  };

  const openApprove = (row: PartnerCancellationListItem) => {
    setActiveRow(row);
    setDialogMode("approve");
    setNote("");
    setDialogOpen(true);
  };

  const openReject = (row: PartnerCancellationListItem) => {
    setActiveRow(row);
    setDialogMode("reject");
    setNote("");
    setDialogOpen(true);
  };

  const submitDialog = () => {
    if (!activeRow) return;
    if (dialogMode === "approve") {
      approveMutation.mutate({ id: activeRow.id, note: note.trim() || undefined });
      return;
    }
    if (note.trim().length < 5) {
      toastError("Ghi chú từ chối cần ít nhất 5 ký tự.");
      return;
    }
    rejectMutation.mutate({ id: activeRow.id, note });
  };

  const propertyOptions = propertiesQuery.data ?? [];

  const httpError = listQuery.error as { response?: { status?: number; data?: { message?: string } } } | undefined;
  const forbidden = httpError?.response?.status === 403;

  const { items, meta } = listQuery.data ?? { items: [], meta: undefined };
  const metaSafe = meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 };

  const busy = approveMutation.isPending || rejectMutation.isPending;

  const roomLabel = useMemo(() => {
    return (row: PartnerCancellationListItem) => {
      const t = row.room?.title?.trim();
      const n = row.room?.room_number?.trim();
      if (t && n) return `${t} (#${n})`;
      if (t) return t;
      if (n) return `#${n}`;
      return row.room ? `Phòng #${row.room.id}` : "—";
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <ClipboardList className="size-7 text-blue-600" />
            Yêu cầu hủy đặt phòng
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Danh sách các yêu cầu hủy phòng từ khách. Duyệt để hoàn tất hủy hoặc từ chối để giữ nguyên đặt phòng.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void listQuery.refetch()}
          disabled={listQuery.isFetching}
          className="gap-2 hover:border-blue-200 hover:text-blue-600 transition-colors"
        >
          {listQuery.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Làm mới
        </Button>
      </div>

      {/* 403 Banner */}
      {forbidden && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-start gap-2">
          <AlertCircle className="size-4 mt-0.5 shrink-0 text-amber-600" />
          <span>Không thể tải dữ liệu. Tính năng yêu cầu hủy đang bị tắt trên hệ thống. Vui lòng liên hệ quản trị viên để được hỗ trợ.</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="min-w-[180px] space-y-2">
          <Label>Trạng thái</Label>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="approved">Đã duyệt hủy</SelectItem>
              <SelectItem value="rejected">Đã từ chối</SelectItem>
              <SelectItem value="withdrawn">Khách đã rút</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[220px] space-y-2">
          <Label>Cơ sở</Label>
          <Select value={propertyFilter} onValueChange={(v) => { setPropertyFilter(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả cơ sở" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cơ sở</SelectItem>
              {propertyOptions.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-3 md:hidden">
        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            Không có yêu cầu phù hợp bộ lọc.
          </div>
        ) : (
          items.map((row, idx) => (
            <div
              key={`mobile-cancel-${row.id}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              onClick={() => setDetailRow(row)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-400">#{(page - 1) * perPage + idx + 1} · booking #{row.booking_id}</p>
                  <p className="text-sm font-semibold text-slate-900">{row.property?.name ?? "—"}</p>
                  <p className="text-xs text-slate-500">{roomLabel(row)}</p>
                </div>
                <Badge variant="outline" className={`${statusBadgeClass(row.status)} text-[10px]`}>
                  {statusLabel(row.status)}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-700">{formatReasonCode(row.reason_code)}</p>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        {listQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="md" showText text="Đang tải danh sách..." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">STT</TableHead>
                <TableHead>Cơ sở / Phòng</TableHead>
                <TableHead>Lý do yêu cầu</TableHead>
                <TableHead>Thời gian gửi</TableHead>
                <TableHead>Trạng thái đặt phòng</TableHead>
                <TableHead>Trạng thái xử lý</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                    Không có yêu cầu phù hợp bộ lọc.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-blue-50/40 transition-colors"
                    onClick={() => setDetailRow(row)}
                  >
                    <TableCell className="font-mono text-xs text-slate-400">
                      {(page - 1) * perPage + idx + 1}
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="size-3.5 shrink-0 text-slate-400" />
                        <span className="truncate text-sm font-medium text-slate-900">
                          {row.property?.name ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Home className="size-3.5 shrink-0 text-slate-300" />
                        <span className="truncate text-xs text-slate-500">{roomLabel(row)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="font-semibold text-slate-800">{formatReasonCode(row.reason_code)}</div>
                      {row.reason_text ? (
                        <div className="line-clamp-2 text-xs text-slate-500 mt-0.5">{row.reason_text}</div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic mt-0.5">Không có ghi chú thêm</div>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-slate-700">
                      {formatRequestedAt(row.requested_at)}
                    </TableCell>
                    <TableCell>
                      {row.booking_status != null ? (
                        <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-700 border-slate-200">
                          {formatBookingStatus(row.booking_status)}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusBadgeClass(row.status)}`}>
                        {statusLabel(row.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      {row.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-slate-900 hover:bg-slate-700 text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); openApprove(row); }}
                          >
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-800 transition-colors"
                            onClick={(e) => { e.stopPropagation(); openReject(row); }}
                          >
                            Từ chối
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {metaSafe.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Trang {metaSafe.current_page} / {metaSafe.last_page} — {metaSafe.total} yêu cầu
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={metaSafe.current_page <= 1 || listQuery.isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={metaSafe.current_page >= metaSafe.last_page || listQuery.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Row Detail Modal */}
      {detailRow && (
        <DetailModal
          row={detailRow}
          onClose={() => setDetailRow(null)}
          onApprove={openApprove}
          onReject={openReject}
        />
      )}

      {/* Action Confirm Dialog (Approve / Reject with note) */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "approve" ? "Duyệt yêu cầu hủy" : "Từ chối yêu cầu hủy"}
            </DialogTitle>
          </DialogHeader>
          {activeRow && (
            <div className="space-y-4 text-sm text-slate-600">
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 space-y-1">
                <p>Mã yêu cầu: <span className="font-mono font-bold text-slate-900">#{activeRow.id}</span></p>
                <p>Mã booking: <span className="font-mono font-bold text-blue-700">#{activeRow.booking_id}</span></p>
                <p className="font-medium text-slate-800">{activeRow.property?.name} — {roomLabel(activeRow)}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cr-note">
                  {dialogMode === "approve" ? "Ghi chú cho khách (tùy chọn)" : "Lý do từ chối (bắt buộc, ≥ 5 ký tự)"}
                </Label>
                <PlainTextarea
                  id="cr-note"
                  rows={4}
                  value={note}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                  placeholder={dialogMode === "approve" ? "Ví dụ: đã xác minh với khách, hoàn tiền trong 3-5 ngày…" : "Nêu rõ lý do từ chối để khách hiểu…"}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
            <Button type="button" variant="ghost" onClick={closeDialog} disabled={busy}>
              Hủy
            </Button>
            <Button type="button" onClick={submitDialog} disabled={busy}
              className={dialogMode === "approve" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}
            >
              {busy
                ? <Loader2 className="size-4 animate-spin" />
                : dialogMode === "approve" ? "Xác nhận duyệt hủy" : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CancellationRequests;
