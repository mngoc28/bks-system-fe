import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LogIn,
  LogOut,
  Phone,
  RefreshCw,
  Search,
  UserX,
  ShieldAlert,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toastError } from '@/components/ui/toast';
import { partnerService } from '@/services/partnerService';
import {
  canMarkPartnerBookingNoShow,
  formatPartnerBookingDateVi,
  isPartnerCheckInDepositLocked,
  isPartnerCheckInDueToday,
  isPartnerCheckOutDueToday,
  normalizePartnerBookingStatusCode,
} from '@/utils/partnerBookingDisplay';

export interface TodayBookingRow {
  id: number | string;
  guestName: string;
  phone?: string;
  roomName: string;
  propertyName?: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  rawStatus?: number;
  stay_status?: string;
  deposit_amount?: number;
  deposit_status?: string;
  payment_status?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  no_show_at?: string;
}

interface TodayOperationsPanelProps {
  actionLoadingId: string | number | null;
  operationsRefreshKey?: number;
  onRefreshStats?: () => void;
  onCheckIn: (booking: TodayBookingRow) => void;
  onCheckOut: (booking: TodayBookingRow) => void;
  onNoShow: (id: number | string) => void;
  onViewDetail: (booking: TodayBookingRow) => void;
  onGoToDepositDesk: () => void;
}

const normalizeRows = (rows: any[]): TodayBookingRow[] =>
  (rows || []).map((item: any) => ({
    id: item.id,
    guestName: item.guestName ?? item.user_name ?? item.customerName ?? '',
    phone: item.phone ?? item.user_phone ?? '',
    roomName: item.roomName ?? item.room_name ?? item.room_number ?? '',
    propertyName: item.propertyName ?? item.property_name ?? '',
    checkIn: item.checkIn ?? item.start_date ?? item.check_in ?? '',
    checkOut: item.checkOut ?? item.end_date ?? item.check_out ?? '',
    totalAmount: Number(item.totalAmount ?? item.price ?? 0),
    rawStatus: normalizePartnerBookingStatusCode(item.status ?? item.booking_status),
    stay_status: item.stay_status || 'pending',
    deposit_amount: item.deposit_amount != null ? Number(item.deposit_amount) : undefined,
    deposit_status: item.deposit_status ?? undefined,
    payment_status: item.payment_status ?? undefined,
    cancellation_reason: item.cancellation_reason ?? undefined,
    cancelled_at: item.cancelled_at ?? undefined,
    no_show_at: item.no_show_at ?? undefined,
  }));

const TodayOperationsPanel: React.FC<TodayOperationsPanelProps> = ({
  actionLoadingId,
  operationsRefreshKey = 0,
  onRefreshStats,
  onCheckIn,
  onCheckOut,
  onNoShow,
  onViewDetail,
  onGoToDepositDesk,
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [arrivals, setArrivals] = useState<TodayBookingRow[]>([]);
  const [departures, setDepartures] = useState<TodayBookingRow[]>([]);

  const fetchTodayBookings = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const [arrivalsRes, departuresRes] = await Promise.all([
        partnerService.getBookings({
          status: 1,
          stay_status: 'pending',
          per_page: 100,
          sort_field: 'start_date',
          sort_direction: 'asc',
        }),
        partnerService.getBookings({
          status: 1,
          stay_status: 'checked_in',
          per_page: 100,
          sort_field: 'end_date',
          sort_direction: 'asc',
        }),
      ]);

      const parseBody = (res: any) => {
        const resBody = res?.data || res;
        const paginator =
          resBody?.data && typeof resBody.data === 'object' && !Array.isArray(resBody.data)
            ? resBody.data
            : resBody;
        return Array.isArray(paginator.data) ? paginator.data : Array.isArray(paginator) ? paginator : [];
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const arrivalRows = normalizeRows(parseBody(arrivalsRes)).filter((b) => {
        if (!b.checkIn) {
          return false;
        }
        const checkInDate = new Date(b.checkIn);
        checkInDate.setHours(0, 0, 0, 0);
        return checkInDate.getTime() <= today.getTime();
      });

      const departureRows = normalizeRows(parseBody(departuresRes)).filter((b) =>
        isPartnerCheckOutDueToday(b.checkOut),
      );

      setArrivals(arrivalRows);
      setDepartures(departureRows);
    } catch {
      toastError('Không thể tải danh sách vận hành hôm nay.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchTodayBookings(operationsRefreshKey > 0);
  }, [fetchTodayBookings, operationsRefreshKey]);

  const handleRefresh = async () => {
    await fetchTodayBookings(true);
    onRefreshStats?.();
  };

  const matchesSearch = useCallback(
    (b: TodayBookingRow) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) {
        return true;
      }
      return (
        b.guestName.toLowerCase().includes(q) ||
        (b.phone ?? '').includes(q) ||
        b.roomName.toLowerCase().includes(q) ||
        (b.propertyName ?? '').toLowerCase().includes(q) ||
        String(b.id).includes(q)
      );
    },
    [searchTerm],
  );

  const filteredArrivals = useMemo(
    () => arrivals.filter(matchesSearch),
    [arrivals, matchesSearch],
  );
  const filteredDepartures = useMemo(
    () => departures.filter(matchesSearch),
    [departures, matchesSearch],
  );

  const renderArrivalCard = (booking: TodayBookingRow) => {
    const depositLocked = isPartnerCheckInDepositLocked(booking.deposit_amount, booking.deposit_status);
    const canNoShow = canMarkPartnerBookingNoShow(booking.rawStatus, booking.stay_status, booking.checkIn);
    const isToday = isPartnerCheckInDueToday(booking.checkIn);
    const isOverdue = !isToday;

    return (
      <div
        key={booking.id}
        className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm ${
          isOverdue ? 'border-amber-200 bg-amber-50/20' : 'border-indigo-100'
        }`}
      >
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-400">#{booking.id}</span>
            <Badge
              variant="none"
              className={`text-[10px] font-bold uppercase ${
                isOverdue
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-indigo-200 bg-indigo-50 text-indigo-700'
              }`}
            >
              {isOverdue ? 'Quá hạn nhận phòng' : 'Nhận phòng hôm nay'}
            </Badge>
          </div>
          <h3 className="font-extrabold uppercase tracking-tight text-slate-800">{booking.guestName}</h3>
          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <p>
              <span className="text-slate-400">Phòng: </span>
              <span className="font-semibold text-slate-800">
                {booking.roomName}
                {booking.propertyName ? ` · ${booking.propertyName}` : ''}
              </span>
            </p>
            <p>
              <span className="text-slate-400">Lưu trú: </span>
              <span className="font-semibold">
                {formatPartnerBookingDateVi(booking.checkIn)} → {formatPartnerBookingDateVi(booking.checkOut)}
              </span>
            </p>
            {booking.phone && (
              <a href={`tel:${booking.phone}`} className="inline-flex items-center gap-1 font-semibold text-blue-600">
                <Phone size={12} /> {booking.phone}
              </a>
            )}
          </div>
          {depositLocked && (
            <p className="mt-3 flex items-start gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-2.5 py-2 text-[11px] text-rose-700">
              <ShieldAlert size={14} className="mt-0.5 shrink-0" />
              Chưa xác minh cọc — chuyển sang tab Duyệt cọc trước khi check-in.
            </p>
          )}
          {isOverdue && canNoShow && (
            <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50/80 px-2.5 py-2 text-[11px] text-amber-800">
              Khách không đến? Bấm <span className="font-bold">Không đến</span> để giải phóng phòng — khác với hủy tự động do quá hạn cọc (tab Đã hủy).
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <Button variant="outline" size="sm" className="h-8" onClick={() => onViewDetail(booking)}>
            <Eye size={14} className="mr-1" />
            Chi tiết
          </Button>
          {depositLocked ? (
            <Button variant="outline" size="sm" className="h-8 border-rose-200 text-rose-700" onClick={onGoToDepositDesk}>
              Duyệt cọc
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 bg-indigo-600 hover:bg-indigo-700"
              disabled={actionLoadingId === booking.id}
              onClick={() => onCheckIn(booking)}
            >
              <LogIn size={14} className="mr-1" />
              Check-in
            </Button>
          )}
          {canNoShow && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={actionLoadingId === booking.id}
              onClick={() => onNoShow(booking.id)}
            >
              <UserX size={14} className="mr-1" />
              Không đến
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderDepartureCard = (booking: TodayBookingRow) => (
    <div
      key={booking.id}
      className="flex flex-col justify-between rounded-2xl border border-amber-100 bg-white p-5 shadow-sm"
    >
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-400">#{booking.id}</span>
          <Badge variant="none" className="border-amber-200 bg-amber-50 text-[10px] font-bold uppercase text-amber-800">
            Trả phòng hôm nay
          </Badge>
        </div>
        <h3 className="font-extrabold uppercase tracking-tight text-slate-800">{booking.guestName}</h3>
        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
          <p>
            <span className="text-slate-400">Phòng: </span>
            <span className="font-semibold text-slate-800">
              {booking.roomName}
              {booking.propertyName ? ` · ${booking.propertyName}` : ''}
            </span>
          </p>
          <p>
            <span className="text-slate-400">Trả phòng: </span>
            <span className="font-semibold">{formatPartnerBookingDateVi(booking.checkOut)}</span>
          </p>
          {booking.phone && (
            <a href={`tel:${booking.phone}`} className="inline-flex items-center gap-1 font-semibold text-blue-600">
              <Phone size={12} /> {booking.phone}
            </a>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" className="h-8" onClick={() => onViewDetail(booking)}>
          <Eye size={14} className="mr-1" />
          Chi tiết
        </Button>
        <Button
          size="sm"
          className="h-8 bg-amber-600 hover:bg-amber-700"
          disabled={actionLoadingId === booking.id}
          onClick={() => onCheckOut(booking)}
        >
          <LogOut size={14} className="mr-1" />
          Check-out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-indigo-950">Vận hành hôm nay</h2>
          <p className="mt-1 text-sm text-indigo-800/90">
            Tập trung check-in, không đến và check-out trong ngày — không cần lọc trong bảng dài.
          </p>
          <p className="mt-2 text-xs text-indigo-700/80">
            Đơn <span className="font-semibold">đã duyệt</span> quá hạn chưa nhận phòng: bấm{' '}
            <span className="font-semibold">Không đến</span> để giải phóng phòng. Đơn{' '}
            <span className="font-semibold">chờ duyệt</span> quá hạn cọc được hệ thống tự hủy → xem tab{' '}
            <span className="font-semibold">Đã hủy</span> (badge &quot;Hủy tự động&quot;).
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleRefresh()}
          disabled={loading || refreshing}
          className="shrink-0 border-indigo-200 text-indigo-800"
        >
          <RefreshCw size={14} className={`mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm mã đơn, tên khách, SĐT, phòng..."
          className="h-10 pl-9"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <LogIn size={18} className="text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Cần nhận phòng ({filteredArrivals.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Khách đến hôm nay hoặc quá hạn chưa check-in — dùng &quot;Không đến&quot; nếu khách không tới để đưa phòng lại kho bán.
            </p>
            {filteredArrivals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredArrivals.map(renderArrivalCard)}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-500">
                Không có khách cần nhận phòng.
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <LogOut size={18} className="text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">
                Cần trả phòng hôm nay ({filteredDepartures.length})
              </h3>
            </div>
            {filteredDepartures.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDepartures.map(renderDepartureCard)}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-500">
                Không có khách cần trả phòng hôm nay.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default TodayOperationsPanel;
