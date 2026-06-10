import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Calendar as CalendarIcon,
  Home,
  User,
  MapPin,
  AlertTriangle,
  LogIn,
  LogOut,
  Phone,
  Plus,
  Trash2,
  Info,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { partnerService } from '@/services/partnerService';
import { parsePartnerPropertyNamesResponse } from '@/utils/partnerPropertyData';
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
import CancelBookingDialog from './components/CancelBookingDialog';
import { isPartner360Enabled } from '@/lib/featureFlags';
import { ROUTERS } from '@/constant';
import {
  PARTNER_BLOCK_TYPE_LABEL_VI,
  countPartnerBookingNightsExclusive,
  formatCalendarGuestLabel,
  formatPartnerBookingDateVi,
  getCalendarDayOperationalMarker,
  getPartnerBlockCalendarHex,
  getPartnerBookingCalendarHex,
  getPartnerRowDisplayStatus,
} from '@/utils/partnerBookingDisplay';

interface CalendarEventExt {
  kind: 'booking' | 'block';
  roomId: number;
  propertyId: number | null;
  propertyName?: string;
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
const ROOMS_FILTER_PER_PAGE = 100;

type OperationalFilter = 'all' | 'arrivals' | 'departures' | 'in_stay' | 'pending' | 'blocks';

const OPERATIONAL_FILTER_LABELS: Record<Exclude<OperationalFilter, 'all'>, string> = {
  arrivals: 'Nhận phòng hôm nay',
  departures: 'Trả phòng hôm nay',
  in_stay: 'Đang ở',
  pending: 'Chờ duyệt',
  blocks: 'Chặn lịch',
};

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
    property_id: (r.property_id ?? r.property_id) != null ? Number(r.property_id ?? r.property_id) : undefined,
    property_name: r.property_name ?? r.property_name,
  }));
}

const CalendarPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(() => {
    const fromUrl = searchParams.get('property_id');
    return fromUrl && fromUrl !== ALL_PROPERTIES ? fromUrl : ALL_PROPERTIES;
  });
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [range, setRange] = useState<{ from: string; to: string }>({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [calendarViewType, setCalendarViewType] = useState('dayGridMonth');
  const [eventListExpanded, setEventListExpanded] = useState(false);
  const [operationalFilter, setOperationalFilter] = useState<OperationalFilter>('all');
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [dayPanel, setDayPanel] = useState<{ date: string; events: CalendarEvent[] } | null>(null);
  const calendarRef = useRef<FullCalendar | null>(null);

  const eventOverlapsDay = (event: CalendarEvent, dayStr: string): boolean =>
    event.start <= dayStr && event.end > dayStr;

  // Phase 2 realtime — listener đã invalidate query 'partner.calendar'.
  useBookingsRealtime();

  const propertyParam = selectedPropertyId === ALL_PROPERTIES ? null : selectedPropertyId;
  const roomParam = selectedRoomId === 'all' ? null : selectedRoomId;

  const calendarQuery = useCalendar({
    propertyId: propertyParam,
    roomId: roomParam,
    from: range.from,
    to: range.to,
  });
  const invalidateCalendar = useInvalidatePartnerCalendar();

  useEffect(() => {
    const abortController = new AbortController();
    fetchProperties(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    void fetchRoomsForFilter(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, [selectedPropertyId]);

  const fetchRoomsForFilter = async (signal?: AbortSignal) => {
    setRoomsLoading(true);
    try {
      const allRooms: ReturnType<typeof parsePartnerRoomsSearchResponse> = [];
      let page = 1;
      let lastPage = 1;

      do {
        const params: Record<string, string | number> = {
          page,
          per_page: ROOMS_FILTER_PER_PAGE,
        };
        if (selectedPropertyId !== ALL_PROPERTIES) {
          params.property_id = Number(selectedPropertyId);
        }
        const res: any = await partnerService.getRooms(params, { signal });
        allRooms.push(...parsePartnerRoomsSearchResponse(res));

        const roomData = res?.data ?? {};
        lastPage = Number(roomData.last_page ?? 1);
        page += 1;
      } while (page <= lastPage && !signal?.aborted);

      setRooms(allRooms);
      setSelectedRoomId('all');
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || signal?.aborted) {
        return;
      }
      toastError('Không thể tải danh sách phòng.');
      setRooms([]);
    } finally {
      if (!signal?.aborted) {
        setRoomsLoading(false);
      }
    }
  };

  const fetchProperties = async (signal?: AbortSignal) => {
    try {
      const res: any = await partnerService.getPropertyNames({ signal });
      const list = parsePartnerPropertyNamesResponse(res);
      setProperties(list);
      if (list.length === 1 && selectedPropertyId === ALL_PROPERTIES) {
        setSelectedPropertyId(String(list[0].id));
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || signal?.aborted) {
        return;
      }
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
      const propertyName = b.property_name ?? b.property_name ?? '';
      const statusLabel = getPartnerRowDisplayStatus(b.status, b.stay_status ?? '');
      const title =
        selectedPropertyId === ALL_PROPERTIES && propertyName
          ? `${propertyName} · ${label} · ${guest}`
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
          propertyId: b.property_id ?? b.property_id ?? null,
          propertyName: propertyName || undefined,
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
          propertyId: room?.property_id ?? room?.property_id ?? null,
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
  }, [calendarQuery.data, rooms, selectedPropertyId]);

  const filteredEvents = useMemo(() => {
    let list = events;
    if (selectedRoomId !== 'all') {
      list = list.filter((e) => String(e.extendedProps.roomId) === selectedRoomId);
    } else if (selectedPropertyId !== ALL_PROPERTIES) {
      list = list.filter((e) => String(e.extendedProps.propertyId) === selectedPropertyId);
    }
    return list;
  }, [events, selectedPropertyId, selectedRoomId]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const displayEvents = useMemo(() => {
    if (operationalFilter === 'all') {
      return filteredEvents;
    }

    return filteredEvents.filter((e) => {
      const p = e.extendedProps;
      switch (operationalFilter) {
        case 'arrivals':
          return p.kind === 'booking' && p.checkIn === todayStr && p.rawStatus === 1;
        case 'departures':
          return p.kind === 'booking' && p.checkOut === todayStr && p.stayStatus === 'checked_in';
        case 'in_stay':
          return p.kind === 'booking' && p.stayStatus === 'checked_in';
        case 'pending':
          return p.kind === 'booking' && p.rawStatus === 0;
        case 'blocks':
          return p.kind === 'block';
        default:
          return true;
      }
    });
  }, [filteredEvents, operationalFilter, todayStr]);

  const pendingEvents = useMemo(
    () => filteredEvents.filter((e) => e.extendedProps.kind === 'booking' && e.extendedProps.rawStatus === 0),
    [filteredEvents],
  );

  const toggleOperationalFilter = (filter: Exclude<OperationalFilter, 'all'>) => {
    setOperationalFilter((prev) => (prev === filter ? 'all' : filter));
  };

  const isPortfolioView = selectedPropertyId === ALL_PROPERTIES && selectedRoomId === 'all';
  const isMonthView = calendarViewType === 'dayGridMonth';

  const dayMaxEvents = useMemo(() => {
    if (isMonthView && isPortfolioView) return 2;
    if (isMonthView) return 4;
    return 8;
  }, [isMonthView, isPortfolioView]);

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
    const viewType = eventInfo.view?.type ?? calendarViewType;
    const monthGrid = viewType === 'dayGridMonth';
    const title = eventInfo.event.title || '';

    if (monthGrid && isPortfolioView) {
      const label = isBlock ? `⊘ ${props.roomName}` : props.roomName;
      return (
        <div className="truncate px-1 py-0.5 text-[10px] font-bold leading-tight text-white" title={title}>
          {label}
        </div>
      );
    }

    if (monthGrid) {
      const cellDate = format(eventInfo.event.start!, 'yyyy-MM-dd');
      const marker = isBlock
        ? ''
        : getCalendarDayOperationalMarker(cellDate, props.checkIn, props.checkOut, props.stayStatus);
      const guestLabel = isBlock ? 'Chặn' : formatCalendarGuestLabel(props.guestName, props.bookingId);
      const label = `${props.roomName} · ${guestLabel}${marker ? ` ·${marker}` : ''}`;
      return (
        <div
          className="flex items-center gap-1 truncate px-1 py-0.5 text-[10px] font-semibold leading-tight text-white"
          title={title}
        >
          <span className="truncate">{label}</span>
          {marker === 'IN' && (
            <span className="shrink-0 rounded bg-white/25 px-0.5 text-[8px] font-black">IN</span>
          )}
          {marker === 'OUT' && (
            <span className="shrink-0 rounded bg-white/25 px-0.5 text-[8px] font-black">OUT</span>
          )}
          {props.isLongTerm && <FileText size={9} className="shrink-0 opacity-90" />}
        </div>
      );
    }

    return (
      <div
        className={`flex w-full flex-col gap-0.5 overflow-hidden p-1.5 ${isBlock ? 'opacity-95' : ''}`}
        title={title}
        style={
          isBlock
            ? {
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 6px, transparent 6px 12px)',
              }
            : undefined
        }
      >
        <div className="truncate text-xs font-bold leading-tight text-white">{props.roomName}</div>
        <div className="truncate text-[11px] text-white/90">
          {isBlock ? props.reason || props.status : props.guestName}
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
    const viewType = arg.view?.type ?? 'dayGridMonth';
    setCalendarViewType((prev) => (prev === viewType ? prev : viewType));

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

  const handleReject = (id: number) => {
    setCancelTargetId(id);
  };

  const handleCancelSubmit = async (reason: string) => {
    if (cancelTargetId === null) {
      return;
    }
    try {
      await partnerService.cancelBooking(cancelTargetId, reason);
      toastSuccess('Đã từ chối đặt phòng.');
      invalidateCalendar();
      setSelectedEvent(null);
    } catch {
      toastError('Lỗi khi từ chối đặt phòng.');
      throw new Error('cancel_failed');
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
    return {
      arrivals: filteredEvents.filter(
        (e) => e.extendedProps.kind === 'booking' && e.extendedProps.checkIn === todayStr && e.extendedProps.rawStatus === 1,
      ).length,
      departures: filteredEvents.filter(
        (e) => e.extendedProps.kind === 'booking' && e.extendedProps.checkOut === todayStr && e.extendedProps.stayStatus === 'checked_in',
      ).length,
      inStay: filteredEvents.filter(
        (e) => e.extendedProps.kind === 'booking' && e.extendedProps.stayStatus === 'checked_in',
      ).length,
      pending: filteredEvents.filter(
        (e) => e.extendedProps.kind === 'booking' && e.extendedProps.rawStatus === 0,
      ).length,
      blocks: filteredEvents.filter((e) => e.extendedProps.kind === 'block').length,
    };
  }, [filteredEvents, todayStr]);

  useEffect(() => {
    if (operationalStats.pending > 0) {
      setEventListExpanded(true);
    }
  }, [operationalStats.pending]);

  const dialogRooms = useMemo(() => {
    return rooms.map((r: any) => ({
      id: r.id,
      label: `${r.room_number || r.title || r.name || `Phòng ${r.id}`}${
        r.property_name || r.property_name ? ` — ${r.property_name || r.property_name}` : ''
      }`,
    }));
  }, [rooms]);

  const loading = calendarQuery.isFetching;

  const sortedEventsForList = useMemo(() => {
    return [...displayEvents].sort((a, b) => a.start.localeCompare(b.start));
  }, [displayEvents]);

  const kpiItems: Array<{
    key: Exclude<OperationalFilter, 'all'>;
    label: string;
    value: number;
    tone: string;
    activeTone: string;
  }> = [
    { key: 'arrivals', label: 'Nhận phòng', value: operationalStats.arrivals, tone: 'text-emerald-600', activeTone: 'ring-emerald-400 bg-emerald-50' },
    { key: 'departures', label: 'Trả phòng', value: operationalStats.departures, tone: 'text-amber-600', activeTone: 'ring-amber-400 bg-amber-50' },
    { key: 'in_stay', label: 'Đang ở', value: operationalStats.inStay, tone: 'text-blue-600', activeTone: 'ring-blue-400 bg-blue-50' },
    { key: 'pending', label: 'Chờ duyệt', value: operationalStats.pending, tone: 'text-rose-600', activeTone: 'ring-rose-400 bg-rose-50' },
    { key: 'blocks', label: 'Chặn lịch', value: operationalStats.blocks, tone: 'text-violet-600', activeTone: 'ring-violet-400 bg-violet-50' },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900 sm:text-2xl">
                <CalendarIcon size={22} className="text-blue-600" />
                Lịch khả dụng
              </CardTitle>
              <CardDescription className="mt-1 max-w-2xl">
                Chọn <strong>một cơ sở</strong> (hoặc một phòng) để xem lịch rõ ràng. Chế độ tổng hợp chỉ dùng để rà soát nhanh.
              </CardDescription>
            </div>
            {isPartner360Enabled() && (
              <Button
                type="button"
                className="h-10 shrink-0 gap-2 rounded-lg bg-amber-600 px-4 font-semibold hover:bg-amber-700"
                onClick={() => setBlockDialogOpen(true)}
              >
                <Plus size={18} />
                Tạo block
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="property-select" className="block text-xs font-semibold text-slate-600">Cơ sở</label>
              <div className="relative">
                <Home
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                  <SelectTrigger id="property-select" className="h-10 w-full rounded-lg border-slate-200 bg-slate-50/80 pl-10 font-medium text-slate-800">
                    <SelectValue placeholder="Chọn cơ sở" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[min(16rem,60vh)] overflow-y-auto rounded-lg border-slate-200">
                    <SelectItem value={ALL_PROPERTIES}>Tất cả cơ sở (tổng hợp)</SelectItem>
                    {properties.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="room-select" className="block text-xs font-semibold text-slate-600">Phòng</label>
              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <Select value={selectedRoomId} onValueChange={setSelectedRoomId} disabled={roomsLoading}>
                  <SelectTrigger
                    id="room-select"
                    className="h-10 w-full rounded-lg border-slate-200 bg-slate-50/80 pl-10 font-medium text-slate-800 disabled:opacity-60"
                  >
                    <SelectValue placeholder={roomsLoading ? 'Đang tải…' : 'Tất cả phòng'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[min(16rem,60vh)] overflow-y-auto rounded-lg border-slate-200">
                    <SelectItem value="all">Tất cả phòng</SelectItem>
                    {rooms.map((r: any) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.room_number || r.title || r.name || `Phòng ${r.id}`}
                        {r.property_name ? ` — ${r.property_name}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border-t border-slate-100 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max min-w-full gap-2">
            {kpiItems.map((item) => {
              const isActive = operationalFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleOperationalFilter(item.key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all ${
                    isActive
                      ? `border-transparent ring-2 ${item.activeTone}`
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'
                  }`}
                  aria-pressed={isActive}
                >
                  <span className={`text-base font-black leading-none ${item.tone}`}>{item.value}</span>
                  <span className="font-medium text-slate-500">{item.label}</span>
                </button>
              );
            })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {operationalFilter !== 'all' && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2.5 text-sm text-blue-900">
          <span>
            Đang lọc: <strong>{OPERATIONAL_FILTER_LABELS[operationalFilter]}</strong>
            {' · '}
            {displayEvents.length} sự kiện
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-blue-800 hover:bg-blue-100 hover:text-blue-950"
            onClick={() => setOperationalFilter('all')}
          >
            <X size={14} />
            Xóa lọc
          </Button>
        </div>
      )}

      {pendingEvents.length > 0 && (
        <Card className="border-rose-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-rose-900">
              Cần duyệt ngay ({pendingEvents.length})
            </CardTitle>
            <CardDescription className="text-rose-700/80">
              Xử lý các yêu cầu đặt phòng chờ xác nhận trong phạm vi đang lọc.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {pendingEvents.map((e) => {
              const p = e.extendedProps;
              return (
                <div
                  key={e.id}
                  className="flex flex-col gap-3 rounded-lg border border-rose-100 bg-rose-50/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900">#{p.bookingId}</span>
                      <span className="truncate text-sm font-semibold text-slate-800">{p.guestName}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-600">
                      {p.roomName}
                      {p.propertyName ? ` · ${p.propertyName}` : ''}
                      {' · '}
                      {formatPartnerBookingDateVi(p.checkIn)} → {formatPartnerBookingDateVi(p.checkOut)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-slate-200"
                      onClick={() => setSelectedEvent(e)}
                    >
                      Chi tiết
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-rose-200 text-rose-600 hover:bg-rose-50"
                      onClick={() => handleReject(p.bookingId)}
                    >
                      Từ chối
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleApprove(p.bookingId)}
                    >
                      Duyệt ngay
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {isPortfolioView && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-amber-900">
          <Info size={18} className="mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Đang xem tổng hợp nhiều cơ sở</p>
            <p className="mt-0.5 text-xs text-amber-800/90">
              Ô lịch chỉ hiển thị mã phòng để giảm rối. Chọn một cơ sở cụ thể để thấy tên khách và điều phối chi tiết.
            </p>
          </div>
        </div>
      )}

      {overbookingCount > 0 && !isPortfolioView && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
          <AlertTriangle size={18} className="shrink-0" />
          <div className="text-sm">
            <p className="font-bold">Trùng lịch: {overbookingCount} cặp</p>
            <p className="text-xs text-rose-700">Kiểm tra các booking giao khoảng trong phạm vi đang lọc.</p>
          </div>
        </div>
      )}

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
                <Spinner size="lg" showText text="Đang đồng bộ..." />
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
              events={displayEvents}
              eventContent={renderEventContent}
              height={isPortfolioView && isMonthView ? '640px' : '680px'}
              eventClick={(info) => setSelectedEvent(info.event as unknown as CalendarEvent)}
              editable={!isPortfolioView}
              selectable={!isPortfolioView}
              selectMirror={true}
              dayMaxEvents={dayMaxEvents}
              moreLinkText={(n) => `+${n} booking`}
              eventDisplay={isMonthView ? 'block' : 'auto'}
              moreLinkClick={(info) => {
                info.jsEvent.preventDefault();
                const dayStr = format(info.date, 'yyyy-MM-dd');
                const dayEvents = displayEvents
                  .filter((e) => eventOverlapsDay(e, dayStr))
                  .sort((a, b) => {
                    const byRoom = a.extendedProps.roomName.localeCompare(b.extendedProps.roomName, 'vi', {
                      numeric: true,
                    });
                    if (byRoom !== 0) return byRoom;
                    if (a.extendedProps.rawStatus !== b.extendedProps.rawStatus) {
                      return a.extendedProps.rawStatus - b.extendedProps.rawStatus;
                    }
                    return a.extendedProps.guestName.localeCompare(b.extendedProps.guestName, 'vi');
                  });
                setDayPanel({ date: dayStr, events: dayEvents });
              }}
              eventDidMount={(info) => {
                const props = info.event.extendedProps as CalendarEventExt;
                const t =
                  props.kind === 'booking'
                    ? `${props.roomName} · ${props.guestName} · ${props.status} · #${props.bookingId}`
                    : info.event.title || '';
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

      {sortedEventsForList.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base text-slate-900">Danh sách sự kiện</CardTitle>
              <CardDescription className="text-xs">
                {formatPartnerBookingDateVi(range.from)} — {formatPartnerBookingDateVi(range.to)} ·{' '}
                {sortedEventsForList.length} mục
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-slate-600"
              onClick={() => setEventListExpanded((v) => !v)}
            >
              {eventListExpanded ? (
                <>
                  Thu gọn <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Mở rộng <ChevronDown size={16} />
                </>
              )}
            </Button>
          </CardHeader>
          {eventListExpanded && (
            <CardContent className="pt-0">
              <div className="custom-scrollbar max-h-72 overflow-y-auto rounded-lg border border-slate-100">
                <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_auto] gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:grid">
                  <span>Loại</span>
                  <span>Phòng</span>
                  <span>Chi tiết</span>
                  <span className="text-right">Trạng thái</span>
                </div>
                {sortedEventsForList.slice(0, 50).map((e) => (
                  <React.Fragment key={e.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(e)}
                      className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_auto] gap-2 border-b border-slate-50 px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 max-sm:hidden"
                    >
                      <span className="font-semibold text-slate-800">
                        {e.extendedProps.kind === 'block' ? 'Chặn' : 'Booking'}
                      </span>
                      <span className="truncate text-slate-700">{e.extendedProps.roomName}</span>
                      <span className="truncate text-slate-600">
                        {e.extendedProps.kind === 'block'
                          ? e.extendedProps.reason || e.extendedProps.status
                          : e.extendedProps.guestName}
                      </span>
                      <span className="truncate text-right text-[11px] text-slate-500">{e.extendedProps.status}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(e)}
                      className="w-full border-b border-slate-50 px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 sm:hidden"
                    >
                      <p className="font-semibold text-slate-800">{e.extendedProps.roomName}</p>
                      <p className="mt-0.5 truncate text-slate-600">
                        {e.extendedProps.kind === 'block'
                          ? e.extendedProps.reason || e.extendedProps.status
                          : e.extendedProps.guestName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">{e.extendedProps.status}</p>
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <Dialog open={dayPanel !== null} onOpenChange={(open) => !open && setDayPanel(null)}>
        <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-lg">
          {dayPanel && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Vận hành trong ngày</p>
                <h2 className="text-lg font-black text-slate-900">
                  {formatPartnerBookingDateVi(dayPanel.date)}
                </h2>
                <p className="text-xs text-slate-500">{dayPanel.events.length} sự kiện · sắp xếp theo phòng</p>
              </div>
              <div className="custom-scrollbar max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                {dayPanel.events.map((e) => {
                  const p = e.extendedProps;
                  const marker = getCalendarDayOperationalMarker(
                    dayPanel.date,
                    p.checkIn,
                    p.checkOut,
                    p.stayStatus,
                  );
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        setDayPanel(null);
                        setSelectedEvent(e);
                      }}
                      className="flex w-full items-start gap-3 rounded-lg border border-slate-100 p-3 text-left transition-colors hover:bg-slate-50"
                    >
                      <span
                        className="mt-1 h-8 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: e.backgroundColor }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900">{p.roomName}</span>
                          {marker && (
                            <Badge variant="outline" className="text-[10px]">
                              {marker === 'IN' ? 'Nhận phòng' : 'Trả phòng'}
                            </Badge>
                          )}
                          {p.isLongTerm && (
                            <Badge variant="secondary" className="text-[10px]">
                              HĐ dài hạn
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-slate-700">
                          {p.kind === 'block' ? p.reason || 'Chặn lịch' : p.guestName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {p.kind === 'booking' ? `#${p.bookingId} · ` : ''}
                          {p.status}
                          {p.kind === 'booking' && p.phone ? ` · ${p.phone}` : ''}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                          selectedEvent.extendedProps.propertyName && (
                            <p className="text-xs font-medium text-slate-500">{selectedEvent.extendedProps.propertyName}</p>
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
                    {selectedEvent.extendedProps.kind === 'booking' && (
                      <Button variant="outline" asChild className="gap-2 font-semibold">
                        <Link to={`${ROUTERS.PARTNER_BOOKINGS}?id=${selectedEvent.extendedProps.bookingId}`}>
                          <ExternalLink size={14} />
                          Xem trên trang Đặt phòng
                        </Link>
                      </Button>
                    )}
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

      <CancelBookingDialog
        open={cancelTargetId !== null}
        bookingId={cancelTargetId}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleCancelSubmit}
        title={cancelTargetId ? `Xác nhận từ chối booking #${cancelTargetId}` : undefined}
        description="Vui lòng nhập lý do từ chối. Lý do sẽ được lưu trong nhật ký để minh bạch với khách."
        confirmText="Xác nhận từ chối"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .fc-theme-standard .fc-scrollgrid { border-radius: 16px; overflow: hidden; border: 1px solid #f1f5f9; }
        .fc-header-toolbar { margin-bottom: 1rem !important; }
        .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 800 !important; color: #0f172a; text-transform: capitalize; }
        .fc-button { padding: 0.6rem 1rem !important; font-size: 0.875rem !important; font-weight: 700 !important; border-radius: 10px !important; transition: all 0.2s; border: none !important; }
        .fc-button-primary { background-color: #f8fafc !important; color: #64748b !important; border: 1px solid #e2e8f0 !important; }
        .fc-button-primary:hover { background-color: #f1f5f9 !important; color: #0f172a !important; }
        .fc-button-active { background-color: #3b82f6 !important; color: white !important; border-color: #3b82f6 !important; }
        .fc-today-button { background-color: #3b82f6 !important; color: white !important; opacity: 1 !important; }
        .fc-event { cursor: pointer; border-radius: 4px !important; margin: 1px 2px !important; box-shadow: none !important; border: none !important; min-height: 1.25rem; }
        .fc-event:hover { filter: brightness(1.05); }
        .fc-daygrid-event { padding: 0 !important; }
        .fc-daygrid-dot-event { padding: 0 2px !important; }
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

