import React, { useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Calendar as CalendarIcon,
  Home,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  LogIn,
  LogOut,
  Phone,
  Loader2,
  Lock,
  Plus,
  Trash2,
  Info,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { partnerService } from '@/services/partnerService';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { format, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useCalendar,
  useInvalidatePartnerCalendar,
  type PartnerCalendarBooking,
  type PartnerCalendarBlock,
} from '@/hooks/Partner/useCalendar';
import { useBookingsRealtime } from '@/hooks/Partner/useBookingsRealtime';
import { RoomBlockDialog } from './components/RoomBlockDialog';
import { isPartner360Enabled } from '@/lib/featureFlags';
import {
  PARTNER_BLOCK_TYPE_LABEL_VI,
  countPartnerBookingNightsExclusive,
  formatPartnerBookingDateVi,
  getPartnerBlockCalendarHex,
  getPartnerBookingCalendarHex,
  getPartnerRowDisplayStatus,
} from '@/utils/partnerBookingDisplay';

interface CalendarEventExt {
  kind: 'booking' | 'block';
  roomId: number;
  buildingId: number | null;
  buildingName?: string;
  roomName: string;
  guestName: string;
  status: string;
  rawStatus: number;
  stayStatus: string;
  bookingId: number;
  blockId?: number;
  blockType?: string;
  reason?: string;
  phone?: string;
  note?: string;
  totalAmount?: number;
  checkIn: string;
  checkOut: string;
  // Phase 5 (T5.4): badge "Contract" cho booking lease/>= 30 ngày.
  isLongTerm?: boolean;
  nights?: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: CalendarEventExt;
}

const ALL_PROPERTIES = '__all__';

const FC_BUTTON_TEXT = {
  today: 'Hôm nay',
  month: 'Tháng',
  week: 'Tuần',
  day: 'Ngày',
} as const;

const LEGEND_ITEMS = [
  { label: 'Chờ duyệt', color: '#f59e0b' },
  { label: 'Đã duyệt', color: '#3b82f6' },
  { label: 'Đang ở', color: '#8b5cf6' },
  { label: 'Đã hoàn thành', color: '#10b981' },
  { label: 'Chặn · Bảo trì', color: '#475569' },
  { label: 'Chặn · Chủ nhà', color: '#7c3aed' },
  { label: 'Chặn · Tạm ngừng', color: '#0f172a' },
] as const;

function parsePartnerRoomsSearchResponse(res: any): any[] {
  const roomData = res?.data || {};
  const raw = roomData.data || (Array.isArray(roomData) ? roomData : []);

  return (raw as any[]).map((r) => ({
    id: r.id,
    room_number: r.room_number,
    title: r.title,
    name: r.name,
    building_id: r.building_id != null ? Number(r.building_id) : undefined,
    building_name: r.building_name,
  }));
}

const CalendarPage: React.FC = () => {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(ALL_PROPERTIES);
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [range, setRange] = useState<{ from: string; to: string }>({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const calendarRef = useRef<FullCalendar | null>(null);

  // Phase 2 realtime — listener đã invalidate query 'partner.calendar'.
  useBookingsRealtime();

  const propertyParam = selectedBuildingId === ALL_PROPERTIES ? null : selectedBuildingId;
  const roomParam = selectedRoomId === 'all' ? null : selectedRoomId;

  const calendarQuery = useCalendar({
    propertyId: propertyParam,
    roomId: roomParam,
    from: range.from,
    to: range.to,
  });
  const invalidateCalendar = useInvalidatePartnerCalendar();

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    void fetchRoomsForFilter();
  }, [selectedBuildingId]);

  const fetchRoomsForFilter = async () => {
    setRoomsLoading(true);
    try {
      const params: Record<string, string | number> = { page: 1, per_page: 300 };
      if (selectedBuildingId !== ALL_PROPERTIES) {
        params.building_id = Number(selectedBuildingId);
      }
      const res: any = await partnerService.getRooms(params);
      const list = parsePartnerRoomsSearchResponse(res);
      setRooms(list);
      setSelectedRoomId('all');
    } catch {
      toastError('Không thể tải danh sách phòng.');
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const res: any = await partnerService.getBuildings();
      const list = res?.data?.data || res?.data || [];
      setBuildings(list);
    } catch {
      toastError('Không thể tải danh sách bất động sản.');
    }
  };

  const events = useMemo<CalendarEvent[]>(() => {
    const bookings = (calendarQuery.data?.bookings ?? []) as PartnerCalendarBooking[];
    const blocks = (calendarQuery.data?.blocks ?? []) as PartnerCalendarBlock[];

    const bookingEvents: CalendarEvent[] = bookings.map((b) => {
      const color = getPartnerBookingCalendarHex(b.status, b.stay_status ?? '');
      const label = b.room_label || b.room_title || `Phòng ${b.room_id}`;
      const guest = b.guest_name || 'Khách';
      const buildingName = b.building_name ?? '';
      const statusLabel = getPartnerRowDisplayStatus(b.status, b.stay_status ?? '');
      const title =
        selectedBuildingId === ALL_PROPERTIES && buildingName
          ? `${buildingName} · ${label} · ${guest}`
          : `${label} · ${guest}`;

      const nights = countPartnerBookingNightsExclusive(b.start_date, b.end_date) ?? 0;
      const isLongTerm = nights >= 30;

      return {
        id: `booking-${b.id}`,
        title,
        start: b.start_date,
        end: b.end_date,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          kind: 'booking',
          roomId: b.room_id,
          buildingId: b.building_id ?? null,
          buildingName: buildingName || undefined,
          roomName: label,
          guestName: guest,
          status: statusLabel,
          rawStatus: b.status,
          stayStatus: b.stay_status ?? '',
          bookingId: b.id,
          phone: b.guest_phone ?? undefined,
          note: b.note ?? undefined,
          totalAmount: b.total_amount ?? 0,
          checkIn: b.start_date,
          checkOut: b.end_date,
          isLongTerm,
          nights,
        },
      };
    });

    const blockEvents: CalendarEvent[] = blocks.map((bl) => {
      const room = rooms.find((r) => Number(r.id) === Number(bl.room_id));
      const label = room?.room_number || room?.title || room?.name || `Phòng ${bl.room_id}`;
      const color = getPartnerBlockCalendarHex(bl.block_type);
      const typeLabel = PARTNER_BLOCK_TYPE_LABEL_VI[bl.block_type] ?? bl.block_type;

      return {
        id: `block-${bl.id}`,
        title: `Chặn: ${label} — ${typeLabel}`,
        start: bl.start_date,
        end: bl.end_date,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          kind: 'block',
          roomId: bl.room_id,
          buildingId: room?.building_id ?? null,
          roomName: label,
          guestName: '',
          status: typeLabel,
          rawStatus: -1,
          stayStatus: '',
          bookingId: 0,
          blockId: bl.id,
          blockType: bl.block_type,
          reason: bl.reason,
          note: bl.note ?? undefined,
          totalAmount: 0,
          checkIn: bl.start_date,
          checkOut: bl.end_date,
        },
      };
    });

    return [...bookingEvents, ...blockEvents];
  }, [calendarQuery.data, rooms, selectedBuildingId]);

  const filteredEvents = useMemo(() => {
    let list = events;
    if (selectedRoomId !== 'all') {
      list = list.filter((e) => String(e.extendedProps.roomId) === selectedRoomId);
    } else if (selectedBuildingId !== ALL_PROPERTIES) {
      list = list.filter((e) => String(e.extendedProps.buildingId) === selectedBuildingId);
    }
    return list;
  }, [events, selectedBuildingId, selectedRoomId]);

  // Overbooking detection: hai event cùng room có khoảng giao nhau (end exclusive).
  const overbookingCount = useMemo(() => {
    const byRoom = new Map<number, CalendarEvent[]>();
    for (const e of filteredEvents) {
      if (e.extendedProps.kind !== 'booking') continue;
      const arr = byRoom.get(e.extendedProps.roomId) ?? [];
      arr.push(e);
      byRoom.set(e.extendedProps.roomId, arr);
    }
    let count = 0;
    for (const arr of byRoom.values()) {
      arr.sort((a, b) => a.start.localeCompare(b.start));
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (arr[j].start < arr[i].end && arr[i].start < arr[j].end) {
            count++;
          } else if (arr[j].start >= arr[i].end) {
            break;
          }
        }
      }
    }
    return count;
  }, [filteredEvents]);

  const renderEventContent = (eventInfo: any) => {
    const props = eventInfo.event.extendedProps as CalendarEventExt;
    const isBlock = props.kind === 'block';
    const showBuilding =
      selectedBuildingId === ALL_PROPERTIES && Boolean(props.buildingName);

    const getIcon = () => {
      if (isBlock) return <Lock size={11} className="text-white/80" />;
      if (props.rawStatus === 0) return <Clock size={11} className="text-white/80" />;
      if (props.rawStatus === 2) return <AlertCircle size={11} className="text-white/80" />;
      if (props.rawStatus === 3) return <CheckCircle2 size={11} className="text-white/80" />;
      if (props.stayStatus === 'checked_in') return <LogIn size={11} className="text-white/80" />;
      return <CheckCircle2 size={11} className="text-white/80" />;
    };

    return (
      <div
        className={`flex w-full flex-col gap-0.5 overflow-hidden p-1.5 transition-all ${
          isBlock ? 'opacity-95' : ''
        }`}
        style={
          isBlock
            ? {
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 6px, transparent 6px 12px)',
              }
            : undefined
        }
      >
        {showBuilding && (
          <div className="truncate text-[10px] font-semibold leading-tight text-white/80">
            {props.buildingName}
          </div>
        )}
        <div className="flex items-center justify-between gap-1">
          <div className="truncate text-xs font-bold leading-tight text-white drop-shadow-sm">
            {props.roomName}
          </div>
          <div className="flex-shrink-0">{getIcon()}</div>
        </div>
        <div className="truncate text-[11px] font-semibold leading-tight text-white drop-shadow-sm">
          {isBlock ? props.reason || props.status : props.guestName}
        </div>
        <div className="mt-0.5 flex items-center gap-1">
          <span className="truncate text-[10px] font-medium capitalize text-white/85">{props.status}</span>
          {props.isLongTerm && (
            <span
              className="ml-auto flex shrink-0 items-center gap-0.5 rounded bg-white/20 px-1 py-[1px] text-[9px] font-bold uppercase tracking-wide text-white"
              title={`Hợp đồng dài hạn (${props.nights} đêm)`}
            >
              <FileText size={9} /> Contract
            </span>
          )}
        </div>
      </div>
    );
  };

  // FullCalendar gọi datesSet mỗi khi range view đổi (prev/next/view) — cập
  // nhật `range` để query refetch.
  // Dùng `view.currentStart/currentEnd` (range "thực" của view = month/week/day)
  // thay vì `arg.start/arg.end` — cái thứ hai bao luôn các ngày tuần lệch
  // ngoài tháng (41–42 ngày) và sẽ vượt cap 31 ngày của BE.
  const onDatesSet = (arg: any) => {
    const viewStart: Date = arg.view?.currentStart ?? arg.start;
    const viewEnd: Date = arg.view?.currentEnd ?? arg.end;
    const start = format(viewStart, 'yyyy-MM-dd');
    // FullCalendar end là exclusive — lùi 1 ngày để khớp BE inclusive.
    const end = format(addDays(viewEnd, -1), 'yyyy-MM-dd');
    setRange((prev) => (prev.from === start && prev.to === end ? prev : { from: start, to: end }));
  };

  const handleApprove = async (id: number) => {
    try {
      await partnerService.confirmBooking(id);
      toastSuccess('Đã duyệt yêu cầu đặt phòng.');
      invalidateCalendar();
      setSelectedEvent(null);
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 409 && data?.code === 'BOOKING_CONFLICT') {
        toastError('Không thể duyệt: khoảng thời gian đã có booking/block khác.');
      } else {
        toastError('Lỗi khi duyệt đặt phòng.');
      }
    }
  };

  const handleReject = async (id: number) => {
    try {
      await partnerService.cancelBooking(id);
      toastSuccess('Đã từ chối đặt phòng.');
      invalidateCalendar();
      setSelectedEvent(null);
    } catch {
      toastError('Lỗi khi từ chối đặt phòng.');
    }
  };

  const handleCheckIn = async (id: number) => {
    try {
      await partnerService.checkIn(id);
      toastSuccess('Đã check-in thành công.');
      invalidateCalendar();
      setSelectedEvent(null);
    } catch {
      toastError('Lỗi khi check-in.');
    }
  };

  const handleCheckOut = async (id: number) => {
    try {
      await partnerService.checkOut(id);
      toastSuccess('Đã check-out thành công.');
      invalidateCalendar();
      setSelectedEvent(null);
    } catch {
      toastError('Lỗi khi check-out.');
    }
  };

  const handleDeleteBlock = async (id: number) => {
    try {
      await partnerService.deleteRoomBlock(id);
      toastSuccess('Đã gỡ block.');
      invalidateCalendar();
      setSelectedEvent(null);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        toastError('Bạn không có quyền gỡ block này.');
      } else {
        toastError('Lỗi khi gỡ block.');
      }
    }
  };

  // Drag-drop booking: gọi /move; conflict 409 → revert UI.
  const handleEventDrop = async (info: any) => {
    const props = info.event.extendedProps as CalendarEventExt;
    if (props.kind !== 'booking') {
      info.revert();
      return;
    }
    const startStr = info.event.startStr;
    const endStr = info.event.endStr || info.event.startStr;
    try {
      await partnerService.moveBooking(props.bookingId, {
        start_date: startStr,
        end_date: endStr,
      });
      toastSuccess('Đã cập nhật lịch booking.');
      invalidateCalendar();
    } catch (err: any) {
      info.revert();
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 409 && data?.code === 'BOOKING_CONFLICT') {
        toastError('Không thể di chuyển: trùng booking/block khác. Đã hoàn tác.');
      } else {
        toastError('Không thể cập nhật lịch booking. Đã hoàn tác.');
      }
    }
  };

  const operationalStats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return {
      arrivals: filteredEvents.filter(
        (e) => e.extendedProps.kind === 'booking' && e.extendedProps.checkIn === today && e.extendedProps.rawStatus === 1,
      ).length,
      departures: filteredEvents.filter(
        (e) => e.extendedProps.kind === 'booking' && e.extendedProps.checkOut === today && e.extendedProps.stayStatus === 'checked_in',
      ).length,
      inStay: filteredEvents.filter(
        (e) => e.extendedProps.kind === 'booking' && e.extendedProps.stayStatus === 'checked_in',
      ).length,
      pending: filteredEvents.filter(
        (e) => e.extendedProps.kind === 'booking' && e.extendedProps.rawStatus === 0,
      ).length,
      blocks: filteredEvents.filter((e) => e.extendedProps.kind === 'block').length,
    };
  }, [filteredEvents]);

  const dialogRooms = useMemo(() => {
    return rooms.map((r: any) => ({
      id: r.id,
      label: `${r.room_number || r.title || r.name || `Phòng ${r.id}`}${
        r.building_name ? ` — ${r.building_name}` : ''
      }`,
    }));
  }, [rooms]);

  const loading = calendarQuery.isFetching;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-900 sm:text-3xl">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
            <CalendarIcon size={26} />
          </div>
          Lịch khả dụng
        </h1>
        <p className="mt-2 max-w-3xl text-sm font-medium text-slate-600 sm:text-base">
          Xem và điều phối đặt phòng, chặn lịch phòng theo từng cơ sở. Chọn bộ lọc bên dưới để đồng bộ với dữ liệu trên server.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-900">Bộ lọc lịch</CardTitle>
          <CardDescription className="text-slate-600">
            Danh sách phòng được tải qua API theo cơ sở đã chọn.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12 md:gap-4">
            <div className="space-y-1.5 md:col-span-5">
              <label className="block text-xs font-semibold text-slate-600">Cơ sở</label>
              <div className="relative">
                <Home
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <Select value={selectedBuildingId} onValueChange={setSelectedBuildingId}>
                  <SelectTrigger className="h-11 w-full rounded-lg border-slate-200 bg-slate-50/80 pl-10 font-medium text-slate-800 shadow-sm hover:bg-white">
                    <SelectValue placeholder="Chọn cơ sở" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-slate-200">
                    <SelectItem value={ALL_PROPERTIES}>Tất cả cơ sở</SelectItem>
                    {buildings.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-5">
              <label className="block text-xs font-semibold text-slate-600">Phòng</label>
              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <Select
                  value={selectedRoomId}
                  onValueChange={setSelectedRoomId}
                  disabled={roomsLoading}
                >
                  <SelectTrigger className="h-11 w-full rounded-lg border-slate-200 bg-slate-50/80 pl-10 font-medium text-slate-800 shadow-sm hover:bg-white disabled:opacity-60">
                    <SelectValue placeholder={roomsLoading ? 'Đang tải…' : 'Tất cả phòng'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 rounded-lg border-slate-200">
                    <SelectItem value="all">Tất cả phòng</SelectItem>
                    {rooms.map((r: any) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.room_number || r.title || r.name || `Phòng ${r.id}`}
                        {r.building_name ? ` — ${r.building_name}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex md:col-span-2 md:justify-end">
              {isPartner360Enabled() && (
                <Button
                  type="button"
                  className="h-11 w-full gap-2 rounded-lg bg-amber-600 px-4 font-semibold hover:bg-amber-700 md:w-auto md:min-w-[140px]"
                  onClick={() => setBlockDialogOpen(true)}
                >
                  <Plus size={18} />
                  Tạo block
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {overbookingCount > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">
          <AlertTriangle size={20} className="flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold">Cảnh báo trùng lịch</p>
            <p className="text-xs text-rose-700">
              Phát hiện {overbookingCount} cặp đặt phòng giao khoảng trong dải ngày hiện tại. Vui lòng kiểm tra và điều phối.
            </p>
          </div>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-900">Vận hành hôm nay</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Số liệu theo bộ lọc và ngày hệ thống ({formatPartnerBookingDateVi(format(new Date(), 'yyyy-MM-dd'))}).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-center sm:text-left">
              <p className="text-2xl font-black text-emerald-600">{operationalStats.arrivals}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Nhận phòng</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-center sm:text-left">
              <p className="text-2xl font-black text-amber-600">{operationalStats.departures}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Trả phòng</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-center sm:text-left">
              <p className="text-2xl font-black text-blue-600">{operationalStats.inStay}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Đang lưu trú</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-center sm:text-left">
              <p className="text-2xl font-black text-rose-600">{operationalStats.pending}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Chờ duyệt</p>
            </div>
            <div className="col-span-2 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-center sm:col-span-1 sm:text-left">
              <p className="text-2xl font-black text-violet-600">{operationalStats.blocks}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Chặn lịch</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg text-slate-900">Lịch</CardTitle>
            <CardDescription className="text-slate-600">
              Kéo thả để đổi ngày đặt phòng (nếu không trùng lịch).
            </CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="shrink-0 gap-2 border-slate-200">
                <Info size={16} className="text-slate-500" />
                Chú thích màu
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96" align="end">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Màu trên lịch</p>
              <ul className="space-y-2 text-sm text-slate-700">
                {LEGEND_ITEMS.map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-sm ring-1 ring-slate-200"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="calendar-container relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            )}
            <FullCalendar
              ref={calendarRef as any}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              buttonText={FC_BUTTON_TEXT}
              locale="vi"
              events={filteredEvents}
              eventContent={renderEventContent}
              height="720px"
              eventClick={(info) => setSelectedEvent(info.event as unknown as CalendarEvent)}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={3}
              moreLinkText={(n) => `+${n} sự kiện`}
              eventDidMount={(info) => {
                const t = info.event.title || '';
                info.el.setAttribute('title', t);
              }}
              datesSet={onDatesSet}
              eventDrop={handleEventDrop}
              eventResize={handleEventDrop}
              eventAllow={(_drop, draggedEvent) => {
                const k = (draggedEvent?.extendedProps as any)?.kind;
                return k === 'booking';
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">Sự kiện trong khoảng thời gian</CardTitle>
          <CardDescription className="text-slate-600">
            {formatPartnerBookingDateVi(range.from)} — {formatPartnerBookingDateVi(range.to)} · tối đa 12 mục
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredEvents.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
              Chưa có sự kiện trong khoảng thời gian hiển thị.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-100">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_auto] gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                <span>Loại</span>
                <span>Phòng</span>
                <span>Chi tiết</span>
                <span className="text-right">Trạng thái</span>
              </div>
              {filteredEvents.slice(0, 12).map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelectedEvent(e)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_auto] gap-2 border-b border-slate-50 px-3 py-2.5 text-left text-xs transition-colors hover:bg-slate-50 sm:text-sm"
                >
                  <span className="font-semibold text-slate-800">
                    {e.extendedProps.kind === 'block' ? 'Chặn lịch' : 'Đặt phòng'}
                  </span>
                  <span className="truncate text-slate-700">{e.extendedProps.roomName}</span>
                  <span className="truncate text-slate-600">
                    {e.extendedProps.kind === 'block'
                      ? e.extendedProps.reason || e.extendedProps.status
                      : e.extendedProps.guestName}
                  </span>
                  <span className="truncate text-right text-[11px] font-medium text-slate-500">
                    {e.extendedProps.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl">
          {selectedEvent && (
            <div className="flex flex-col">
              <div
                className="h-24 p-6 flex flex-col justify-end text-white"
                style={{ backgroundColor: selectedEvent.backgroundColor }}
              >
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                      {selectedEvent.extendedProps.kind === 'block' ? 'Chi tiết chặn lịch' : 'Chi tiết đặt phòng'}
                    </p>
                    <h2 className="text-2xl font-black">
                      {selectedEvent.extendedProps.kind === 'block'
                        ? `Block #${selectedEvent.extendedProps.blockId}`
                        : `#${selectedEvent.extendedProps.bookingId}`}
                    </h2>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-white/20 text-white border-none backdrop-blur-md font-bold">
                      {selectedEvent.extendedProps.status}
                    </Badge>
                    {selectedEvent.extendedProps.kind === 'booking' && selectedEvent.extendedProps.isLongTerm && (
                      <Badge className="bg-white/10 text-white border border-white/30 backdrop-blur-md font-bold inline-flex items-center gap-1">
                        <FileText size={12} /> Contract · {selectedEvent.extendedProps.nights} đêm
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {selectedEvent.extendedProps.kind === 'booking' ? (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Khách hàng</p>
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-100 p-1.5 rounded-lg text-slate-600"><User size={16} /></div>
                        <p className="font-bold text-slate-900">{selectedEvent.extendedProps.guestName}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Lý do</p>
                      <p className="font-bold text-slate-900">{selectedEvent.extendedProps.reason || '—'}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Phòng</p>
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 p-1.5 rounded-lg text-slate-600"><MapPin size={16} /></div>
                      <div>
                        <p className="font-bold text-slate-900">{selectedEvent.extendedProps.roomName}</p>
                        {selectedEvent.extendedProps.kind === 'booking' &&
                          selectedEvent.extendedProps.buildingName && (
                            <p className="text-xs font-medium text-slate-500">{selectedEvent.extendedProps.buildingName}</p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <LogIn size={18} className="text-blue-500" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Nhận phòng</p>
                      <p className="text-sm font-bold">
                        {formatPartnerBookingDateVi(selectedEvent.extendedProps.checkIn)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <LogOut size={18} className="text-amber-500" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Trả phòng</p>
                      <p className="text-sm font-bold">
                        {formatPartnerBookingDateVi(selectedEvent.extendedProps.checkOut)}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedEvent.extendedProps.kind === 'booking' &&
                  (() => {
                    const n = countPartnerBookingNightsExclusive(
                      selectedEvent.extendedProps.checkIn,
                      selectedEvent.extendedProps.checkOut,
                    );
                    if (n === null || n <= 0) {
                      return null;
                    }
                    return (
                      <p className="text-center text-xs font-semibold text-slate-600">
                        {n} đêm lưu trú
                      </p>
                    );
                  })()}

                {selectedEvent.extendedProps.kind === 'booking' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                      <span className="text-slate-500 font-medium">Tổng số tiền thanh toán:</span>
                      <span className="font-black text-blue-700 text-xl">
                        {Number(selectedEvent.extendedProps.totalAmount || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    {selectedEvent.extendedProps.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        <span className="font-medium">{selectedEvent.extendedProps.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {selectedEvent.extendedProps.note && (
                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/30">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ghi chú</p>
                    <p className="text-xs text-slate-600 italic leading-relaxed">"{selectedEvent.extendedProps.note}"</p>
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" onClick={() => setSelectedEvent(null)} className="font-semibold text-slate-600">
                      Đóng
                    </Button>
                    {selectedEvent.extendedProps.kind === 'booking' && selectedEvent.extendedProps.rawStatus === 0 && (
                      <>
                        <Button
                          variant="outline"
                          className="border-rose-200 font-semibold text-rose-600 hover:bg-rose-50"
                          onClick={() => handleReject(selectedEvent.extendedProps.bookingId)}
                        >
                          Từ chối
                        </Button>
                        <Button
                          className="bg-emerald-600 font-semibold hover:bg-emerald-700"
                          onClick={() => handleApprove(selectedEvent.extendedProps.bookingId)}
                        >
                          Duyệt ngay
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {selectedEvent.extendedProps.kind === 'booking' &&
                      selectedEvent.extendedProps.rawStatus === 1 &&
                      selectedEvent.extendedProps.stayStatus === 'pending' && (
                        <Button
                          className="min-w-[160px] bg-blue-600 font-semibold hover:bg-blue-700"
                          onClick={() => handleCheckIn(selectedEvent.extendedProps.bookingId)}
                        >
                          Xác nhận nhận phòng
                        </Button>
                      )}

                    {selectedEvent.extendedProps.kind === 'booking' &&
                      selectedEvent.extendedProps.stayStatus === 'checked_in' && (
                        <Button
                          className="min-w-[160px] bg-amber-600 font-semibold hover:bg-amber-700"
                          onClick={() => handleCheckOut(selectedEvent.extendedProps.bookingId)}
                        >
                          Hoàn tất trả phòng
                        </Button>
                      )}

                    {selectedEvent.extendedProps.kind === 'block' && (
                      <Button
                        className="min-w-[140px] gap-2 bg-rose-600 font-semibold hover:bg-rose-700"
                        onClick={() => handleDeleteBlock(selectedEvent.extendedProps.blockId!)}
                      >
                        <Trash2 size={14} />
                        Gỡ chặn lịch
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RoomBlockDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        rooms={dialogRooms}
        defaultStartDate={range.from}
        defaultEndDate={range.from}
        onCreated={() => invalidateCalendar()}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .fc-theme-standard .fc-scrollgrid { border-radius: 16px; overflow: hidden; border: 1px solid #f1f5f9; }
        .fc-header-toolbar { margin-bottom: 2rem !important; }
        .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 800 !important; color: #0f172a; text-transform: capitalize; }
        .fc-button { padding: 0.6rem 1rem !important; font-size: 0.875rem !important; font-weight: 700 !important; border-radius: 10px !important; transition: all 0.2s; border: none !important; }
        .fc-button-primary { background-color: #f8fafc !important; color: #64748b !important; border: 1px solid #e2e8f0 !important; }
        .fc-button-primary:hover { background-color: #f1f5f9 !important; color: #0f172a !important; }
        .fc-button-active { background-color: #3b82f6 !important; color: white !important; border-color: #3b82f6 !important; }
        .fc-today-button { background-color: #3b82f6 !important; color: white !important; opacity: 1 !important; }
        .fc-event { cursor: pointer; border-radius: 8px !important; margin: 2px 4px !important; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: none !important; transition: transform 0.15s; }
        .fc-event:hover { transform: scale(1.02); }
        .fc-daygrid-day-number { font-size: 0.875rem; font-weight: 700; color: #64748b; padding: 8px !important; }
        .fc-col-header-cell-cushion { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px !important; }
        .fc-day-today { background-color: #eff6ff !important; }
        .fc-dayMaxEvents-link { font-size: 10px; font-weight: 800; color: #3b82f6; padding: 2px 8px; }
        .fc-more-popover { z-index: 1000 !important; border-radius: 12px !important; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1) !important; border: 1px solid #f1f5f9 !important; }
        .fc-more-popover .fc-popover-body { max-height: 400px; overflow-y: auto; padding: 12px !important; }
        .fc-more-popover .fc-popover-header { background-color: #f8fafc; border-bottom: 1px solid #f1f5f9; padding: 12px 16px !important; font-weight: 800; color: #0f172a; border-radius: 12px 12px 0 0; }
        .fc-more-popover .fc-popover-title { font-size: 0.875rem !important; text-transform: uppercase; letter-spacing: 0.025em; }
        .fc-popover-close { color: #94a3b8 !important; opacity: 1 !important; transition: color 0.2s; }
        .fc-popover-close:hover { color: #ef4444 !important; }
        body:has(.fixed.inset-0) .fc-more-popover { display: none !important; }
      `}} />
    </div>
  );
};

export default CalendarPage;
