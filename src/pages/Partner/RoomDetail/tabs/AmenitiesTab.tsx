import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { Room } from '../../types';

interface AmenitiesTabProps {
  room: Room;
}

export const AmenitiesTab: React.FC<AmenitiesTabProps> = ({ room }) => {
  return (
    <div className="grid grid-cols-1 gap-12 animate-in fade-in slide-in-from-bottom-4 md:grid-cols-2">
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h3 className="flex items-center gap-3 text-xl font-bold uppercase tracking-tighter text-slate-900">
            <div className="h-8 w-2 rounded-full bg-amber-500" /> Tiện ích nội thất
          </h3>
          <Badge variant="outline" className="border-amber-100 font-semibold text-amber-600">{room.amenities.length} items</Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {room.amenities.length > 0 ? room.amenities.map((a: any, i: number) => (
            <div key={i} className="group flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:border-amber-100 hover:shadow-lg">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-500 transition-transform group-hover:scale-110"><CheckCircle size={20} /></div>
              <span className="text-sm font-bold uppercase tracking-tight text-slate-700">{a.name}</span>
            </div>
          )) : <div className="col-span-full rounded-xl border-2 border-dashed border-slate-100 py-12 text-center italic text-slate-400">Chưa cấu hình tiện ích</div>}
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h3 className="flex items-center gap-3 text-xl font-bold uppercase tracking-tighter text-slate-900">
            <div className="h-8 w-2 rounded-full bg-blue-500" /> Dịch vụ tòa nhà
          </h3>
          <Badge variant="outline" className="border-blue-100 font-semibold text-blue-600">{room.services.length} items</Badge>
        </div>
        <div className="space-y-4">
          {room.services.length > 0 ? room.services.map((s: any, i: number) => (
            <div key={i} className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-100 hover:shadow-xl">
              <div className="flex items-center gap-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-[10px] font-bold uppercase tracking-tighter text-blue-500 shadow-sm">{s.unit || 'Tháng'}</div>
                <span className="text-base font-bold tracking-tight text-slate-800">{s.name}</span>
              </div>
              <span className="text-xl font-bold text-blue-600 transition-transform group-hover:scale-110">{Number(s.price || 0).toLocaleString()} <span className="text-xs">đ</span></span>
            </div>
          )) : <div className="rounded-xl border-2 border-dashed border-slate-100 py-12 text-center italic text-slate-400">Chưa có dịch vụ nào</div>}
        </div>
      </div>
    </div>
  );
};
