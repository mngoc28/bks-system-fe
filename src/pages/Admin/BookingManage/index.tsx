import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { DEFAULT_CARD_LIMIT, DEFAULT_PAGE } from "@/constant";
import type { Booking, BookingFilters, SearchBookingRequest } from "@/dataHelper/booking.dataHelper";
import { useBookingsQuery, useDeleteBookingMutation } from "@/hooks/useBookingQuery";
import { mapBookingStatus } from "@/utils/utils";
import { Filter, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { BookingDetailDialog, BookingEditDialog, BookingSearchSection, BookingsEmptyState, DeleteConfirmDialog, BookingCard } from "./components";
import BookingCreateDialog from "./components/BookingCreateDialog";
import { Spinner } from "@/components/ui/spinner";
import PageBar from "@/components/PageBar";
import { ViewMode } from "@/components/LayoutToggle";
import BookingTable from "./components/BookingTable";

/**
 * Booking Management Page
 * Handles the display, search, filtering, and management of user bookings.
 */
export default function BookingManagePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Clear highlight after 5 seconds
  useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => setHighlightedId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem("bookingManage_viewMode");
    return (savedMode as ViewMode) || "table"; // Default to table
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("bookingManage_viewMode", mode);
  };

  // Filters state
  const [filters, setFilters] = useState<BookingFilters>({
    q: searchParams.get("q") || "",
    room: searchParams.get("room") || "",
    status: searchParams.get("status") || "",
    start_date: searchParams.get("start_date") || "",
    end_date: searchParams.get("end_date") || "",
    price_min: searchParams.get("price_min") || "",
    price_max: searchParams.get("price_max") || "",
    assignee: searchParams.get("assignee") || "",
  });

  // Data state
  const [data, setData] = useState<Booking[]>([]);
  const [page, setPage] = useState<number>(Number(searchParams.get("page") || DEFAULT_PAGE));
  const [perPage, setPerPage] = useState<number>(Number(searchParams.get("per_page") || DEFAULT_CARD_LIMIT));

  useEffect(() => {
    if (searchParams.get("source") === "dashboard") {
      setOpen(true);
    }
  }, [searchParams]);

  // If any client-aggregation filters are active, fetch a larger page from server and paginate locally.
  const needsClientAggregation = Boolean(
    filters.q || filters.room || filters.assignee || filters.price_min || filters.price_max
  );

  const queryParams: SearchBookingRequest = {
    page: needsClientAggregation ? 1 : page,
    per_page: needsClientAggregation ? 1000 : perPage,
    status: filters.status ? parseInt(filters.status) : undefined,
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
    room_name: filters.room || undefined,
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

  const hasClientFilters = Boolean(
    filters.q || filters.room || filters.assignee || filters.price_min || filters.price_max
  );

  const totalItems = hasClientFilters
    ? filtered.length
    : (apiData?.data?.total ?? filtered.length);
  const totalPages = hasClientFilters
    ? Math.max(1, Math.ceil(filtered.length / perPage))
    : (apiData?.data?.last_page ?? Math.max(1, Math.ceil(totalItems / perPage)));

  const pageStart = (page - 1) * perPage;
  const pageEnd = page * perPage;
  const pageRows = hasClientFilters ? filtered.slice(pageStart, pageEnd) : filtered;

  const handleReset = () => {
    setFilters({ q: "", room: "", status: "", start_date: "", end_date: "", price_min: "", price_max: "", assignee: "" });
  };

  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteBookingMutation();

  const askDelete = (id: string) => {
    const target = data.find((x) => x.id === id) || null;
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const numericId = Number(deleteTarget.id);
    await deleteMutation.mutateAsync(numericId);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

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
    <div className="flex w-full flex-col gap-8 p-[24px_32px]">
      <PageBar
        subtitle={t("bookings.subtitle") || "Theo dõi và quản lý các lượt đặt phòng của khách hàng."}
        showLayoutToggle={true}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-200 bg-white font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
              onClick={() => setOpen((v) => !v)}
            >
              <Filter className="size-4" />
              {t("common.filter")}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 bg-indigo-600 font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-indigo-200"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              {t("bookings.create")}
            </Button>
          </div>
        }
      />

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
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-100 bg-white/50">
          <Spinner size="lg" showText text={t("common.loading_data")} />
        </div>
      ) : totalItems === 0 ? (
        <BookingsEmptyState onOpenFilter={() => setOpen(true)} />
      ) : (
        <div className="flex flex-col gap-8">
          {viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4">
                {pageRows.map((m) => (
                  <BookingCard
                    key={m.id}
                    booking={m}
                    highlightTerms={{
                      q: filters.q || "",
                      room: filters.room || "",
                      assignee: filters.assignee || "",
                    }}
                    onView={(id: string) => {
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
                    onEdit={(id: string) => {
                      setSelectedId(Number(id));
                      setEditOpen(true);
                    }}
                    onDelete={askDelete}
                  />
                ))}
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
                    perPageOptions={[12, 24, 48]}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <BookingTable
                    filtered={pageRows}
                    onView={(id: string) => {
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
                    onEdit={(id: string) => {
                        setSelectedId(Number(id));
                        setEditOpen(true);
                    }}
                    onDelete={askDelete}
                    filters={filters}
                />
                {totalItems > 0 && (
                <div className="border-t border-slate-100 p-4">
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
                    perPageOptions={[12, 24, 48]}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <DeleteConfirmDialog
        booking={deleteTarget}
        isOpen={deleteOpen}
        isLoading={deleteMutation.isPending}
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
