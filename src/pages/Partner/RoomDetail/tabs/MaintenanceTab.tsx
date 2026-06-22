import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Plus, Wrench, Calendar } from 'lucide-react';
import { MaintenanceRequest } from '../../types';
import { cn } from '@/lib/utils';
import { getMaintenanceStatusStyle } from '@/utils/partnerMaintenanceDisplay';

interface MaintenanceTabProps {
  maintenances: MaintenanceRequest[];
  isLoading?: boolean;
  openMaintenanceDialog: () => void;
  handleMaintenanceStatusUpdate: (id: number | string, status: 'in_progress' | 'completed') => Promise<void>;
  updatingMaintenanceId: number | string | null;
  setCancelMaintenanceTarget: (m: MaintenanceRequest) => void;
}

export const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  maintenances,
  isLoading,
  openMaintenanceDialog,
  handleMaintenanceStatusUpdate,
  updatingMaintenanceId,
  setCancelMaintenanceTarget,
}) => {
  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <Spinner size="lg" showText text="Đang tải lịch sử bảo trì..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold uppercase tracking-tighter text-slate-900 sm:text-xl">Bảo trì & sự cố</h3>
          <p className="mt-1 text-xs text-slate-500">Theo dõi và đăng ký lịch bảo trì cho phòng này.</p>
        </div>
        <Button
          onClick={openMaintenanceDialog}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-blue-700 sm:w-auto"
        >
          <Plus size={16} /> Đăng ký bảo trì
        </Button>
      </div>

      {maintenances.length > 0 ? (
        maintenances.map((m) => (
          <Card key={m.id} className="overflow-hidden rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/30 transition-all duration-500 hover:shadow-blue-100/50 bg-white">
            <CardContent className="flex flex-col items-start justify-between gap-4 p-4 sm:p-6 md:flex-row md:items-center md:gap-8 lg:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
                <div className={cn(
                  "p-6 rounded-[1.75rem] shadow-lg flex-shrink-0 flex items-center justify-center h-fit w-fit",
                  m.status === 'Đã hoàn thành' ? 'bg-emerald-500 text-white shadow-emerald-100' :
                  m.status === 'Đã hủy' ? 'bg-slate-400 text-white shadow-slate-100' :
                  'bg-amber-500 text-white shadow-amber-100'
                )}>
                  <Wrench size={32} />
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-xl font-bold uppercase tracking-tight text-slate-800">{m.title || m.type}</h4>
                    <Badge variant="outline" className={cn(
                      "text-[9px] uppercase font-bold px-4 py-1 rounded-full border",
                      getMaintenanceStatusStyle(m.status)
                    )}>{m.status}</Badge>
                  </div>
                  <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-500">{m.description || 'Sự cố đã được ghi nhận và xử lý.'}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase text-slate-400 shadow-sm">
                      <Calendar size={14} className="text-blue-500" /> Báo lỗi: {new Date(m.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="text-[11px] font-semibold italic text-slate-300">Ref ID: #{String(m.id).padStart(5, '0')}</span>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-wrap gap-2 md:w-auto md:justify-end">
                {(m.status === 'Chờ xử lý' || m.status === 'Đang chờ') && (
                  <Button
                    onClick={() => handleMaintenanceStatusUpdate(m.id, 'in_progress')}
                    disabled={updatingMaintenanceId === m.id}
                    className="h-11 rounded-xl bg-amber-500 px-5 text-xs font-bold uppercase text-white hover:bg-amber-600"
                  >
                    Tiếp nhận
                  </Button>
                )}
                {(m.status === 'Đang xử lý' || m.status === 'Đang sửa') && (
                  <Button
                    onClick={() => handleMaintenanceStatusUpdate(m.id, 'completed')}
                    disabled={updatingMaintenanceId === m.id}
                    className="h-11 rounded-xl bg-emerald-600 px-5 text-xs font-bold uppercase text-white hover:bg-emerald-700"
                  >
                    Hoàn thành
                  </Button>
                )}
                {(m.status === 'Chờ xử lý' || m.status === 'Đang chờ' || m.status === 'Đang xử lý' || m.status === 'Đang sửa') && (
                  <Button
                    variant="outline"
                    onClick={() => setCancelMaintenanceTarget(m)}
                    disabled={updatingMaintenanceId === m.id}
                    className="h-11 rounded-xl border-red-200 px-5 text-xs font-bold uppercase text-red-600 hover:bg-red-50"
                  >
                    Hủy
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-24 text-center">
          <Wrench className="mx-auto mb-6 text-slate-200" size={64} />
          <p className="text-xs font-bold uppercase italic tracking-[0.2em] text-slate-400">Phòng này trong tình trạng bảo trì hoàn hảo</p>
          <Button
            onClick={openMaintenanceDialog}
            className="mt-6 rounded-xl bg-blue-600 px-5 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700"
          >
            Đăng ký bảo trì
          </Button>
        </div>
      )}
    </div>
  );
};
