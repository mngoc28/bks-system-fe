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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { usePartnerStatsQuery } from '@/hooks/usePartnerDashboardQuery';
import CancelBookingDialog from './components/CancelBookingDialog';
import { useQuickConfirm } from '@/hooks/Partner/useQuickConfirm';
import { isPartner360Enabled } from '@/lib/featureFlags';
import { Undo2 } from 'lucide-react';
import {
  countPartnerBookingNightsExclusive,
  formatPartnerBookingDateVi,
  getPartnerBookingBadgeClass,
  getPartnerRowDisplayStatus,
  normalizePartnerBookingStatusCode,
  partnerBaseStatusLabel,
} from '@/utils/partnerBookingDisplay';

type BookingStatusFilter = 'all' | 0 | 1 | 2 | 3 | 'in_stay';

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
  const { data: globalStats, isLoading: statsLoading } = usePartnerStatsQuery();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [bulkResult, setBulkResult] = useState<{ succeeded: number[]; failed: Array<{ id: number; reason: string }> } | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, pageSize]);


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

  const isInStay = (booking: BookingRow): boolean => {
    return booking.stay_status === 'checked_in';
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res: any = await partnerService.getBookings({ 
        page: currentPage,
        per_page: pageSize 
      });
      
      const payload = res?.status ? res : (res?.data ?? res);
      let data: any[] = [];
      let total = 0;
      let lastPage = 1;

      // Detection logic
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        data = payload.data?.data || (Array.isArray(payload.data) ? payload.data : (payload.data || []));
        const meta = payload.meta || payload;
        if (meta.total !== undefined) {
          total = meta.total;
          lastPage = meta.last_page || 1;
        } else {
          total = data.length;
          lastPage = Math.ceil(total / pageSize);
        }
      } else {
        data = Array.isArray(payload) ? payload : [];
        total = data.length;
        lastPage = Math.ceil(total / pageSize);
      }

      setBookings(normalizeBookings(data));
      setTotalItems(total);
      setTotalPages(lastPage);
      setSelectedIds(new Set());
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toastError('Không thể tải danh sách booking.');
    } finally {
      setLoading(false);
    }
  };

  const [cancelTargetId, setCancelTargetId] = useState<number | string | null>(null);

  const { confirm: quickConfirm, undo: undoConfirm, isPending: isPendingConfirm, remainingMs } = useQuickConfirm({
    onOptimisticConfirm: (id) => {
      setBookings((prev) => prev.map((b) => (
        b.id === id ? { ...b, status: 'Đã duyệt' as Booking['status'], rawStatus: 1 } : b
      )));
    },
    onUndo: () => fetchBookings(),
    onConfirmed: () => fetchBookings(),
    onConflict: () => fetchBookings(),
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

  const handleBulkConfirm = async () => {
    if (selectedIdArray.length === 0) return;
    try {
      const res: any = await partnerService.bulkConfirmBookings(selectedIdArray);
      const payload = res?.data?.data ?? res?.data ?? res;
      setBulkResult(payload);
      fetchBookings();
      toastSuccess(`Đã xác nhận ${payload?.succeeded?.length ?? 0}/${selectedIdArray.length} booking.`);
    } catch {
      toastError('Xác nhận hàng loạt thất bại.');
    }
  };

  const handleBulkCancelSubmit = async (reason: string) => {
    if (selectedIdArray.length === 0) return;
    try {
      const res: any = await partnerService.bulkCancelBookings(selectedIdArray, reason);
      const payload = res?.data?.data ?? res?.data ?? res;
      setBulkResult(payload);
      fetchBookings();
      toastSuccess(`Đã huỷ ${payload?.succeeded?.length ?? 0}/${selectedIdArray.length} booking.`);
    } catch (e) {
      toastError('Huỷ hàng loạt thất bại.');
      throw e;
    }
  };

  const handleCheckIn = async (id: string | number) => {
    try {
      await partnerService.checkIn(id);
      fetchBookings();
      toastSuccess('Check-in thành công!');
    } catch {
      toastError('Lỗi khi thực hiện check-in.');
    }
  };

  const handleCheckOut = async (id: string | number) => {
    try {
      await partnerService.checkOut(id);
      fetchBookings();
      toastSuccess('Check-out hoàn tất!');
    } catch {
      toastError('Lỗi khi thực hiện check-out.');
    }
  };

  const filteredBookings = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchedStatus = statusFilter === 'all'
        || (statusFilter === 'in_stay' ? isInStay(booking) : booking.rawStatus === statusFilter);
      if (!matchedStatus) return false;

      if (!keyword) return true;

      const haystack = [
        booking.guestName,
        booking.roomName,
        booking.propertyName,
        booking.phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [bookings, statusFilter, searchTerm]);

  // Derived slice for display - handles fallback when server returns full list
  const displayBookings = useMemo(() => {
    // If the number of filtered items matches the total but is more than pageSize, 
    // it's likely we need to slice client-side.
    if (filteredBookings.length > pageSize && totalItems === bookings.length) {
      return filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }
    return filteredBookings;
  }, [filteredBookings, currentPage, pageSize, totalItems, bookings.length]);

  const statusTabs: Array<{ key: BookingStatusFilter; label: string; count: number }> = [
    { key: 'all', label: 'Tất cả', count: totalItems },
    { key: 0, label: 'Chờ duyệt', count: globalStats?.pendingBookingsCount || 0 },
    { key: 1, label: 'Đã duyệt', count: globalStats?.confirmedBookingsCount || 0 },
    { key: 'in_stay', label: 'Đang ở', count: globalStats?.inStayCount || 0 },
    { key: 2, label: 'Đã hủy', count: globalStats?.cancelledBookingsCount || 0 },
    { key: 3, label: 'Đã hoàn thành', count: bookings.filter((b) => b.rawStatus === 3).length },
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

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

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
        </div>

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

        {isPartner360Enabled() && selectedIds.size > 0 && (
          <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-blue-900">Đã chọn {selectedIds.size}/20 booking</p>
              <p className="text-xs text-blue-700">Mỗi lần bulk action xử lý tối đa 20 booking; booking lỗi sẽ được trả trong danh sách failed.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleBulkConfirm}>
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

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
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
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Tòa nhà</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayBookings.length > 0 ? displayBookings.map((booking) => (
                <tr key={booking.id} className="transition-colors hover:bg-slate-50/30">
                  <td className="px-6 py-4 align-top">
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
                  <td className="px-6 py-4 text-right">
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
                           <Button onClick={() => handleApprove(booking.id)} size="sm" className="h-8 bg-emerald-600 px-3 font-bold text-white hover:bg-emerald-700">Duyệt</Button>
                           <Button onClick={() => handleReject(booking.id)} variant="outline" size="sm" className="h-8 border-red-200 px-3 text-red-600">Hủy</Button>
                         </>
                       ) : isPendingConfirm(booking.id) ? (
                         <Button onClick={() => undoConfirm(booking.id)} variant="outline" size="sm" className="h-8 border-amber-300 px-3 text-amber-700 hover:bg-amber-50">
                           <Undo2 size={14} className="mr-1" />
                           Hoàn tác ({Math.ceil(remainingMs(booking.id) / 1000)}s)
                         </Button>
                       ) : booking.rawStatus === 1 && booking.stay_status === 'pending' ? (
                          <Button onClick={() => handleCheckIn(booking.id)} size="sm" className="h-8 bg-blue-600 px-3 font-bold text-white hover:bg-blue-700">Check-in</Button>
                       ) : booking.stay_status === 'checked_in' ? (
                          <Button onClick={() => handleCheckOut(booking.id)} size="sm" className="h-8 bg-amber-600 px-3 font-bold text-white hover:bg-amber-700">Check-out</Button>
                       ) : null}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={6} className="px-6 py-20 text-center italic text-gray-400">Không có booking phù hợp bộ lọc hiện tại.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-slate-50/30 p-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-xs font-medium text-slate-500">Hiển thị mỗi trang</span>
            <Select 
              value={String(pageSize)} 
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-20 bg-white">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-2 text-xs text-slate-400">
              Tổng {totalItems} kết quả
            </span>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>
              
              <div className="mx-2 flex items-center gap-1">
                <span className="text-xs font-bold text-slate-700">Trang {currentPage}</span>
                <span className="text-xs text-slate-400">/ {totalPages}</span>
              </div>

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedBooking(null)}
                    className="text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Đóng
                  </Button>
                  
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
      />

      <CancelBookingDialog
        open={bulkCancelOpen}
        bookingId={`${selectedIds.size} booking`}
        onClose={() => setBulkCancelOpen(false)}
        onConfirm={handleBulkCancelSubmit}
      />
    </div>
  );
};

export default Bookings;

