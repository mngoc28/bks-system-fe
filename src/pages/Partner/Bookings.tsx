import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Image as ImageIcon,
  ExternalLink,
  ShieldAlert,
  UserX,
  Info,
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
  canMarkPartnerBookingNoShow,
  getPartnerBookingBadgeClass,
  getPartnerDepositDisplay,
  getPartnerPaymentDisplay,
  getPartnerRowDisplayStatus,
  getPartnerStatusSubBadge,
  isPartnerCheckInDepositLocked,
  normalizePartnerBookingStatusCode,
  partnerBaseStatusLabel,
} from '@/utils/partnerBookingDisplay';
import FrontDeskPanel from './Bookings/FrontDeskPanel';
import TodayOperationsPanel, { type TodayBookingRow } from './Bookings/TodayOperationsPanel';
import {
  HorizontalChipScroller,
  PartnerSectionCard,
  PartnerSectionHeader,
} from './components/ResponsiveBlocks';

type BookingStatusFilter =
  | 'all'
  | 0
  | 1
  | 2
  | 3
  | 4
  | 'in_stay'
  | 'no_show'
  | 'deposit_unpaid'
  | 'deposit_submitted'
  | 'payment_unpaid';

interface BookingRow extends Booking {
  phone?: string;
  note?: string;
  propertyName?: string;
  roomId?: number;
  propertyId?: number;
  rawStatus?: number;
  createdAt?: string;
  deposit_amount?: number;
  deposit_status?: string;
  payment_status?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  no_show_at?: string;
  bookingDeposit?: {
    id: number;
    amount: number;
    status: string;
    receipt_path: string | null;
    created_at: string;
  } | null;
}

const parseBookingsStatusFromUrl = (raw: string | null): BookingStatusFilter | null => {
  if (!raw) return null;
  if (raw === 'pending' || raw === '0') return 0;
  if (raw === 'in_stay') return 'in_stay';
  if (raw === 'no_show') return 'no_show';
  if (raw === 'deposit_unpaid') return 'deposit_unpaid';
  if (raw === 'deposit_submitted') return 'deposit_submitted';
  if (raw === 'payment_unpaid') return 'payment_unpaid';
  const numeric = Number(raw);
  if (Number.isInteger(numeric) && numeric >= 0 && numeric <= 4) {
    return numeric as BookingStatusFilter;
  }
  return null;
};

const Bookings: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { data: globalStats, isLoading: statsLoading } = usePartnerStatsQuery();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>(() => {
    return parseBookingsStatusFromUrl(searchParams.get('status')) ?? 'all';
  });
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
  const [noShowTargetId, setNoShowTargetId] = useState<number | string | null>(null);
  const [noShowCount, setNoShowCount] = useState(0);
  const [depositUnpaidCount, setDepositUnpaidCount] = useState(0);
  const [depositSubmittedCount, setDepositSubmittedCount] = useState(0);
  const [paymentUnpaidCount, setPaymentUnpaidCount] = useState(0);
  const [todayPanelKey, setTodayPanelKey] = useState(0);

  // View state & Lightbox state
  const [viewMode, setViewMode] = useState<'list' | 'today' | 'front_desk'>('list');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

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

  const bookingIdFromUrl = searchParams.get('id');

  useEffect(() => {
    if (!bookingIdFromUrl) {
      return;
    }
    setSearchTerm(bookingIdFromUrl);
    setStatusFilter('all');
  }, [bookingIdFromUrl]);

  useEffect(() => {
    if (!bookingIdFromUrl || bookings.length === 0) {
      return;
    }
    const found = bookings.find((b) => String(b.id) === bookingIdFromUrl);
    if (found) {
      setSelectedBooking(found);
    }
  }, [bookingIdFromUrl, bookings]);

  useEffect(() => {
    const abortController = new AbortController();
    const parseTotal = (res: any): number => {
      const resBody = res?.data || res;
      const paginator =
        resBody?.data && typeof resBody.data === 'object' && !Array.isArray(resBody.data)
          ? resBody.data
          : resBody;
      return Number(paginator.total ?? 0);
    };

    const loadFinanceCounts = async () => {
      try {
        const [noShowRes, depositUnpaidRes, depositSubmittedRes, paymentUnpaidRes] = await Promise.all([
          partnerService.getBookings(
            { status: 1, stay_status: 'no_show', per_page: 1, page: 1 },
            { signal: abortController.signal },
          ),
          partnerService.getBookings(
            { status: 1, deposit_status: 'pending', per_page: 1, page: 1 },
            { signal: abortController.signal },
          ),
          partnerService.getBookings(
            { status: 1, deposit_status: 'payment_submitted', per_page: 1, page: 1 },
            { signal: abortController.signal },
          ),
          partnerService.getBookings(
            { payment_status: 'unpaid', per_page: 1, page: 1 },
            { signal: abortController.signal },
          ),
        ]);
        setNoShowCount(parseTotal(noShowRes));
        setDepositUnpaidCount(parseTotal(depositUnpaidRes));
        setDepositSubmittedCount(parseTotal(depositSubmittedRes));
        setPaymentUnpaidCount(parseTotal(paymentUnpaidRes));
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }
      }
    };
    void loadFinanceCounts();
    return () => abortController.abort();
  }, [todayPanelKey, bookings]);

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
        deposit_amount: item.deposit_amount != null ? Number(item.deposit_amount) : undefined,
        deposit_status: item.deposit_status ?? undefined,
        payment_status: item.payment_status ?? 'unpaid',
        cancellation_reason: item.cancellation_reason ?? undefined,
        cancelled_at: item.cancelled_at ?? undefined,
        no_show_at: item.no_show_at ?? undefined,
        bookingDeposit: item.booking_deposit ?? item.booking_deposits ?? undefined,
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
      } else if (statusFilter === 'no_show') {
        params.stay_status = 'no_show';
        params.status = 1;
      } else if (statusFilter === 'deposit_unpaid') {
        params.status = 1;
        params.deposit_status = 'pending';
      } else if (statusFilter === 'deposit_submitted') {
        params.status = 1;
        params.deposit_status = 'payment_submitted';
      } else if (statusFilter === 'payment_unpaid') {
        params.payment_status = 'unpaid';
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
        <td className="px-6 py-4">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-32 rounded-full animate-pulse bg-slate-200" />
            <Skeleton className="h-5 w-28 rounded-full animate-pulse bg-slate-200" />
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
      setTodayPanelKey((k) => k + 1);

      // Silent refresh to sync all data without showing global loader
      fetchBookings(false);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Lỗi khi thực hiện check-in.';
      toastError(errMsg);
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
      setTodayPanelKey((k) => k + 1);

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

  const handleNoShow = async (id: string | number) => {
    try {
      setActionLoadingId(id);
      await partnerService.noShowBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, stay_status: 'no_show' } : b)),
      );
      toastSuccess('Đã đánh dấu khách không đến.');
      setNoShowTargetId(null);
      setSelectedBooking(null);
      setTodayPanelKey((k) => k + 1);
      queryClient.invalidateQueries({ queryKey: ['partner-stats'] });
      fetchBookings(false);
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || 'Không thể đánh dấu no-show.';
      toastError(errMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openTodayBookingDetail = (booking: TodayBookingRow) => {
    setSelectedBooking({
      id: booking.id,
      guestName: booking.guestName,
      roomName: booking.roomName,
      propertyName: booking.propertyName,
      phone: booking.phone,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalAmount: booking.totalAmount,
      status: getPartnerRowDisplayStatus(booking.rawStatus ?? 1, booking.stay_status),
      rawStatus: booking.rawStatus,
      stay_status: booking.stay_status as BookingRow['stay_status'],
      deposit_amount: booking.deposit_amount,
      deposit_status: booking.deposit_status,
      payment_status: booking.payment_status,
      cancellation_reason: booking.cancellation_reason,
      cancelled_at: booking.cancelled_at,
      no_show_at: booking.no_show_at,
    });
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
    { key: 'no_show', label: 'Không đến', count: noShowCount },
    { key: 4, label: 'Chờ duyệt hủy', count: globalStats?.pendingCancellationCount ?? 0 },
    { key: 2, label: 'Đã hủy', count: globalStats?.cancelledBookingsCount ?? 0 },
    { key: 3, label: 'Đã hoàn thành', count: globalStats?.completedBookingsCount ?? 0 },
  ];

  const financeTabs: Array<{ key: BookingStatusFilter; label: string; count: number }> = [
    { key: 'deposit_unpaid', label: 'Chưa cọc', count: depositUnpaidCount },
    { key: 'deposit_submitted', label: 'Chờ duyệt biên lai', count: depositSubmittedCount },
    { key: 'payment_unpaid', label: 'Chưa thanh toán đơn', count: paymentUnpaidCount },
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
      'statusDetail',
      'deposit',
      'payment',
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
      getPartnerStatusSubBadge(
        b.rawStatus,
        b.stay_status,
        b.deposit_status,
        b.cancellation_reason,
      )?.label ?? '',
      getPartnerDepositDisplay(b.deposit_status, b.deposit_amount)?.label ?? 'Không yêu cầu cọc',
      getPartnerPaymentDisplay(b.payment_status, b.totalAmount).label,
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
      <PartnerSectionCard className="border-gray-100">
        <PartnerSectionHeader
          title="Quản lý Đặt phòng"
          description="Theo dõi, duyệt nhanh và tra cứu booking theo khách/phòng."
          actions={(
            <Button onClick={exportCsv} variant="outline" className="gap-2">
              <FileDown size={16} /> Xuất CSV
            </Button>
          )}
        />
      </PartnerSectionCard>

      <div className="flex gap-3 overflow-x-auto border-b border-slate-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setViewMode('list')}
          className={`relative shrink-0 pb-3 text-sm font-bold transition-all ${
            viewMode === 'list' 
              ? 'text-slate-900 border-b-2 border-slate-900' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Danh sách đặt phòng
        </button>
        <button
          onClick={() => setViewMode('today')}
          className={`relative shrink-0 pb-3 text-sm font-bold transition-all flex items-center gap-1.5 ${
            viewMode === 'today'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Vận hành hôm nay
        </button>
        <button
          onClick={() => setViewMode('front_desk')}
          className={`relative shrink-0 pb-3 text-sm font-bold transition-all flex items-center gap-1.5 ${
            viewMode === 'front_desk' 
              ? 'text-rose-600 border-b-2 border-rose-600' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Duyệt cọc
        </button>
      </div>

      {viewMode === 'today' ? (
        <TodayOperationsPanel
          actionLoadingId={actionLoadingId}
          operationsRefreshKey={todayPanelKey}
          onRefreshStats={handleRefresh}
          onCheckIn={(booking) =>
            requestActionConfirm(
              {
                ...booking,
                status: getPartnerRowDisplayStatus(booking.rawStatus ?? 1, booking.stay_status),
              } as BookingRow,
              'check_in',
            )
          }
          onCheckOut={(booking) =>
            requestActionConfirm(
              {
                ...booking,
                status: getPartnerRowDisplayStatus(booking.rawStatus ?? 1, booking.stay_status),
              } as BookingRow,
              'check_out',
            )
          }
          onNoShow={setNoShowTargetId}
          onViewDetail={openTodayBookingDetail}
          onGoToDepositDesk={() => setViewMode('front_desk')}
        />
      ) : viewMode === 'front_desk' ? (
        <FrontDeskPanel onRefreshStats={handleRefresh} />
      ) : (
        <>
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
        <div className="flex gap-3 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm text-sky-950">
          <Info size={18} className="mt-0.5 shrink-0 text-sky-600" />
          <div className="space-y-1 text-xs leading-relaxed sm:text-sm">
            <p className="font-bold text-sky-900">Giải phóng phòng trên hệ thống</p>
            <p>
              <span className="font-semibold">Hủy tự động</span> — đơn <span className="font-semibold">Chờ duyệt</span> quá hạn cọc
              → tab <span className="font-semibold">Đã hủy</span> (badge &quot;Hủy tự động&quot;, hệ thống quét ~10 phút/lần).
            </p>
            <p>
              <span className="font-semibold">Không đến</span> — đơn <span className="font-semibold">Đã duyệt</span>, khách không nhận phòng
              → lễ tân bấm thủ công → tab <span className="font-semibold">Không đến</span> (phòng đưa lại kho bán).
            </p>
          </div>
        </div>

        <div className="max-w-lg space-y-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400"
              size={16}
              aria-hidden
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm khách, SĐT, mã phòng..."
              className="h-10 pl-10 pr-3 text-sm"
            />
          </div>
          {(searchTerm || statusFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="h-8 px-2 text-xs text-slate-500 hover:text-blue-600"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <HorizontalChipScroller className="min-w-0 flex-1">
              {statusTabs.map((tab) => (
                <Button
                  key={String(tab.key)}
                  size="sm"
                  variant={statusFilter === tab.key ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(tab.key)}
                  className="shrink-0 rounded-full"
                >
                  {tab.label} ({tab.count})
                </Button>
              ))}
            </HorizontalChipScroller>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="icon"
              className="size-9 shrink-0 text-slate-600 hover:border-blue-200 hover:text-blue-600 active:scale-95"
              disabled={loading || isRefreshing}
              aria-label="Làm mới"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-blue-500' : ''} />
            </Button>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Tài chính</span>
            <HorizontalChipScroller className="mt-2">
              {financeTabs.map((tab) => (
                <Button
                  key={String(tab.key)}
                  size="sm"
                  variant={statusFilter === tab.key ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`rounded-full ${statusFilter === tab.key ? 'bg-slate-800 hover:bg-slate-900' : ''}`}
                >
                  {tab.label}
                  {tab.count > 0 ? ` (${tab.count})` : ''}
                </Button>
              ))}
            </HorizontalChipScroller>
          </div>
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

      <div className="space-y-3 md:hidden">
        {(loading || isRefreshing) ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={`booking-mobile-skeleton-${idx}`} className="rounded-xl border border-slate-200 bg-white p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-32" />
              <Skeleton className="mt-4 h-8 w-full" />
            </div>
          ))
        ) : displayBookings.length > 0 ? (
          displayBookings.map((booking) => (
            <div key={`mobile-${booking.id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{booking.guestName || 'Khách ẩn danh'}</p>
                  <p className="text-xs text-slate-500">#{booking.id} • {booking.roomName || 'N/A'}</p>
                </div>
                <Badge className={`text-[10px] ${getPartnerBookingBadgeClass(booking.rawStatus ?? 1, booking.stay_status)}`}>
                  {getPartnerRowDisplayStatus(booking.rawStatus ?? 1, booking.stay_status)}
                </Badge>
              </div>
              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <p>Nhận: {formatPartnerBookingDateVi(booking.checkIn)}</p>
                <p>Trả: {formatPartnerBookingDateVi(booking.checkOut)}</p>
                <p>Tòa nhà: {booking.propertyName || 'N/A'}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => setSelectedBooking(booking)} variant="outline" size="sm" className="h-8">
                  <Eye size={14} className="mr-1" /> Chi tiết
                </Button>
                {booking.rawStatus === 0 ? (
                  <>
                    <Button onClick={() => handleApprove(booking.id)} size="sm" className="h-8">
                      Duyệt
                    </Button>
                    <Button onClick={() => handleReject(booking.id)} variant="outline" size="sm" className="h-8 border-red-200 text-red-600">
                      Từ chối
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
            Không có booking phù hợp bộ lọc hiện tại.
          </div>
        )}
      </div>

      <div className="relative hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
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
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Cọc & Thanh toán</th>
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
                  <td className="px-6 py-4 align-top">
                    {(() => {
                      const deposit = getPartnerDepositDisplay(booking.deposit_status, booking.deposit_amount);
                      const payment = getPartnerPaymentDisplay(booking.payment_status, booking.totalAmount);
                      return (
                        <div className="flex max-w-[220px] flex-col gap-1.5">
                          {deposit ? (
                            <div>
                              <span
                                className={`inline-flex max-w-full truncate rounded-full border px-2 py-0.5 text-[10px] font-bold ${deposit.badgeClass}`}
                                title={deposit.label}
                              >
                                {deposit.label}
                              </span>
                              {deposit.hint && (
                                <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{deposit.hint}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400">Không yêu cầu cọc</span>
                          )}
                          <div>
                            <span
                              className={`inline-flex max-w-full truncate rounded-full border px-2 py-0.5 text-[10px] font-bold ${payment.badgeClass}`}
                              title={payment.label}
                            >
                              {payment.label}
                            </span>
                            {payment.hint && !deposit?.hint && (
                              <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{payment.hint}</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {(() => {
                      const subBadge = getPartnerStatusSubBadge(
                        booking.rawStatus,
                        booking.stay_status,
                        booking.deposit_status,
                        booking.cancellation_reason,
                      );
                      return (
                        <div className="inline-flex flex-col items-center gap-1">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${getPartnerBookingBadgeClass(
                              booking.rawStatus ?? 1,
                              booking.stay_status,
                            )}`}
                          >
                            {getPartnerRowDisplayStatus(booking.rawStatus ?? 1, booking.stay_status)}
                          </span>
                          {subBadge && (
                            <span
                              className={`inline-flex max-w-[140px] truncate rounded-full border px-2 py-0.5 text-[9px] font-bold ${subBadge.badgeClass}`}
                              title={subBadge.hint ?? subBadge.label}
                            >
                              {subBadge.label}
                            </span>
                          )}
                        </div>
                      );
                    })()}
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
                       ) : canMarkPartnerBookingNoShow(booking.rawStatus, booking.stay_status, booking.checkIn) ? (
                          <>
                            {!isPartnerCheckInDepositLocked(booking.deposit_amount, booking.deposit_status) && (
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
                            )}
                            <Button
                              onClick={() => setNoShowTargetId(booking.id)}
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 border-slate-300 px-2 text-slate-700 hover:bg-slate-50"
                              disabled={actionLoadingId === booking.id}
                            >
                              <UserX size={14} />
                              Không đến
                            </Button>
                          </>
                       ) : booking.rawStatus === 1 && booking.stay_status === 'pending' ? (
                          (() => {
                            const isCheckInLocked = isPartnerCheckInDepositLocked(booking.deposit_amount, booking.deposit_status);
                            if (isCheckInLocked) {
                              return (
                                <div className="relative group inline-block">
                                  <Button
                                    size="sm"
                                    className="h-8 gap-1.5 px-3 font-bold bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed shadow-none hover:bg-[#e2e8f0]"
                                    disabled
                                  >
                                    <LogIn size={14} />
                                    Check-in
                                  </Button>
                                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#fef2f2] text-[#991b1b] border border-[#fee2e2] rounded-lg shadow-lg z-50 text-xs text-left normal-case whitespace-normal">
                                    <p className="font-bold flex items-center gap-1">
                                      <ShieldAlert size={14} className="text-red-600 shrink-0" />
                                      Chặn Check-in cứng!
                                    </p>
                                    <p className="mt-1 font-medium text-slate-700">Đơn đặt phòng chưa hoàn tất thanh toán cọc hoặc cọc chưa được Lễ tân xác thực.</p>
                                  </div>
                                </div>
                              );
                            }
                            return (
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
                            );
                          })()
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
                   <td colSpan={8} className="px-6 py-20 text-center italic text-gray-400">Không có booking phù hợp bộ lọc hiện tại.</td>
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
        </>
      )}

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

              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <p className="text-xs font-bold uppercase text-slate-500">Thanh toán đơn</p>
                {(() => {
                  const payment = getPartnerPaymentDisplay(
                    selectedBooking.payment_status,
                    selectedBooking.totalAmount,
                  );
                  return (
                    <>
                      <Badge variant="none" className={`text-xs font-bold border px-2.5 py-0.5 ${payment.badgeClass}`}>
                        {payment.label}
                      </Badge>
                      {payment.hint && (
                        <p className="text-xs text-slate-500">{payment.hint}</p>
                      )}
                    </>
                  );
                })()}
              </div>

              {(selectedBooking.deposit_amount ?? 0) > 0 && (
                <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Thông tin đặt cọc</p>
                  {(() => {
                    const deposit = getPartnerDepositDisplay(
                      selectedBooking.deposit_status,
                      selectedBooking.deposit_amount,
                    );
                    return deposit ? (
                      <>
                        <Badge variant="none" className={`text-xs font-bold border px-2.5 py-0.5 ${deposit.badgeClass}`}>
                          {deposit.label}
                        </Badge>
                        {deposit.hint && (
                          <p className="text-xs text-slate-500">{deposit.hint}</p>
                        )}
                      </>
                    ) : null;
                  })()}
                  {selectedBooking.bookingDeposit?.receipt_path && (
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <ImageIcon size={14} className="text-emerald-500" />
                        Minh chứng chuyển khoản:
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReceipt(selectedBooking.bookingDeposit?.receipt_path || null)}
                        className="h-auto p-0 font-bold text-blue-600 hover:text-blue-800 hover:bg-transparent"
                      >
                        Xem minh chứng
                      </Button>
                    </div>
                  )}
                  {selectedBooking.rawStatus === 1 && ['pending', 'payment_submitted'].includes(selectedBooking.deposit_status || '') && (
                    <Button
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      onClick={async () => {
                        try {
                          await partnerService.confirmDeposit(selectedBooking.id);
                          toastSuccess(`Đã xác thực cọc thành công cho đơn #${selectedBooking.id}`);
                          setSelectedBooking(null);
                          setTodayPanelKey((k) => k + 1);
                          fetchBookings(false);
                        } catch {
                          toastError('Xác nhận đặt cọc thất bại.');
                        }
                      }}
                    >
                      Xác nhận đã nhận cọc
                    </Button>
                  )}
                </div>
              )}

              {(selectedBooking.rawStatus === 2 || selectedBooking.stay_status === 'no_show') && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-500">Giải phóng phòng</p>
                  {(() => {
                    const subBadge = getPartnerStatusSubBadge(
                      selectedBooking.rawStatus,
                      selectedBooking.stay_status,
                      selectedBooking.deposit_status,
                      selectedBooking.cancellation_reason,
                    );
                    return subBadge ? (
                      <>
                        <Badge variant="none" className={`text-xs font-bold border px-2.5 py-0.5 ${subBadge.badgeClass}`}>
                          {subBadge.label}
                        </Badge>
                        {subBadge.hint && <p className="text-xs text-slate-600">{subBadge.hint}</p>}
                      </>
                    ) : null;
                  })()}
                  {selectedBooking.cancellation_reason && (
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-500">Lý do: </span>
                      {selectedBooking.cancellation_reason}
                    </p>
                  )}
                  {selectedBooking.cancelled_at && (
                    <p className="text-xs text-slate-500">
                      Hủy lúc {new Date(selectedBooking.cancelled_at).toLocaleString('vi-VN')}
                    </p>
                  )}
                  {selectedBooking.no_show_at && (
                    <p className="text-xs text-slate-500">
                      Đánh dấu không đến lúc {new Date(selectedBooking.no_show_at).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex flex-col items-start gap-1">
                  <Badge
                    variant="none"
                    className={`border px-3 py-1 font-semibold ${getPartnerBookingBadgeClass(
                      selectedBooking.rawStatus ?? 1,
                      selectedBooking.stay_status,
                    )}`}
                  >
                    {getPartnerRowDisplayStatus(selectedBooking.rawStatus ?? 1, selectedBooking.stay_status)}
                  </Badge>
                  {(() => {
                    const subBadge = getPartnerStatusSubBadge(
                      selectedBooking.rawStatus,
                      selectedBooking.stay_status,
                      selectedBooking.deposit_status,
                      selectedBooking.cancellation_reason,
                    );
                    return subBadge ? (
                      <span className={`text-[10px] font-bold ${subBadge.badgeClass.includes('slate') ? 'text-slate-500' : 'text-rose-600'}`}>
                        {subBadge.label}
                      </span>
                    ) : null;
                  })()}
                </div>
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
                  {canMarkPartnerBookingNoShow(
                    selectedBooking.rawStatus,
                    selectedBooking.stay_status,
                    selectedBooking.checkIn,
                  ) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-slate-300 font-bold text-slate-700"
                      onClick={() => setNoShowTargetId(selectedBooking.id)}
                    >
                      <UserX size={14} />
                      Không đến
                    </Button>
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

      <Dialog open={noShowTargetId !== null} onOpenChange={(open) => !open && setNoShowTargetId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <UserX size={20} className="text-slate-600" />
              Xác nhận khách không đến (No-show)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600">
              Đánh dấu booking <strong>#{noShowTargetId}</strong> là khách không đến nhận phòng. Các ngày trên lịch sẽ được
              giải phóng để khách khác có thể đặt lại; đơn vẫn nằm tab <strong>Không đến</strong> (khác hủy tự động ở tab Đã hủy).
            </p>
            <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Chỉ áp dụng khi khách đã qua ngày nhận phòng mà không check-in.
            </p>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="ghost" onClick={() => setNoShowTargetId(null)}>
              Hủy
            </Button>
            <Button
              variant="outline"
              className="border-slate-400 font-semibold text-slate-800"
              disabled={actionLoadingId !== null}
              onClick={() => noShowTargetId !== null && handleNoShow(noShowTargetId)}
            >
              {actionLoadingId !== null ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}
              Xác nhận no-show
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Lightbox / Receipt image view */}
      <Dialog open={selectedReceipt !== null} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="sm:max-w-xl p-3">
          <DialogHeader className="pb-2 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <ImageIcon size={16} className="text-emerald-500" />
              Chi tiết minh chứng chuyển khoản cọc
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="flex flex-col items-center justify-center bg-slate-900 rounded-xl overflow-hidden mt-3 relative min-h-[300px]">
              <img
                src={selectedReceipt}
                alt="Minh chứng chuyển khoản"
                className="max-h-[60vh] object-contain w-full"
              />
              <div className="absolute bottom-2 right-2">
                <a
                  href={selectedReceipt}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-white/90 hover:bg-white text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 transition-colors"
                >
                  <ExternalLink size={12} />
                  Mở ảnh gốc
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bookings;

