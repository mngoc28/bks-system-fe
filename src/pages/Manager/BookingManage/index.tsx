import Pagination from "@/components/Pagination";
import RowActions from "@/components/RowActions/RowActions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constant";
import type { Booking, BookingFilters, SearchBookingRequest } from "@/dataHelper/booking.dataHelper";
import { useBookingsQuery, useDeleteBookingMutation } from "@/hooks/useBookingQuery";
import { formatDateVietnam, safeFormatDateTime } from "@/utils/dateUtils";
import { formatPrice, highlightText, mapBookingStatus } from "@/utils/utils";
import { ChevronDown, ChevronsUpDown, ChevronUp, Filter, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BookingDetailDialog, BookingEditDialog, BookingSearchSection, BookingsEmptyState, DeleteConfirmDialog } from "./components";
import BookingCreateDialog from "./components/BookingCreateDialog";

export default function BookingManagePage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  type SortKey = "id" | "user" | "room" | "start_date" | "end_date" | "price" | "status" | "assignee" | "created_at";
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Clear highlight after 5 seconds
  useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => setHighlightedId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  // Toggle sort state for a given key
  const toggleSort = (key: SortKey) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  };

  // Filters state
  const [filters, setFilters] = useState<BookingFilters>({
    q: "",
    room: "",
    status: "",
    start_date: "",
    end_date: "",
    price_min: "",
    price_max: "",
    assignee: "",
  });

  // Data state
  const [data, setData] = useState<Booking[]>([]);
  const [page, setPage] = useState<number>(DEFAULT_PAGE);
  const [perPage, setPerPage] = useState<number>(DEFAULT_LIMIT);

  // If any client-aggregation filters are active, fetch a larger page from server and paginate locally.
  const needsClientAggregation = Boolean(
    filters.q || filters.room || filters.assignee || filters.price_min || filters.price_max
  );

  // Server query params: send server-supported fields and widen page size when aggregating client-side
  const queryParams: SearchBookingRequest = {
    page: needsClientAggregation ? 1 : page,
    per_page: needsClientAggregation ? 1000 : perPage,
    status: filters.status ? parseInt(filters.status) : undefined,
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
    room_name: filters.room || undefined,
    sort_field: sort?.key,
    sort_direction: sort?.direction,
  };

  const { data: apiData, isLoading } = useBookingsQuery(queryParams);

  // Map API list to UI rows
  const serverRows: Booking[] = useMemo(() => {
    const list: any[] = apiData?.data?.data ?? [];
    return list.map((item: any, idx: number) => ({
      id: String(item.id ?? idx + 1),
      user: { name: item.user_name ?? "" },
      room: { room_number: item.room_name ?? "", building: { name: item.building_name ?? "" } },
      start_date: item.start_date ?? "",
      end_date: item.end_date ?? "",
      price: (() => {
        const v = item.price;
        if (typeof v === "number") return v;
        if (typeof v === "string") {
          const n = parseFloat(v);
          return isNaN(n) ? 0 : n;
        }
        return 0;
      })(),
      status: mapBookingStatus(item.booking_status ?? 0),
      assignee: item.partner_name ?? "-",
      created_at: item.created_at ?? "",
    }));
  }, [apiData]);

  // Update data when serverRows change
  useEffect(() => {
    setData(serverRows);
  }, [serverRows]);

  // Apply client-side filters
  const filtered = useMemo(() => {
    let base = data.filter((d) => {
      if (filters.q && !d.user.name.toLowerCase().includes(filters.q.toLowerCase())) return false;
      if (filters.room && !(`${d.room.room_number}`.toLowerCase().includes(filters.room.toLowerCase()))) return false;
      if (filters.status) {
        const expectedStatus = mapBookingStatus(parseInt(filters.status));
        if (d.status !== expectedStatus) return false;
      }
      if (filters.assignee && !d.assignee?.toLowerCase().includes(filters.assignee.toLowerCase())) return false;
      if (filters.start_date && d.start_date < filters.start_date) return false;
      if (filters.end_date && d.end_date > filters.end_date) return false;
      if (filters.price_min && d.price < Number(filters.price_min)) return false;
      if (filters.price_max && d.price > Number(filters.price_max)) return false;
      return true;
    });

    // When room filter active, prioritize matches by moving them to top via a simple sort: exact prefix match first
    if (filters.room) {
      const roomLower = filters.room.toLowerCase();
      base = [...base].sort((a, b) => {
        const aRoom = a.room.room_number.toLowerCase();
        const bRoom = b.room.room_number.toLowerCase();
        const aStarts = aRoom.startsWith(roomLower) ? 1 : 0;
        const bStarts = bRoom.startsWith(roomLower) ? 1 : 0;
        if (aStarts !== bStarts) return bStarts - aStarts;
        return aRoom.localeCompare(bRoom, 'vi', { numeric: true, sensitivity: 'base' });
      });
    }
    return base;
  }, [data, filters]);

  // reset page when filters change
  useEffect(() => {
    setPage(DEFAULT_PAGE);
  }, [filters]);

  // Determine if we are applying client-side only filters (those not sent to server)
  const hasClientFilters = Boolean(
    filters.q ||
    filters.room ||
    filters.assignee ||
    filters.price_min ||
    filters.price_max
  );

  // When client-side filters are active, paginate locally; otherwise rely on server totals.
  const totalItems = hasClientFilters
    ? filtered.length
    : (apiData?.data?.total ?? filtered.length);
  const totalPages = hasClientFilters
    ? Math.max(1, Math.ceil(filtered.length / perPage))
    : (apiData?.data?.last_page ?? Math.max(1, Math.ceil(totalItems / perPage)));

  // Rows to display for current page
  const pageStart = (page - 1) * perPage;
  const pageEnd = page * perPage;
  const pageRows = hasClientFilters ? filtered.slice(pageStart, pageEnd) : filtered;

  const handleReset = () => {
    setFilters({ q: "", room: "", status: "", start_date: "", end_date: "", price_min: "", price_max: "", assignee: "" });
  };

  // Removed create flow per requirement

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteBookingMutation();
  const deleteLoading = deleteMutation.isPending;

  // Ask delete confirmation
  const askDelete = (id: string) => {
    const target = data.find((x) => x.id === id) || null;
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const numericId = Number(deleteTarget.id);
    await deleteMutation.mutateAsync(numericId);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  // Detail & Edit dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedFallback, setSelectedFallback] = useState<{
    user_name?: string | null;
    building_name?: string | null;
    room_name?: string | null;
    room_price?: number | string | null;
    partner_name?: string | null;
  } | null>(null);



  return (
    <div className="w-full p-[12px_24px] gap-6 flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">{t("bookings.title")}</h1>
        <div className="flex flex-row items-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 px-4 py-2 border-primary text-primary hover:bg-primary/5"
            onClick={() => setOpen((v) => !v)}
          >
            <Filter className="size-4" />
            {t("bookings.filter")}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 px-4 py-2"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            {t("bookings.create")}
          </Button>
        </div>
      </div>

      <BookingCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={(id) => {
          setSelectedId(id);
          setHighlightedId(id.toString());
        }}
      />

      <BookingSearchSection
        open={open}
        filters={filters}
        setFilters={setFilters}
        onReset={handleReset}
        onClose={() => setOpen(false)}
      />

      {isLoading ? (
  <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">{t("bookings.loading")}</div>
      ) : totalItems === 0 ? (
        <BookingsEmptyState onOpenFilter={() => setOpen(true)} />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[1280px] text-sm text-slate-700">
          <TableHeader>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <TableHead
                className="px-4 py-3 text-slate-700 whitespace-nowrap cursor-pointer select-none text-center"
                onClick={() => toggleSort("id")}
                aria-sort={sort?.key === "id" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("bookings.table.id")}
                  {sort?.key === "id" ? (
                    sort.direction === "asc" ? <ChevronUp className="size-4 text-slate-700" /> : <ChevronDown className="size-4 text-slate-700" />
                  ) : (
                    <ChevronsUpDown className="size-4 text-slate-500" />
                  )}
                </span>
              </TableHead>
              <TableHead
                className="px-4 py-3 text-slate-700 whitespace-nowrap cursor-pointer select-none"
                onClick={() => toggleSort("user")}
                aria-sort={sort?.key === "user" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("bookings.table.user")}
                  {sort?.key === "user" ? (
                    sort.direction === "asc" ? <ChevronUp className="size-4 text-slate-700" /> : <ChevronDown className="size-4 text-slate-700" />
                  ) : (
                    <ChevronsUpDown className="size-4 text-slate-500" />
                  )}
                </span>
              </TableHead>
              <TableHead
                className="px-4 py-3 text-slate-700 whitespace-nowrap cursor-pointer select-none"
                onClick={() => toggleSort("room")}
                aria-sort={sort?.key === "room" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("bookings.table.room")}
                  {sort?.key === "room" ? (
                    sort.direction === "asc" ? <ChevronUp className="size-4 text-slate-700" /> : <ChevronDown className="size-4 text-slate-700" />
                  ) : (
                    <ChevronsUpDown className="size-4 text-slate-500" />
                  )}
                </span>
              </TableHead>
              <TableHead
                className="px-4 py-3 text-slate-700 whitespace-nowrap cursor-pointer select-none"
                onClick={() => toggleSort("start_date")}
                aria-sort={sort?.key === "start_date" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("bookings.table.start_date")}
                  {sort?.key === "start_date" ? (
                    sort.direction === "asc" ? <ChevronUp className="size-4 text-slate-700" /> : <ChevronDown className="size-4 text-slate-700" />
                  ) : (
                    <ChevronsUpDown className="size-4 text-slate-500" />
                  )}
                </span>
              </TableHead>
              <TableHead
                className="px-4 py-3 text-slate-700 whitespace-nowrap cursor-pointer select-none"
                onClick={() => toggleSort("end_date")}
                aria-sort={sort?.key === "end_date" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("bookings.table.end_date")}
                  {sort?.key === "end_date" ? (
                    sort.direction === "asc" ? <ChevronUp className="size-4 text-slate-700" /> : <ChevronDown className="size-4 text-slate-700" />
                  ) : (
                    <ChevronsUpDown className="size-4 text-slate-500" />
                  )}
                </span>
              </TableHead>
              <TableHead
                className="px-4 py-3 text-slate-700 whitespace-nowrap cursor-pointer select-none"
                onClick={() => toggleSort("price")}
                aria-sort={sort?.key === "price" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("bookings.table.price")}
                  {sort?.key === "price" ? (
                    sort.direction === "asc" ? <ChevronUp className="size-4 text-slate-700" /> : <ChevronDown className="size-4 text-slate-700" />
                  ) : (
                    <ChevronsUpDown className="size-4 text-slate-500" />
                  )}
                </span>
              </TableHead>
              <TableHead
                className="px-4 py-3 text-slate-700 whitespace-nowrap cursor-pointer select-none"
                onClick={() => toggleSort("status")}
                aria-sort={sort?.key === "status" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("bookings.table.status")}
                  {sort?.key === "status" ? (
                    sort.direction === "asc" ? <ChevronUp className="size-4 text-slate-700" /> : <ChevronDown className="size-4 text-slate-700" />
                  ) : (
                    <ChevronsUpDown className="size-4 text-slate-500" />
                  )}
                </span>
              </TableHead>
              <TableHead
                className="px-4 py-3 text-slate-700 whitespace-nowrap cursor-pointer select-none"
                onClick={() => toggleSort("assignee")}
                aria-sort={sort?.key === "assignee" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("bookings.table.assignee")}
                  {sort?.key === "assignee" ? (
                    sort.direction === "asc" ? <ChevronUp className="size-4 text-slate-700" /> : <ChevronDown className="size-4 text-slate-700" />
                  ) : (
                    <ChevronsUpDown className="size-4 text-slate-500" />
                  )}
                </span>
              </TableHead>
              <TableHead
                className="px-4 py-3 text-slate-700 whitespace-nowrap cursor-pointer select-none"
                onClick={() => toggleSort("created_at")}
                aria-sort={sort?.key === "created_at" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("bookings.table.created_at")}
                  {sort?.key === "created_at" ? (
                    sort.direction === "asc" ? <ChevronUp className="size-4 text-slate-700" /> : <ChevronDown className="size-4 text-slate-700" />
                  ) : (
                    <ChevronsUpDown className="size-4 text-slate-500" />
                  )}
                </span>
              </TableHead>
              <TableHead className="px-4 py-3 text-slate-700">{t("bookings.table.actions")}</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {pageRows.map((m) => (
              <TableRow key={m.id} className={`hover:bg-muted/50 ${highlightedId === m.id ? 'bg-green-100 animate-pulse' : ''}`}>
                <TableCell className="px-4 py-3 align-middle text-center">{m.id}</TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  {highlightText(m.user.name, filters.q)}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  {highlightText(`${m.room.room_number} — ${m.room.building.name}`, filters.room)}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle">{m.start_date ? formatDateVietnam(m.start_date) : '-'}</TableCell>
                <TableCell className="px-4 py-3 align-middle">{m.end_date ? formatDateVietnam(m.end_date) : '-'}</TableCell>
                <TableCell className="px-4 py-3 align-middle">{formatPrice(m.price)}</TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    m.status === "pending" ? "bg-yellow-50 text-yellow-700" : m.status === "confirmed" ? "bg-blue-50 text-blue-700" : m.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                  }`}>{t(`bookings.search.status_${m.status}`)}</span>
                </TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  {highlightText(m.assignee || "-", filters.assignee)}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle">{safeFormatDateTime(m.created_at)}</TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  <RowActions
                    id={m.id}
                    onView={(id) => {
                      setSelectedId(Number(id));
                      const row = data.find((x) => x.id === id);
                      setSelectedFallback({
                        user_name: row?.user.name ?? "-",
                        building_name: row?.room.building.name ?? "-",
                        room_name: row?.room.room_number ?? "-",
                        room_price: row?.price ?? null,
                        partner_name: row?.assignee ?? "-",
                      });
                      setDetailOpen(true);
                    }}
                    onEdit={(id) => {
                      setSelectedId(Number(id));
                      setEditOpen(true);
                    }}
                    onDelete={askDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          </Table>
          </div>
          {totalItems > 0 && (
            <div className="p-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
                perPage={perPage}
                onPerPageChange={(pp) => {
                  setPerPage(pp);
                  setPage(DEFAULT_PAGE);
                }}
                totalItems={totalItems}
              />
            </div>
          )}
        </div>
      )}

      <DeleteConfirmDialog
        booking={deleteTarget}
        isOpen={deleteOpen}
        isLoading={deleteLoading}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />

      <BookingDetailDialog
        id={selectedId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        fallback={selectedFallback ?? undefined}
      />

      <BookingEditDialog
        id={selectedId}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={(id) => setHighlightedId(id.toString())}
      />
    </div>
  );
}
