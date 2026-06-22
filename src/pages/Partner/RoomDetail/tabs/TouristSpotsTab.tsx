import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Plus, Compass, MapPin, Star, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TouristSpotsTabProps {
  spotMaps: any[];
  isLoadingSpotMaps: boolean;
  setSelectedSpotMap: (item: any | null) => void;
  setIsSpotDialogOpen: (open: boolean) => void;
  handleSpotDelete: (id: number) => void;
}

export const TouristSpotsTab: React.FC<TouristSpotsTabProps> = ({
  spotMaps,
  isLoadingSpotMaps,
  setSelectedSpotMap,
  setIsSpotDialogOpen,
  handleSpotDelete,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold uppercase tracking-tighter text-slate-900 sm:text-xl">
            Địa điểm du lịch lân cận
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Quản lý danh sách các địa điểm du lịch xung quanh phòng này và thông tin di chuyển.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedSpotMap(null);
            setIsSpotDialogOpen(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-blue-700 sm:w-auto"
        >
          <Plus size={16} /> Gán địa điểm mới
        </Button>
      </div>

      {isLoadingSpotMaps ? (
        <div className="py-12 text-center">
          <Spinner size="lg" showText text="Đang tải danh sách địa điểm..." />
        </div>
      ) : spotMaps.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center animate-in fade-in">
          <Compass className="mx-auto mb-6 text-slate-200" size={64} />
          <p className="text-xs font-bold uppercase italic tracking-[0.2em] text-slate-400">
            Chưa gán địa điểm du lịch nào cho phòng này
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Mobile view */}
          <div className="space-y-3 p-3 md:hidden">
            {spotMaps.map((item: any) => (
              <div key={`mobile-spot-${item.id}`} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">{item.tourist_spot?.name}</p>
                    {item.note && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.note}</p>}
                  </div>
                  {item.is_primary && (
                    <Badge className="shrink-0 rounded-full border-amber-200 bg-amber-50 text-[9px] font-bold uppercase text-amber-700">Chính</Badge>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2 text-center">
                    <p className="text-slate-400">Khoảng cách</p>
                    <p className="font-bold text-slate-700">{item.distance_km != null ? `${item.distance_km} km` : '-'}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 text-center">
                    <p className="text-slate-400">Thời gian</p>
                    <p className="font-bold text-slate-700">{item.travel_time_minutes} phút</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setSelectedSpotMap(item); setIsSpotDialogOpen(true); }} className="h-8 flex-1 text-xs sm:flex-none">
                    <Edit size={14} className="mr-1" /> Sửa
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSpotDelete(item.id)} className="h-8 flex-1 text-xs text-rose-600 sm:flex-none">
                    <Trash2 size={14} className="mr-1" /> Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900 text-xs uppercase tracking-wider text-white">
                  <th className="px-6 py-4 text-left font-bold opacity-80">Địa điểm du lịch</th>
                  <th className="px-6 py-4 text-center font-bold opacity-80">Khoảng cách</th>
                  <th className="px-6 py-4 text-center font-bold opacity-80">Thời gian đi</th>
                  <th className="px-6 py-4 text-center font-bold opacity-80">Nguồn dữ liệu</th>
                  <th className="px-6 py-4 text-right font-bold opacity-80">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {spotMaps.map((item: any) => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {item.tourist_spot?.name}
                            </span>
                            {item.is_primary && (
                              <Badge className="flex items-center gap-1 rounded-full border-amber-200 bg-amber-50 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                                <Star size={10} className="shrink-0 fill-amber-500 text-amber-500" />
                                Chính
                              </Badge>
                            )}
                          </div>
                          {item.note && (
                            <p className="mt-0.5 line-clamp-1 max-w-sm text-xs text-slate-400">
                              {item.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-semibold text-slate-700">
                      {item.distance_km != null ? `${item.distance_km} km` : '-'}
                    </td>
                    <td className="px-6 py-5 text-center font-semibold text-slate-700">
                      {item.travel_time_minutes} phút
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Badge className={cn(
                        "px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-widest border border-slate-200/50 shadow-none",
                        item.source_type === 'estimated'
                          ? "bg-slate-50 text-slate-600 border-slate-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {item.source_type === 'estimated' ? 'Ước lượng' : 'Thủ công'}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSpotMap(item);
                            setIsSpotDialogOpen(true);
                          }}
                          className="h-8 rounded-lg border-slate-200 text-xs text-slate-600 hover:border-blue-200 hover:text-blue-600"
                        >
                          <Edit size={14} className="mr-1" /> Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSpotDelete(item.id)}
                          className="h-8 rounded-lg border-slate-200 text-xs text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                        >
                          <Trash2 size={14} className="mr-1" /> Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
