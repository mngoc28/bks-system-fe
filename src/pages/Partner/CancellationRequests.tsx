import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Loader2, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { partnerService } from "@/services/partnerService";
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
import { ROUTERS } from "@/constant";
import { Link } from "react-router-dom";

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
    1: "Đã duyệt",
    2: "Đã hủy",
    3: "Đã hoàn thành",
    4: "Chờ duyệt hủy",
  };
  return map[status] || `TT #${status}`;
}

const CancellationRequests: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const perPage = 15;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject">("approve");
  const [activeRow, setActiveRow] = useState<PartnerCancellationListItem | null>(null);
  const [note, setNote] = useState("");

  const propertiesQuery = useQuery({
    queryKey: ["partner", "properties", "names-for-filter"],
    queryFn: async () => {
      const res: any = await partnerService.getProperties({ per_page: 200 });
      const rows = res?.data?.data || res?.data || [];
      return rows.map((p: any) => ({
        id: Number(p.id),
        name: String(p.name ?? p.title ?? `Property #${p.id}`),
      })) as { id: number; name: string }[];
    },
    staleTime: 60_000,
  });

  const listQuery = useQuery({
    queryKey: ["partner", "cancellation-requests", { page, perPage, statusFilter, propertyFilter }],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, per_page: perPage };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      if (propertyFilter && propertyFilter !== "all") params.property_id = Number(propertyFilter);
      const res = await partnerService.getCancellationRequests(params);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <ClipboardList className="size-7 text-blue-600" />
            Yêu cầu hủy đặt phòng
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Inbox yêu cầu hủy từ khách (BCP). Cần bật <code className="rounded bg-slate-100 px-1">BCP_CANCELLATION_V1</code>{" "}
            trên API.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void listQuery.refetch()}
          disabled={listQuery.isFetching}
        >
          {listQuery.isFetching ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
          Làm mới
        </Button>
      </div>

      {forbidden && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          API trả 403 — có thể tính năng BCP đang tắt trên server. Liên hệ quản trị để bật{" "}
          <code className="rounded bg-amber-100 px-1">BCP_CANCELLATION_V1</code>.
        </div>
      )}

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
              <SelectItem value="withdrawn">Đã rút</SelectItem>
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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {listQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="md" showText text="Đang tải danh sách..." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Cơ sở / Phòng</TableHead>
                <TableHead>Lý do (mã)</TableHead>
                <TableHead>Gửi lúc</TableHead>
                <TableHead>TT đơn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-slate-500">
                    Không có yêu cầu phù hợp bộ lọc.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-sm">{row.id}</TableCell>
                    <TableCell>
                      <Link
                        to={ROUTERS.PARTNER_BOOKINGS}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        #{row.booking_id}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {row.property?.name ?? "—"}
                      </div>
                      <div className="truncate text-xs text-slate-500">{roomLabel(row)}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="font-semibold text-slate-800">{formatReasonCode(row.reason_code)}</div>
                      {row.reason_text ? (
                        <div className="line-clamp-2 text-xs text-slate-500">{row.reason_text}</div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic">Mã gốc: {row.reason_code}</div>
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
                      <Badge variant="outline" className={`${statusBadgeClass(row.status)} capitalize`}>
                        {row.status === 'pending' ? 'Chờ xử lý' : 
                         row.status === 'approved' ? 'Đã duyệt' : 
                         row.status === 'rejected' ? 'Từ chối' : row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {row.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="default" onClick={() => openApprove(row)}>
                            Duyệt
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openReject(row)}>
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

      {metaSafe.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Trang {metaSafe.current_page} / {metaSafe.last_page} — {metaSafe.total} mục
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

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "approve" ? "Duyệt hủy đặt phòng" : "Từ chối yêu cầu hủy"}</DialogTitle>
          </DialogHeader>
          {activeRow && (
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                Request <span className="font-mono">#{activeRow.id}</span> · Booking{" "}
                <span className="font-mono">#{activeRow.booking_id}</span>
              </p>
              <Label htmlFor="cr-note">{dialogMode === "approve" ? "Ghi chú (tuỳ chọn)" : "Ghi chú từ chối (≥ 5 ký tự)"}</Label>
              <PlainTextarea
                id="cr-note"
                rows={4}
                value={note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                placeholder={dialogMode === "approve" ? "Ví dụ: đã xác minh với khách…" : "Nêu lý do từ chối rõ ràng…"}
              />
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={closeDialog} disabled={busy}>
              Hủy
            </Button>
            <Button type="button" onClick={submitDialog} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : dialogMode === "approve" ? "Xác nhận duyệt" : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CancellationRequests;
