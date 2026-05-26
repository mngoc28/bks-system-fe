import React, { useMemo, useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Home,
  Search,
  Loader2,
  Eye,
  FileDown,
  Building2,
  Clock,
  UserCheck,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Booking } from './types';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { partnerService } from '@/services/partnerService';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useQueryClient } from '@tanstack/react-query';

import Pagination from '@/components/Pagination';
import { usePartnerStatsQuery } from '@/hooks/usePartnerDashboardQuery';
import CancelBookingDialog from './components/CancelBookingDialog';
import { useQuickConfirm } from '@/hooks/Partner/useQuickConfirm';
import { isPartner360Enabled } from '@/lib/featureFlags';
import { Undo2, RefreshCw } from 'lucide-react';
import {
  countPartnerBookingNightsExclusive,
  formatPartnerBookingDateVi,
  getPartnerBookingBadgeClass,
  getPartnerRowDisplayStatus,
  normalizePartnerBookingStatusCode,
  partnerBaseStatusLabel,
} from '@/utils/partnerBookingDisplay';

type BookingStatusFilter = 'all' | 0 | 1 | 2 | 3 | 4 | 'in_stay';

interface BookingRow extends Booking {
  phone?: string;
  note?: string;
  propertyName?: string;
  roomId?: number;
  propertyId?: number;
  rawStatus?: number;
  createdAt?: string;
}

const Bookings: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: globalStats, isLoading: statsLoading } = usePartnerStatsQuery();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());
  const [bulkCancelOpen, setBulkCancelOpen] = useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ succeeded: number[]; failed: Array<{ id: number; reason: string }> } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Action Confirmation State
  const [actionConfirmModalOpen, setActionConfirmModalOpen] = useState(false);
  const [actionTargetBooking, setActionTargetBooking] = useState<BookingRow | null>(null);
  const [actionType, setActionType] = useState<'check_in' | 'check_out' | null>(null);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const prevFiltersRef = React.useRef({
    status: statusFilter,
    search: debouncedSearchTerm,
  });

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.status !== statusFilter ||
      prevFiltersRef.current.search !== debouncedSearchTerm;

    prevFiltersRef.current = {
      status: statusFilter,
      search: debouncedSearchTerm,
    };

    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    const abortController = new AbortController();
    fetchBookings(true, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [currentPage, pageSize, statusFilter, debouncedSearchTerm]);


  const normalizeBookings = (rows: any[]): BookingRow[] => {
    return (rows || []).map((item: any) => {
      const rawStatus = normalizePartnerBookingStatusCode(item.status ?? item.booking_status);

      return {
        id: item.id,
        guestName: item.guestName ?? item.user_name ?? item.customerName ?? '',
        roomName: item.roomName ?? item.room_name ?? item.room_number ?? '',
        checkIn: item.checkIn ?? item.start_date ?? item.check_in ?? '',
        checkOut: item.checkOut ?? item.end_date ?? item.check_out ?? '',
        totalAmount: Number(item.totalAmount ?? item.price ?? 0),
        status: partnerBaseStatusLabel(rawStatus),
        rawStatus,
        phone: item.phone ?? item.user_phone ?? '',
        note: item.note ?? '',
        propertyName: item.propertyName ?? item.property_name ?? item.property_name ?? '',
        roomId: item.room_id ? Number(item.room_id) : undefined,
        propertyId: item.property_id != null ? Number(item.property_id) : item.property_id != null ? Number(item.property_id) : undefined,
        createdAt: item.createdAt ?? item.created_at ?? '',
        stay_status: item.stay_status || 'pending',
      };
    });
  };

  const fetchBookings = async (showLoading = true, signal?: AbortSignal) => {
    try {
      // Use full-page loader only for initial fetch, subtle overlay for updates
      if (showLoading) {
        if (loading) setLoading(true);
        else setIsRefreshing(true);
      }
      
      const params: any = {
        page: currentPage,
        per_page: pageSize,
        keyword: debouncedSearchTerm || undefined,
      };

      if (statusFilter === 'in_stay') {
        params.stay_status = 'checked_in';
        params.status = 1;
      } else if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const res: any = await partnerService.getBookings(params, { signal });
      
      // Standardize response body access (handle both axios response and direct body)
      const resBody = res?.data || res;
      
      // The actual paginator object returned by Laravel is usually in resBody.data
      // or resBody itself if the interceptor already stripped the success wrapper.
      const paginator = resBody?.data && typeof resBody.data === 'object' && !Array.isArray(resBody.data) 
        ? resBody.data 
        : resBody;

      const rawData = Array.isArray(paginator.data) ? paginator.data : (Array.isArray(paginator) ? paginator : []);
      const totalCount = paginator.total ?? rawData.length;
      const pagesCount = paginator.last_page ?? (paginator.total ? Math.ceil(paginator.total / pageSize) : 1);

      setBookings(normalizeBookings(rawData));
      setTotalItems(totalCount);
      setTotalPages(pagesCount);
      setSelectedIds(new Set());
      
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError' || signal?.aborted) {
        return;
      }
      console.error('Error fetching bookings:', error);
      toastError('Không thể tải danh sách booking.');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        fetchBookings(false),
        queryClient.refetchQueries({ queryKey: ["partner-stats"] }),
      ]);
      toastSuccess('Đã làm mới dữ liệu.');
    } catch {
      toastError('Không thể làm mới dữ liệu.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderSkeletons = () => {
    return Array.from({ length: pageSize || 5 }).map((_, idx) => (
      <tr key={`skeleton-${idx}`} className="animate-pulse">
        <td className="px-6 py-4">
          <Skeleton className="h-4 w-4 rounded" />
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32 animate-pulse bg-slate-200" />
            <Skeleton className="h-3.5 w-24 animate-pulse bg-slate-200" />
            <Skeleton className="h-3 w-16 animate-pulse bg-slate-200" />
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28 animate-pulse bg-slate-200" />
            <Skeleton className="h-3.5 w-28 animate-pulse bg-slate-200" />
            <Skeleton className="h-3 w-20 animate-pulse bg-slate-200" />
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-20 animate-pulse bg-slate-200" />
            <Skeleton className="h-3 w-12 animate-pulse bg-slate-200" />
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-4 rounded-full animate-pulse bg-slate-200" />
            <Skeleton className="h-3.5 w-28 animate-pulse bg-slate-200" />
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex justify-center">
            <Skeleton className="h-6 w-24 rounded-full animate-pulse bg-slate-200" />
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-2">
            <Skeleton className="h-8 w-8 rounded animate-pulse bg-slate-200" />
            <Skeleton className="h-8 w-16 rounded animate-pulse bg-slate-200" />
          </div>
        </td>
      </tr>
    ));
  };

  const [cancelTargetId, setCancelTargetId] = useState<number | string | null>(null);

  const { confirm: quickConfirm, undo: undoConfirm, isPending: isPendingConfirm, remainingMs } = useQuickConfirm({
    onOptimisticConfirm: (id) => {
      setBookings((prev) => prev.map((b) => (
        b.id === id ? { ...b, status: 'Đã duyệt' as Booking['status'], rawStatus: 1 } : b
      )));
    },
    onUndo: () => fetchBookings(false),
    onConfirmed: () => {
      fetchBookings(false);
      queryClient.invalidateQueries({ queryKey: ["partner-stats"] });
    },
    onConflict: () => fetchBookings(false),
  });

  const handleApprove = (id: string | number) => {
    quickConfirm(id);
  };

  const handleReject = (id: string | number) => {
    setCancelTargetId(id);
  };

  const handleCancelSubmit = async (reason: string) => {
    if (cancelTargetId === null) return;
    try {
      await partnerService.cancelBooking(cancelTargetId, reason);
      fetchBookings();
      queryClient.invalidateQueries({ queryKey: ["partner-stats"] });
      toastSuccess('Đã huỷ booking.');
    } catch (e) {
      toastError('Huỷ booking thất bại.');
      throw e;
    }
  };

  const selectedIdArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  const toggleSelected = (id: number | string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        if (next.size >= 20 && !next.has(id)) {
          toastError('Chỉ được chọn tối đa 20 booking mỗi lần.');
          return next;
        }
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const toggleCurrentPage = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }

    const next = new Set<number | string>();
    displayBookings.slice(0, 20).forEach((booking) => next.add(booking.id));
    setSelectedIds(next);
  };

  const executeBulkConfirm = async () => {
    if (selectedIdArray.length === 0) return;
    try {
      const res: any = await partnerService.bulkConfirmBookings(selectedIdArray);
      const payload = res?.data?.data ?? res?.data ?? res;
      setBulkResult(payload);
      fetchBookings();
      queryClient.invalidateQueries({ queryKey: ["partner-stats"] });
      toastSuccess(`Đã xác nhận ${payload?.succeeded?.length ?? 0}/${selectedIdArray.length} booking.`);
      setIsBulkConfirmOpen(false);
      setSelectedIds(new Set());
    } catch {
      toastError('Xác nhận hàng loạt thất bại.');
    }
  };

  const handleBulkConfirmRequest = () => {
    if (selectedIdArray.length === 0) return;
    setIsBulkConfirmOpen(true);
  };

  const handleBulkCancelSubmit = async (reason: string) => {
    if (selectedIdArray.length === 0) return;
    try {
      const res: any = await partnerService.bulkCancelBookings(selectedIdArray, reason);
      const payload = res?.data?.data ?? res?.data ?? res;
      setBulkResult(payload);
      fetchBookings();
      queryClient.invalidateQueries({ queryKey: ["partner-stats"] });
      toastSuccess(`Đã huỷ ${payload?.succeeded?.length ?? 0}/${selectedIdArray.length} booking.`);
    } catch (e) {
      toastError('Huỷ hàng loạt thất bại.');
      throw e;
    }
  };

  const handleCheckIn = async (id: string | number) => {
    try {
      setActionLoadingId(id);
      await partnerService.checkIn(id);
      
      // Update local state immediately for better UX
      setBookings(prev => prev.map(b => 
        b.id === id ? { ...b, stay_status: 'checked_in' } : b
      ));
      
      toastSuccess('Check-in thành công!');
      
      // Invalidate stats so the "In Stay" / "Check-in today" cards update
      queryClient.invalidateQueries({ queryKey: ["partner-stats"] });

      // Close modal if open
      setActionConfirmModalOpen(false);

      // Silent refresh to sync all data without showing global loader
      fetchBookings(false);
    } catch {
      toastError('Lỗi khi thực hiện check-in.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCheckOut = async (id: string | number) => {
    try {
      setActionLoadingId(id);
      await partnerService.checkOut(id);
      
      // Update local state immediately
      setBookings(prev => prev.map(b => 
        b.id === id ? { ...b, stay_status: 'checked_out' } : b
      ));
      
      toastSuccess('Check-out hoàn tất!');
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: ["partner-stats"] });

      // Close modal if open
      setActionConfirmModalOpen(false);

      // Silent refresh
      fetchBookings(false);
    } catch {
      toastError('Lỗi khi thực hiện check-out.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const requestActionConfirm = (booking: BookingRow, type: 'check_in' | 'check_out') => {
    setActionTargetBooking(booking);
    setActionType(type);
    setActionConfirmModalOpen(true);
  };

  const executeActionConfirm = () => {
    if (!actionTargetBooking || !actionType) return;
    if (actionType === 'check_in') {
      handleCheckIn(actionTargetBooking.id);
    } else {
      handleCheckOut(actionTargetBooking.id);
    }
  };

  const filteredBookings = useMemo(() => {
    // Since we now filter on the server, filteredBookings is just the current page's bookings.
    // We keep the memo to minimize downstream re-renders.
    return bookings;
  }, [bookings]);

  const displayBookings = filteredBookings;

  const statusTabs: Array<{ key: BookingStatusFilter; label: string; count: number }> = [
    { key: 'all', label: 'Tất cả', count: globalStats?.totalBookingsCount ?? totalItems },
    { key: 0, label: 'Chờ duyệt', count: globalStats?.pendingBookingsCount ?? 0 },
    { key: 1, label: 'Đã duyệt', count: globalStats?.confirmedBookingsCount ?? 0 },
    { key: 'in_stay', label: 'Đang ở', count: globalStats?.inStayCount ?? 0 },
    { key: 4, label: 'Chờ duyệt hủy', count: globalStats?.pendingCancellationCount ?? 0 },
    { key: 2, label: 'Đã hủy', count: globalStats?.cancelledBookingsCount ?? 0 },
    { key: 3, label: 'Đã hoàn thành', count: globalStats?.completedBookingsCount ?? 0 },
  ];

  const exportCsv = () => {
    const headers = [
      'id',
      'guestName',
      'phone',
      'roomName',
      'propertyName',
      'checkIn',
      'checkOut',
      'status',
      'totalAmount',
      'note',
    ];

    const rows = filteredBookings.map((b) => [
      b.id,
      b.guestName,
      b.phone ?? '',
      b.roomName,
      b.propertyName ?? '',
      b.checkIn,
      b.checkOut,
      getPartnerRowDisplayStatus(b.rawStatus ?? 1, b.stay_status),
      b.totalAmount,
      (b.note ?? '').replace(/\r?\n/g, ' '),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partner-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const targetBooking = bookings.find((b) => b.id === cancelTargetId);
  const isRejecting = targetBooking ? targetBooking.rawStatus === 0 : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đặt phòng</h1>
          <p className="mt-1 text-gray-500">Theo dõi, duyệt nhanh và tra cứu booking theo khách/phòng.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCsv} variant="outline" className="gap-2">
            <FileDown size={16} /> Xuất CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Chờ duyệt</p>
          <div className="mt-3 flex items-end justify-between">
            {statsLoading ? <Skeleton className="h-9 w-12" /> : <h3 className="text-3xl font-black text-amber-600">{globalStats?.pendingBookingsCount || 0}</h3>}
            <div className="rounded-full bg-amber-50 p-2 text-amber-500">
              <Clock size={20} />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Cần xử lý ngay</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Đang ở</p>
          <div className="mt-3 flex items-end justify-between">
            {statsLoading ? <Skeleton className="h-9 w-12" /> : <h3 className="text-3xl font-black text-violet-600">{globalStats?.inStayCount || 0}</h3>}
            <div className="rounded-full bg-violet-50 p-2 text-violet-500">
              <UserCheck size={20} />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Khách đang lưu trú</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Check-in hôm nay</p>
          <div className="mt-3 flex items-end justify-between">
            {statsLoading ? <Skeleton className="h-9 w-12" /> : <h3 className="text-3xl font-black text-emerald-600">{globalStats?.todayCheckInCount || 0}</h3>}
            <div className="rounded-full bg-emerald-50 p-2 text-emerald-500">
              <LogIn size={20} />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Dự kiến đến</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Check-out hôm nay</p>
          <div className="mt-3 flex items-end justify-between">
            {statsLoading ? <Skeleton className="h-9 w-12" /> : <h3 className="text-3xl font-black text-blue-600">{globalStats?.todayCheckOutCount || 0}</h3>}
            <div className="rounded-full bg-blue-50 p-2 text-blue-500">
              <LogOut size={20} />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Dự kiến đi</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên khách, số điện thoại, mã phòng..."
            className="pl-10"
          />
          {(searchTerm || statusFilter !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-2 text-xs text-slate-500 hover:text-blue-600 sm:absolute sm:right-2 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <Button
                key={String(tab.key)}
                size="sm"
                variant={statusFilter === tab.key ? 'default' : 'outline'}
                onClick={() => setStatusFilter(tab.key)}
                className="rounded-full"
              >
                {tab.label} ({tab.count})
              </Button>
            ))}
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 text-slate-600 hover:text-blue-600 hover:border-blue-200 active:scale-95 transition-all"
            disabled={loading || isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-500' : ''} />
            Làm mới
          </Button>
        </div>

        {isPartner360Enabled() && selectedIds.size > 0 && (
          <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-blue-900">Đã chọn {selectedIds.size}/20 booking</p>
              <p className="text-xs text-blue-700">Mỗi lần bulk action xử lý tối đa 20 booking; booking lỗi sẽ được trả trong danh sách failed.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleBulkConfirmRequest}>
                Xác nhận hàng loạt
              </Button>
              <Button size="sm" variant="outline" className="border-rose-200 text-rose-600" onClick={() => setBulkCancelOpen(true)}>
                Huỷ hàng loạt
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                Bỏ chọn
              </Button>
            </div>
          </div>
        )}

        {bulkResult && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold">
              Kết quả bulk action: {bulkResult.succeeded?.length ?? 0} thành công, {bulkResult.failed?.length ?? 0} thất bại.
            </p>
            {bulkResult.failed?.length ? (
              <p className="mt-1 text-xs text-rose-600">
                Failed: {bulkResult.failed.map((item) => `#${item.id}: ${item.reason}`).join('; ')}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">
                  <Checkbox
                    checked={displayBookings.length > 0 && displayBookings.every((booking) => selectedIds.has(booking.id))}
                    onCheckedChange={(checked) => toggleCurrentPage(Boolean(checked))}
                    aria-label="Chọn booking trên trang hiện tại"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Khách hàng / Phòng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Ngày nhận/Trả</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Ngày đặt</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Tòa nhà</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(loading || isRefreshing) ? (
                renderSkeletons()
              ) : displayBookings.length > 0 ? displayBookings.map((booking) => (
                <tr 
                  key={booking.id} 
                  className="transition-colors hover:bg-slate-50/30 cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <td className="px-6 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(booking.id)}
                      onCheckedChange={(checked) => toggleSelected(booking.id, Boolean(checked))}
                      aria-label={`Chọn booking ${booking.id}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight text-gray-800">
                        <User size={14} className="text-blue-500" /> {booking.guestName || 'Khách ẩn danh'}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                        <Home size={14} /> {booking.roomName || 'N/A'}
                      </span>
                      {booking.phone && (
                        <span className="mt-1 text-xs text-slate-400">SĐT: {booking.phone}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <Calendar size={12} className="text-emerald-600" />
                        Nhận: {formatPartnerBookingDateVi(booking.checkIn)}
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <Calendar size={12} className="text-amber-600" />
                        Trả: {formatPartnerBookingDateVi(booking.checkOut)}
                      </div>
                      {(() => {
                        const n = countPartnerBookingNightsExclusive(booking.checkIn, booking.checkOut);
                        if (n === null || n <= 0) {
                          return null;
                        }
                        return (
                          <p className="text-[11px] font-medium text-slate-500">{n} đêm lưu trú</p>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {booking.createdAt ? (
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1 font-semibold text-slate-600">
                          <Clock size={11} className="text-blue-400" />
                          {new Date(booking.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                        <p className="pl-4 text-[11px] text-slate-400">
                          {new Date(booking.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={14} className="text-slate-400" />
                      {booking.propertyName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${getPartnerBookingBadgeClass(
                        booking.rawStatus ?? 1,
                        booking.stay_status,
                      )}`}
                    >
                      {getPartnerRowDisplayStatus(booking.rawStatus ?? 1, booking.stay_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                       <Button
                         onClick={() => setSelectedBooking(booking)}
                         variant="outline"
                         size="sm"
                         className="h-8 px-2"
                       >
                         <Eye size={14} />
                       </Button>
                       {booking.rawStatus === 0 ? (
                         <>
                           <Button 
                             onClick={() => handleApprove(booking.id)} 
                             size="sm" 
                             className="h-8 gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 px-3 font-bold text-white shadow-sm transition-all hover:from-emerald-700 hover:to-teal-700"
                             disabled={loading}
                           >
                             <UserCheck size={14} />
                             Duyệt
                           </Button>
                           <Button onClick={() => handleReject(booking.id)} variant="outline" size="sm" className="h-8 border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700">Từ chối</Button>
                         </>
                       ) : isPendingConfirm(booking.id) ? (
                         <Button onClick={() => undoConfirm(booking.id)} variant="outline" size="sm" className="h-8 border-amber-300 px-3 text-amber-700 hover:bg-amber-50">
                           <Undo2 size={14} className="mr-1" />
                           Hoàn tác ({Math.ceil(remainingMs(booking.id) / 1000)}s)
                         </Button>
                       ) : booking.rawStatus === 1 && booking.stay_status === 'pending' ? (
                          <Button 
                            onClick={() => requestActionConfirm(booking, 'check_in')} 
                            size="sm" 
                            className={`
                              h-8 gap-1.5 px-3 font-bold text-white shadow-sm transition-all
                              bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700
                              ${new Date(booking.checkIn).toDateString() === new Date().toDateString() ? 'animate-pulse ring-2 ring-indigo-500/20' : ''}
                            `}
                            disabled={actionLoadingId === booking.id}
                          >
                             {actionLoadingId === booking.id ? (
                               <Loader2 className="h-4 w-4 animate-spin" />
                             ) : (
                               <LogIn size={14} />
                             )}
                            Check-in
                          </Button>
                       ) : booking.stay_status === 'checked_in' ? (
                          <Button 
                            onClick={() => requestActionConfirm(booking, 'check_out')} 
                            size="sm" 
                            className={`
                              h-8 gap-1.5 px-3 font-bold text-white shadow-sm transition-all
                              bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700
                              ${new Date(booking.checkOut).toDateString() === new Date().toDateString() ? 'animate-pulse ring-2 ring-amber-500/20' : ''}
                            `}
                            disabled={actionLoadingId === booking.id}
                          >
                             {actionLoadingId === booking.id ? (
                               <Loader2 className="h-4 w-4 animate-spin" />
                             ) : (
                               <LogOut size={14} />
                             )}
                            Check-out
                          </Button>
                       ) : null}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={7} className="px-6 py-20 text-center italic text-gray-400">Không có booking phù hợp bộ lọc hiện tại.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="border-t border-gray-100 bg-slate-50/30 p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            perPage={pageSize}
            onPerPageChange={(val) => {
              setPageSize(val);
              setCurrentPage(1);
            }}
            totalItems={totalItems}
            perPageOptions={[10, 20, 50, 100]}
          />
        </div>
      </div>

      <Dialog open={isBulkConfirmOpen} onOpenChange={setIsBulkConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <Clock className="animate-pulse" size={20} />
              Xác nhận phê duyệt hàng loạt
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              Bạn có chắc chắn muốn xác nhận <span className="font-bold text-emerald-600">{selectedIdArray.length}</span> booking đã chọn?
            </p>
            <p className="mt-2 text-xs text-slate-400 italic">
              * Hành động này sẽ gửi email thông báo thành công đến tất cả khách hàng tương ứng.
            </p>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="ghost" onClick={() => setIsBulkConfirmOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={executeBulkConfirm}>
              Xác nhận ngay
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết booking #{selectedBooking?.id}</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Khách hàng</p>
                  <p className="mt-1 font-semibold">{selectedBooking.guestName || 'N/A'}</p>
                  <p className="mt-1 text-slate-500">{selectedBooking.phone || 'Không có số điện thoại'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Phòng / Tòa nhà</p>
                  <p className="mt-1 font-semibold">{selectedBooking.roomName || 'N/A'}</p>
                  <p className="mt-1 text-slate-500">{selectedBooking.propertyName || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Ngày nhận phòng</p>
                  <p className="mt-1 font-semibold">{formatPartnerBookingDateVi(selectedBooking.checkIn)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Ngày trả phòng</p>
                  <p className="mt-1 font-semibold">{formatPartnerBookingDateVi(selectedBooking.checkOut)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Tổng tiền</p>
                  <p className="mt-1 font-semibold text-blue-700">{(selectedBooking.totalAmount || 0).toLocaleString('vi-VN')} đ</p>
                </div>
              </div>

              {(() => {
                const n = countPartnerBookingNightsExclusive(selectedBooking.checkIn, selectedBooking.checkOut);
                if (n === null || n <= 0) {
                  return null;
                }
                return (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-center text-sm font-semibold text-slate-700">
                    {n} đêm lưu trú
                  </div>
                );
              })()}

              {selectedBooking.createdAt && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-2.5">
                  <Clock size={14} className="shrink-0 text-blue-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-blue-400">Thời gian đặt phòng</p>
                    <p className="text-sm font-semibold text-blue-700">
                      {new Date(selectedBooking.createdAt).toLocaleString('vi-VN', {
                        weekday: 'long',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">Ghi chú khách hàng</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-700">{selectedBooking.note || 'Không có ghi chú.'}</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <Badge
                  variant="none"
                  className={`border px-3 py-1 font-semibold ${getPartnerBookingBadgeClass(
                    selectedBooking.rawStatus ?? 1,
                    selectedBooking.stay_status,
                  )}`}
                >
                  {getPartnerRowDisplayStatus(selectedBooking.rawStatus ?? 1, selectedBooking.stay_status)}
                </Badge>
                <div className="flex items-center gap-2">
                  {selectedBooking.rawStatus === 0 && (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold" 
                        onClick={() => handleReject(selectedBooking.id)}
                      >
                        Từ chối
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-sm" 
                        onClick={() => handleApprove(selectedBooking.id)}
                      >
                        Duyệt booking
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CancelBookingDialog
        open={cancelTargetId !== null}
        bookingId={cancelTargetId}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleCancelSubmit}
        title={isRejecting ? `Xác nhận từ chối booking #${cancelTargetId}` : undefined}
        description={isRejecting ? "Vui lòng nhập lý do từ chối booking này. Lý do sẽ được lưu lại và gửi tới khách hàng." : undefined}
        confirmText="Từ chối booking"
      />

      <CancelBookingDialog
        open={bulkCancelOpen}
        bookingId={`${selectedIds.size} booking`}
        onClose={() => setBulkCancelOpen(false)}
        onConfirm={handleBulkCancelSubmit}
      />

      <Dialog open={actionConfirmModalOpen} onOpenChange={setActionConfirmModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${actionType === 'check_in' ? 'text-indigo-600' : 'text-amber-600'}`}>
              {actionType === 'check_in' ? <LogIn size={20} /> : <LogOut size={20} />}
              {actionType === 'check_in' ? 'Xác nhận Nhận phòng (Check-in)' : 'Xác nhận Trả phòng (Check-out)'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className={`rounded-xl border p-4 ${actionType === 'check_in' ? 'border-indigo-100 bg-indigo-50/50' : 'border-amber-100 bg-amber-50/50'}`}>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Khách hàng:</span>
                  <span className="font-bold">{actionTargetBooking?.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phòng:</span>
                  <span className="font-semibold text-slate-900">{actionTargetBooking?.roomName}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/50 pt-2">
                  <span className="text-slate-500">Tổng tiền:</span>
                  <span className="font-bold text-emerald-600">
                    {actionTargetBooking?.totalAmount.toLocaleString()} VNĐ
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-slate-600">
              {actionType === 'check_in' 
                ? 'Bạn có chắc chắn khách hàng đã đến và tiến hành nhận phòng? Hệ thống sẽ ghi nhận trạng thái Đang lưu trú.'
                : 'Bạn có chắc chắn khách hàng đã hoàn tất thanh toán và trả phòng? Phiên lưu trú sẽ được đánh dấu Hoàn thành.'}
            </p>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="ghost" onClick={() => setActionConfirmModalOpen(false)}>
              Hủy
            </Button>
            <Button 
              disabled={actionLoadingId !== null}
              onClick={executeActionConfirm}
              className={actionType === 'check_in' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}
            >
              {actionLoadingId !== null ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}
              {actionType === 'check_in' ? 'Xác nhận Check-in' : 'Xác nhận Check-out'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bookings;

