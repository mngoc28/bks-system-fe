import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Calendar as CalendarIcon, 
  Filter, 
  Home,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { partnerService } from '@/services/partnerService';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { toastError } from '@/components/ui/toast';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    roomName: string;
    guestName: string;
    status: string;
    bookingId: number;
  };
}

const CalendarPage: React.FC = () => {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      fetchBookings();
    }
  }, [selectedBuildingId]);

  const fetchBuildings = async () => {
    try {
      const res: any = await partnerService.getBuildings();
      const list = res?.data?.data || res?.data || [];
      setBuildings(list);
      if (list.length > 0) {
        setSelectedBuildingId(String(list[0].id));
      }
    } catch (e) {
      toastError('Không thể tải danh sách bất động sản.');
    }
  };

  const getStatusColor = (status: number, stayStatus: string) => {
    if (status === 0) return '#f59e0b';
    if (status === 2) return '#ef4444';
    if (status === 3) return '#10b981';
    if (stayStatus === 'checked_in') return '#8b5cf6';
    return '#3b82f6';
  };

  const fetchBookings = async (info?: any) => {
    try {
      const res: any = await partnerService.getPartnerCalendar({ 
        building_id: selectedBuildingId,
        start_date: info?.startStr,
        end_date: info?.endStr
      });
      const bookingsData = res?.data?.data || res?.data || [];
      const newEvents = bookingsData.map((b: any) => ({
        id: String(b.id),
        title: `${b.room_name || 'Phòng'} - ${b.user_name || 'Khách'}`,
        start: b.start_date,
        end: b.end_date,
        backgroundColor: getStatusColor(b.booking_status, b.stay_status),
        borderColor: getStatusColor(b.booking_status, b.stay_status),
        extendedProps: {
          roomName: b.room_name || 'N/A',
          guestName: b.user_name || 'N/A',
          status: b.booking_status === 3 ? 'Done' : (b.booking_status === 1 ? 'Confirmed' : 'Pending'),
          bookingId: b.id
        }
      }));
      setEvents(newEvents);
    } catch (e) {
      toastError('Không thể tải lịch đặt phòng.');
    }
  };

  const renderEventContent = (eventInfo: any) => {
    return (
      <div className="p-1 overflow-hidden">
        <div className="font-bold text-[10px] truncate">{eventInfo.event.extendedProps.roomName}</div>
        <div className="text-[9px] truncate opacity-90">{eventInfo.event.extendedProps.guestName}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="text-blue-600" />
            Lịch khả dụng & Đặt phòng
          </h1>
          <p className="text-sm text-slate-500">Xem và quản lý lịch trình của khách hàng theo thời gian.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Select value={selectedBuildingId} onValueChange={setSelectedBuildingId}>
              <SelectTrigger className="w-[240px] pl-10 h-11 rounded-xl border-slate-200">
                <SelectValue placeholder="Chọn bất động sản" />
              </SelectTrigger>
              <SelectContent>
                {buildings.map(b => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="h-11 rounded-xl gap-2 text-slate-600">
            <Filter size={18} /> Lọc
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Info size={16} className="text-blue-500" />
                Chú giải trạng thái
             </h3>
             <div className="space-y-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-sm text-slate-600 font-medium">Chờ xác nhận</span>
                   </div>
                   <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 uppercase text-[10px]">Pending</Badge>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm text-slate-600 font-medium">Đã xác nhận</span>
                   </div>
                   <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 uppercase text-[10px]">Confirmed</Badge>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-violet-500" />
                      <span className="text-sm text-slate-600 font-medium">Đang lưu trú</span>
                   </div>
                   <Badge variant="outline" className="bg-violet-50 text-violet-600 border-violet-100 uppercase text-[10px]">In Stay</Badge>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-sm text-slate-600 font-medium">Hoàn tất</span>
                   </div>
                   <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase text-[10px]">Done</Badge>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4">Hoạt động sắp tới</h3>
             <div className="space-y-4">
                {events.filter(e => {
                   const eventDate = new Date(e.start);
                   const today = new Date();
                   today.setHours(0, 0, 0, 0);
                   return eventDate >= today;
                }).slice(0, 5).map(e => (
                   <div key={e.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer">
                      <div className="text-xs font-bold text-blue-600 mb-1">{e.extendedProps.roomName}</div>
                      <div className="text-sm font-semibold text-slate-800">{e.extendedProps.guestName}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                         {format(new Date(e.start), 'dd/MM')} - {format(new Date(e.end), 'dd/MM')}
                      </div>
                   </div>
                ))}
                {events.length === 0 && (
                   <div className="text-center py-6 text-slate-400 italic text-sm">Không có lịch sắp tới</div>
                )}
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale="vi"
                events={events}
                eventContent={renderEventContent}
                height="700px"
                eventClick={(info) => {
                  alert(`Chi tiết đặt phòng: ${info.event.title}`);
                }}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
              />
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .fc-theme-standard .fc-scrollgrid { border-radius: 12px; overflow: hidden; }
        .fc-header-toolbar { margin-bottom: 1.5rem !important; }
        .fc-button-primary { background-color: #3b82f6 !important; border-color: #3b82f6 !important; font-weight: 600 !important; }
        .fc-button-primary:hover { background-color: #2563eb !important; border-color: #2563eb !important; }
        .fc-button-active { background-color: #1e40af !important; border-color: #1e40af !important; }
        .fc-event { cursor: pointer; border-radius: 4px !important; padding: 2px !important; border: none !important; }
        .fc-daygrid-event-dot { border-color: #3b82f6 !important; }
        .fc-v-event { background-color: #3b82f6; }
      `}} />
    </div>
  );
};

export default CalendarPage;
