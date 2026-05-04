import React, { useMemo, useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Home,
  Search,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  FileDown,
  BadgeDollarSign,
  Building2,
} from 'lucide-react';
import { Booking } from './types';
import { Button } from "@/components/ui/button";
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

type BookingStatusFilter = 'all' | 0 | 1 | 2 | 3 | 'in_stay';

interface BookingRow extends Booking {
  phone?: string;
  note?: string;
  buildingName?: string;
  roomId?: number;
  buildingId?: number;
  rawStatus?: number;
  createdAt?: string;
}

const Bookings: React.FC = () => {
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

  useEffect(() => {
    fetchBookings();
  }, [currentPage, pageSize]);


  const normalizeBookingStatus = (status: unknown): Booking['status'] => {
    if (typeof status === 'number') {
      if (status === 0) return 'Chờ duyệt';
      if (status === 1) return 'Đã duyệt';
      if (status === 2) return 'Đã hủy';
      return 'Đã hoàn thành';
    }

    const value = String(status || '').toLowerCase();
    if (value.includes('pending') || value.includes('cho duyet') || value.includes('chờ duyệt')) return 'Chờ duyệt';
    if (value.includes('confirm') || value.includes('approved') || value.includes('đã duyệt')) return 'Đã duyệt';
    if (value.includes('cancel') || value.includes('đã hủy')) return 'Đã hủy';
    if (value.includes('completed') || value.includes('đã hoàn thành')) return 'Đã hoàn thành';
    return 'Đã duyệt';
  };

  const normalizeStatusCode = (status: unknown): number => {
    if (typeof status === 'number') return status;
    const value = String(status || '').toLowerCase();
    if (value.includes('pending')) return 0;
    if (value.includes('confirm')) return 1;
    if (value.includes('cancel')) return 2;
    return 3;
  };

  const normalizeBookings = (rows: any[]): BookingRow[] => {
    return (rows || []).map((item: any) => ({
      id: item.id,
      guestName: item.guestName ?? item.user_name ?? item.customerName ?? '',
      roomName: item.roomName ?? item.room_name ?? item.room_number ?? '',
      checkIn: item.checkIn ?? item.start_date ?? item.check_in ?? '',
      checkOut: item.checkOut ?? item.end_date ?? item.check_out ?? '',
      totalAmount: Number(item.totalAmount ?? item.price ?? 0),
      status: normalizeBookingStatus(item.status ?? item.booking_status),
      rawStatus: normalizeStatusCode(item.status ?? item.booking_status),
      phone: item.phone ?? item.user_phone ?? '',
      note: item.note ?? '',
      buildingName: item.buildingName ?? item.building_name ?? '',
      roomId: item.room_id ? Number(item.room_id) : undefined,
      buildingId: item.building_id ? Number(item.building_id) : undefined,
      createdAt: item.createdAt ?? item.created_at ?? '',
      stay_status: item.stay_status || 'pending',
    }));
  };

  const isInStay = (booking: BookingRow): boolean => {
    if (booking.rawStatus !== 1 || !booking.checkIn || !booking.checkOut) {
      return false;
    }

    const today = new Date();
    const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    const from = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
    const to = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());

    return from <= current && current <= to;
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
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toastError('Không thể tải danh sách booking.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Chờ duyệt': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Đang ở': 
      case 'Đã nhận phòng': return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'Đã duyệt': 
      case 'Đã hoàn thành': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Đã trả phòng': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Đã hủy': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const handleApprove = async (id: string | number) => {
    try {
      await partnerService.confirmBooking(id);
      fetchBookings();
      toastSuccess('Đã duyệt yêu cầu đặt phòng.');
    } catch {
      toastError('Lỗi khi duyệt đặt phòng.');
    }
  };

  const handleReject = async (id: string | number) => {
    try {
      await partnerService.cancelBooking(id);
      fetchBookings();
      toastSuccess('Đã từ chối yêu cầu đặt phòng.');
    } catch {
      toastError('Lỗi khi từ chối đặt phòng.');
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
        booking.buildingName,
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

  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.rawStatus === 0).length;
    const confirmed = bookings.filter((b) => b.rawStatus === 1).length;
    const inStay = bookings.filter((b) => isInStay(b)).length;
    const cancelled = bookings.filter((b) => b.rawStatus === 2).length;
    const estimatedRevenue = bookings
      .filter((b) => b.rawStatus === 1 || b.rawStatus === 3)
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    return { pending, confirmed, inStay, cancelled, estimatedRevenue };
  }, [bookings]);

  const statusTabs: Array<{ key: BookingStatusFilter; label: string; count: number }> = [
    { key: 'all', label: 'Tất cả', count: bookings.length },
    { key: 0, label: 'Chờ duyệt', count: stats.pending },
    { key: 1, label: 'Đã duyệt', count: stats.confirmed },
    { key: 'in_stay', label: 'Đang ở', count: stats.inStay },
    { key: 2, label: 'Đã hủy', count: stats.cancelled },
    { key: 3, label: 'Đã hoàn thành', count: bookings.filter((b) => b.rawStatus === 3).length },
  ];

  const getDisplayStatus = (booking: BookingRow): Booking['status'] => {
    if (booking.stay_status === 'checked_in') return 'Đang ở';
    if (booking.stay_status === 'checked_out') return 'Đã trả phòng';
    if (isInStay(booking) && booking.rawStatus === 1) {
      return 'Đã duyệt'; // Still confirmed but within date range, buttons will show
    }
    return booking.status;
  };

  const exportCsv = () => {
    const headers = [
      'id',
      'guestName',
      'phone',
      'roomName',
      'buildingName',
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
      b.buildingName ?? '',
      b.checkIn,
      b.checkOut,
      b.status,
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
            <h3 className="text-3xl font-black text-amber-600">{stats.pending}</h3>
            <CheckCircle2 className="text-amber-500" size={24} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Đã duyệt</p>
          <div className="mt-3 flex items-end justify-between">
            <h3 className="text-3xl font-black text-emerald-600">{stats.confirmed}</h3>
            <CheckCircle2 className="text-emerald-500" size={24} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Đã hủy</p>
          <div className="mt-3 flex items-end justify-between">
            <h3 className="text-3xl font-black text-rose-600">{stats.cancelled}</h3>
            <XCircle className="text-rose-500" size={24} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Doanh thu ước tính</p>
          <div className="mt-3 flex items-end justify-between gap-2">
            <h3 className="truncate text-xl font-black text-blue-700">{stats.estimatedRevenue.toLocaleString('vi-VN')} đ</h3>
            <BadgeDollarSign className="shrink-0 text-blue-500" size={24} />
          </div>
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
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50">
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
                      <div className="flex items-center gap-1.5 font-semibold italic text-emerald-600">
                        <Calendar size={12} /> IN: {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('vi-VN') : 'N/A'}
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold italic text-amber-600">
                        <Calendar size={12} /> OUT: {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('vi-VN') : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={14} className="text-slate-400" />
                      {booking.buildingName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${getStatusStyle(getDisplayStatus(booking))}`}>
                      {getDisplayStatus(booking)}
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
                       {booking.status === 'Chờ duyệt' ? (
                         <>
                           <Button onClick={() => handleApprove(booking.id)} size="sm" className="h-8 bg-emerald-600 px-3 font-bold text-white hover:bg-emerald-700">Duyệt</Button>
                           <Button onClick={() => handleReject(booking.id)} variant="outline" size="sm" className="h-8 border-red-200 px-3 text-red-600">Hủy</Button>
                         </>
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
                   <td colSpan={5} className="px-6 py-20 text-center italic text-gray-400">Không có booking phù hợp bộ lọc hiện tại.</td>
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
                  <p className="mt-1 text-slate-500">{selectedBooking.buildingName || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Ngày nhận phòng</p>
                  <p className="mt-1 font-semibold">{selectedBooking.checkIn ? new Date(selectedBooking.checkIn).toLocaleDateString('vi-VN') : 'N/A'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Ngày trả phòng</p>
                  <p className="mt-1 font-semibold">{selectedBooking.checkOut ? new Date(selectedBooking.checkOut).toLocaleDateString('vi-VN') : 'N/A'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Tổng tiền</p>
                  <p className="mt-1 font-semibold text-blue-700">{(selectedBooking.totalAmount || 0).toLocaleString('vi-VN')} đ</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">Ghi chú khách hàng</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-700">{selectedBooking.note || 'Không có ghi chú.'}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{getDisplayStatus(selectedBooking)}</Badge>
                {selectedBooking.status === 'Chờ duyệt' && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(selectedBooking.id)}>
                      Duyệt
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-200 text-red-600" onClick={() => handleReject(selectedBooking.id)}>
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bookings;
