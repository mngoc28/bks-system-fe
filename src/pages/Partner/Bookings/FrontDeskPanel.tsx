import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageSquare,
  CheckCircle,
  Image as ImageIcon,
  Search,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toastError, toastSuccess } from '@/components/ui/toast';
import { partnerService } from '@/services/partnerService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import CancelBookingDialog from '../components/CancelBookingDialog';

interface BookingDeposit {
  id: number;
  amount: number;
  status: string;
  receipt_path: string | null;
  created_at: string;
}

interface FrontDeskBooking {
  id: number;
  guestName: string;
  phone: string;
  roomName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  price: number;
  booking_status: number;
  note: string | null;
  created_at: string;
  deposit_amount: number;
  deposit_status: string;
  booking_deposit?: BookingDeposit | null;
}

interface FrontDeskPanelProps {
  onRefreshStats?: () => void;
}

const FrontDeskPanel: React.FC<FrontDeskPanelProps> = ({ onRefreshStats }) => {
  const [bookings, setBookings] = useState<FrontDeskBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all_pending' | 'today_checkin' | 'receipt_submitted'>('all_pending');

  // Dialog States
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [confirmingDepositId, setConfirmingDepositId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelingBookingId, setCancelingBookingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const params = {
        per_page: 100, // Fetch a larger batch to filter on client side
        status: 1, // Only confirmed bookings that are waiting for deposit/check-in
      };

      const res = (await partnerService.getBookings(params)) as any;
      const resBody = res?.data || res;
      const paginator = resBody?.data && typeof resBody.data === 'object' && !Array.isArray(resBody.data) 
        ? resBody.data 
        : resBody;

      const rawData = Array.isArray(paginator.data) ? paginator.data : (Array.isArray(paginator) ? paginator : []);
      
      // Filter bookings that have a deposit and the deposit is not fully confirmed yet
      const filtered: FrontDeskBooking[] = rawData
        .map((item: any) => ({
          id: item.id,
          guestName: item.user_name ?? item.customerName ?? 'Khách ẩn danh',
          phone: item.user_phone ?? '',
          roomName: item.room_name ?? item.room_number ?? '',
          propertyName: item.property_name ?? '',
          checkIn: item.start_date ?? item.check_in ?? '',
          checkOut: item.end_date ?? item.check_out ?? '',
          price: Number(item.price ?? 0),
          booking_status: item.booking_status ?? 1,
          note: item.note ?? null,
          created_at: item.created_at ?? '',
          deposit_amount: Number(item.deposit_amount ?? 0),
          deposit_status: item.deposit_status ?? 'none',
          booking_deposit: item.booking_deposit ?? item.booking_deposits ?? null,
        }))
        .filter((b: FrontDeskBooking) => 
          b.deposit_amount > 0 && 
          ['pending', 'payment_submitted'].includes(b.deposit_status)
        );

      setBookings(filtered);
    } catch (error) {
      console.error('Error fetching front desk bookings:', error);
      toastError('Không thể tải danh sách đơn chờ cọc.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleConfirmDeposit = async (id: number) => {
    try {
      setActionLoading(true);
      await partnerService.confirmDeposit(id);
      toastSuccess(`Đã xác thực cọc thành công cho đơn #${id}`);
      setConfirmingDepositId(null);
      fetchPendingBookings(true);
      if (onRefreshStats) onRefreshStats();
    } catch (error) {
      console.error('Confirm deposit error:', error);
      toastError('Xác nhận đặt cọc thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubmit = async (reason: string) => {
    if (cancelingBookingId === null) return;
    try {
      await partnerService.cancelBooking(cancelingBookingId, reason);
      toastSuccess(`Đã hủy đơn đặt phòng #${cancelingBookingId} và giải phóng phòng.`);
      setCancelingBookingId(null);
      fetchPendingBookings(true);
      if (onRefreshStats) onRefreshStats();
    } catch (error) {
      console.error('Cancel booking error:', error);
      toastError('Hủy đơn đặt phòng thất bại.');
      throw error;
    }
  };

  // Helper formatting functions
  const formatDateVi = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isToday = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date().toDateString();
    const target = new Date(dateStr).toDateString();
    return today === target;
  };

  // Filter bookings based on selected tab and search term
  const filteredBookings = bookings.filter(b => {
    // Search filter
    const matchesSearch = 
      b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      b.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(b.id).includes(searchTerm);

    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === 'today_checkin') {
      return isToday(b.checkIn);
    }
    if (activeTab === 'receipt_submitted') {
      return b.deposit_status === 'payment_submitted';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-rose-100 bg-rose-50/40 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-rose-100 p-2 text-rose-600 mt-1">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-rose-950">Góc Lễ Tân - Xác Minh Đặt Cọc</h2>
            <p className="mt-1 text-sm text-rose-700">
              Quản lý danh sách khách hàng đang chờ đóng cọc. Kiểm tra biên lai chuyển tiền và duyệt cọc thủ công để kích hoạt trạng thái Check-in.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPendingBookings(true)}
            disabled={loading || refreshing}
            className="border-rose-200 text-rose-800 hover:bg-rose-100"
          >
            <RefreshCw size={14} className={`mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={activeTab === 'all_pending' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all_pending')}
            className={`rounded-full ${activeTab === 'all_pending' ? 'bg-slate-900 hover:bg-slate-800' : ''}`}
          >
            Tất cả chờ cọc ({bookings.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'today_checkin' ? 'default' : 'outline'}
            onClick={() => setActiveTab('today_checkin')}
            className={`rounded-full ${activeTab === 'today_checkin' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`}
          >
            Nhận phòng hôm nay ({bookings.filter(b => isToday(b.checkIn)).length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'receipt_submitted' ? 'default' : 'outline'}
            onClick={() => setActiveTab('receipt_submitted')}
            className={`rounded-full ${activeTab === 'receipt_submitted' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
          >
            Đã nộp minh chứng ({bookings.filter(b => b.deposit_status === 'payment_submitted').length})
          </Button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm mã đơn, tên khách, SĐT..."
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Booking Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-slate-100 rounded-2xl bg-white p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-5 w-40" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="flex gap-2 pt-3">
                <Skeleton className="h-8 flex-1 rounded" />
                <Skeleton className="h-8 flex-1 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((booking) => {
            const hasReceipt = !!(booking.booking_deposit?.receipt_path);
            const isSubmitted = booking.deposit_status === 'payment_submitted';
            
            return (
              <div
                key={booking.id}
                className={`flex flex-col justify-between border rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden ${
                  isSubmitted ? 'border-emerald-200 bg-emerald-50/5' : 'border-slate-200'
                }`}
              >
                {/* Visual indicator for receipt submitted */}
                {isSubmitted && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg uppercase tracking-wide">
                    Có minh chứng
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-400">ĐƠN #{booking.id}</span>
                    <Badge
                      variant="none"
                      className={`text-[10px] font-bold uppercase ${
                        isSubmitted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isSubmitted ? 'Chờ duyệt biên lai' : 'Chưa chuyển khoản'}
                    </Badge>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-tight flex items-center gap-1">
                    {booking.guestName}
                  </h3>

                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-400 w-16">Số phòng:</span>
                      <span className="font-semibold text-slate-800">{booking.roomName} ({booking.propertyName})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-400 w-16">Thời gian:</span>
                      <span className="font-semibold text-slate-700">
                        {formatDateVi(booking.checkIn)} → {formatDateVi(booking.checkOut)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-400 w-16">Tiền cọc:</span>
                      <span className="font-bold text-rose-600 text-sm">
                        {booking.deposit_amount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    {booking.phone && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 mt-2">
                        <span className="font-medium text-slate-400 w-16">Liên hệ:</span>
                        <div className="flex gap-2">
                          <a
                            href={`tel:${booking.phone}`}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            <Phone size={12} /> {booking.phone}
                          </a>
                          <span className="text-slate-300">|</span>
                          <a
                            href={`https://zalo.me/${booking.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-teal-600 hover:text-teal-800 font-semibold"
                          >
                            <MessageSquare size={12} /> Zalo
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {booking.note && (
                    <div className="mt-3 bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-500 border border-slate-100">
                      <span className="font-semibold block text-slate-600 mb-0.5">Ghi chú:</span>
                      {booking.note}
                    </div>
                  )}

                  {/* Receipt Preview Area */}
                  {hasReceipt && (
                    <div className="mt-4 p-2 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded bg-white p-1 border border-slate-200">
                          <ImageIcon className="text-emerald-500" size={20} />
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
                          Minh chứng chuyển khoản
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReceipt(booking.booking_deposit?.receipt_path || null)}
                        className="h-7 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2"
                      >
                        Xem ảnh
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                    onClick={() => setCancelingBookingId(booking.id)}
                  >
                    Hủy phòng
                  </Button>
                  
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    onClick={() => setConfirmingDepositId(booking.id)}
                  >
                    Duyệt cọc
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-12 text-center">
          <div className="rounded-full bg-slate-100 p-3 text-slate-400 mb-3">
            <CheckCircle size={28} />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Không có đơn đặt phòng chờ cọc</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            Toàn bộ đặt phòng có đặt cọc đã được xác thực thanh toán hoặc chưa có đơn đặt phòng nào phát sinh cọc.
          </p>
        </div>
      )}

      {/* Confirm Receipt Dialog */}
      <Dialog open={confirmingDepositId !== null} onOpenChange={(open) => !open && setConfirmingDepositId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <CheckCircle className="text-emerald-500" size={20} />
              Xác nhận nhận tiền đặt cọc
            </DialogTitle>
          </DialogHeader>
          
          {confirmingDepositId && (() => {
            const b = bookings.find(item => item.id === confirmingDepositId);
            return (
              <div className="space-y-4 py-3">
                <p className="text-sm text-slate-600">
                  Bạn có xác nhận đã nhận đủ số tiền cọc chuyển khoản cho đơn đặt phòng dưới đây không?
                </p>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mã đơn hàng:</span>
                    <span className="font-bold text-slate-950">#{b?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Khách hàng:</span>
                    <span className="font-bold text-slate-950">{b?.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phòng:</span>
                    <span className="font-semibold text-slate-950">{b?.roomName}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/40 pt-2">
                    <span className="text-slate-400">Số tiền cọc:</span>
                    <span className="font-bold text-rose-600 text-sm">
                      {b?.deposit_amount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
                
                {b?.booking_deposit?.receipt_path && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 flex justify-center bg-slate-100">
                    <img
                      src={b.booking_deposit.receipt_path}
                      alt="Minh chứng chuyển khoản"
                      className="object-contain max-h-48 w-full"
                    />
                  </div>
                )}
                
                <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2 flex items-start gap-1.5">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Xác nhận này sẽ lập tức mở khóa nút Check-in của đơn đặt phòng và gửi email thông báo xác nhận cọc thành công tới khách hàng.
                  </span>
                </p>
              </div>
            );
          })()}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              size="sm"
              disabled={actionLoading}
              onClick={() => setConfirmingDepositId(null)}
            >
              Hủy bỏ
            </Button>
            <Button
              size="sm"
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={() => confirmingDepositId && handleConfirmDeposit(confirmingDepositId)}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang duyệt...
                </>
              ) : (
                'Xác nhận đã nhận'
              )}
            </Button>
          </DialogFooter>
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

      {/* Cancel Booking Dialog */}
      <CancelBookingDialog
        open={cancelingBookingId !== null}
        bookingId={cancelingBookingId}
        onClose={() => setCancelingBookingId(null)}
        onConfirm={handleCancelSubmit}
        title={`Hủy đơn chờ cọc #${cancelingBookingId}`}
        description="Nhập lý do hủy phòng (ví dụ: quá 2 tiếng chưa chuyển khoản cọc). Hệ thống sẽ hủy đơn đặt phòng, hoàn trả quỹ phòng trống và gửi email thông báo tự động tới khách hàng."
        confirmText="Hủy đặt phòng & Giải phóng phòng"
      />
    </div>
  );
};

export default FrontDeskPanel;
